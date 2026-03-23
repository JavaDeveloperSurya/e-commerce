const logger = require('../utils/logger');
const {loginValidation}=require('../validators/authValidator');
const User=require('../models/User');
const RefreshToken=require('../models/RefreshToken');
const Admin = require('../models/Admin');
const redisClient=require('../config/redis');
const {sendOtp,compareOtp}=require('../utils/login-otp');
const generateTokens=require('../utils/generateTokens');
const generateOTP = require('../utils/generateOtp');

// login
const login=async(req,res)=>{
    logger.info('Login endpoint hit....');
    const {email}=req.body;
    try {
        // validation
        const {error}=loginValidation(req.body);
        if(error){
            logger.error('login failed due to Validation Error',error.details[0].message);
            return res.status(400).json({
                sucess:false,
                message:error.details[0].message
            });
        }
        // checck admin email
        if(email === process.env.EMAIL_USER){
            const admin = await Admin.findOne({email});
            if(admin){
                await RefreshToken.deleteOne({user: admin._id});
            }
            const {token,otp} = await generateOTP(email);
            await sendOtp(email, otp);
            logger.info('admin email,otp sent to email');
            return res.status(200).json({
                success:true,
                message:'otp sent to your email',
                Token:token
            })
        }
        // email not exist
        let user=await User.findOne({email});
        if(!user){
           logger.warn('User does not exist,store the email and role as buyer');
             user=new User({email,role:'buyer'});
             await user.save();
        }
        else {
            logger.info('user exist ,check user is blocked or not');
            if(user.isBlocked){
                logger.warn("user blocked, so can't login");
                return res.status(403).json({
                    success:false,
                    message:"user is blocked for this platform, so login can't proceed"
                })
            }
        }
        // 
        await RefreshToken.deleteOne({user:user._id});
        // generate a token and also otp ,store in redis
        const {token,otp} = await generateOTP(email);
        await sendOtp(email, otp);
        res.status(200).json({
            sucess:true,
            message:`otp send to your gmail`,
            Token:token
        })
    } catch (error) {
        logger.error('login failed due to error: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// user verify-otp
const verifyOtp=async(req,res)=>{
    logger.info('verify otp endpoint hit.....');
    try {
        const {token,otp}=req.body;
        if(!token || !otp){
            logger.warn('token or otp missing');
            return res.status(400).json({
                sucess:false,
                message:'token or otp missing'
            })
        }
        const key=`otp:${token}`;
        const rawData=await redisClient.get(key);
        
        // validate data
        if(!rawData){
            logger.warn('token and otp not present in redis');
            return res.status(400).json({
                sucess:false,
                message:'OTP expired or invalid token'
            })
        }
        // check attempts
        const data=JSON.parse(rawData);
        if(data.attemptsLeft<=0){
            logger.warn('too many attempts ');
            await redisClient.del(key);
            return res.status(400).json({
                sucess:false,
                message:'Too many attempts,please login after few time'
            })
        }
        // match the otp
        const isOtpMatch=compareOtp(otp,data.otp);
        if(!isOtpMatch){
            logger.warn(`Invalid otp: attempts ${data.attemptsLeft}`);
            data.attemptsLeft-=1;
            await redisClient.set(key,JSON.stringify(data),'EX',300);
            return res.status(400).json({
                sucess:false,
                message:'Invalid attempts',
                attemptsLeft:data.attemptsLeft
            })
        }
        // if the otp match
        const email=data.email;
        await redisClient.del(key);
        const {accessToken,refreshToken}=await generateTokens(email);
        logger.info('otp verify sucessfully');
        res.status(200).json({
            sucess:true,
            message:'otp verify sucessfully',
            accessToken,
            refreshToken
        });
    } catch (error) {
        logger.error('verify-otp failed due to error: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// resend otp
const resendOtp = async (req,res)=>{
    logger.info('resend otp endpoint hit....');
    try{
        const {token} = req.body;
        logger.info('resend otp for token: ',token);
        if(!token){
            logger.warn('token missing');
            return res.status(400).json({
                success:false,
                message:'token missing'
            })
        }

        const key = `otp:${token}`;
        const rawData = await redisClient.get(key);
        if(!rawData){
            logger.warn('token not present in redis');
            return res.status(400).json({
                success:false,
                message:'OTP expired or invalid token'
            })
        }

        const data = JSON.parse(rawData);
        const { email } = data;

        const ttl = await redisClient.ttl(key);

        const newOtp = (Math.floor(100000 + Math.random()*900000)).toString();

        const updatedData = {
            email,
            otp:newOtp,
            attemptsLeft:5
        };

        await redisClient.set(key,JSON.stringify(updatedData),'EX',ttl);
        logger.info(`New OTP generated for ${email}, attempts reset to 5, TTL: ${ttl} seconds`);
        await sendOtp(email,newOtp);

        logger.info(`New OTP resent successfully to ${email}`);

        res.status(200).json({
            success:true,
            message:'New OTP sent successfully',
            token
        });

    }catch(error){
        logger.error('resend otp failed due to error: ',error);

        res.status(500).json({
            success:false,
            message:'Internal server error'
        });
    }
}

// user refresh token
const refreshToken=async (req,res)=>{
    logger.info('refresgh token endpoint hit...');
    try {
        const {refreshToken}=req.body;
        if(!refreshToken){
            logger.warn('refresh token missing');
            return res.status(400).json({
                sucess:false,
                message:'refresh token missing'
            })
        }
        // get data from refreshtoken 
        const storedRefreshToken=await RefreshToken.findOne({token:refreshToken});
        if(!storedRefreshToken || storedRefreshToken.expiresAt<new Date()){
            logger.warn('Invalid or expired refresh token');
            return res.status(400).json({
                sucess:false,
                message:'Invalid or expire refresh token'
            })
        }
        // extract user or admin
        const user=await User.findById(storedRefreshToken.user);
        const admin = user ? null : await Admin.findById(storedRefreshToken.user);
        const account = user || admin;
        if(!account){
            logger.warn('user not found');
            return res.status(400).json({
                sucess:false,
                message:'user not found'
            })
        }
        // generate new tokens
        const {accessToken:newAccessToken,refreshToken:newRefreshToken}=await generateTokens(account.email);
        // delete the previous token
        await RefreshToken.deleteOne({_id:storedRefreshToken._id});
        logger.info('token refreshed sucessfully');
        res.status(200).json({
            accessToken:newAccessToken,
            refreshToken:newRefreshToken
        })
    } catch (error) {
        logger.error('refresh token failed due to error: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// user logout
const logout=async (req,res)=>{
    logger.info('logout user endpoint hit...');
    try {
        const {refreshToken}=req.body;
        if(!refreshToken){
            logger.warn('refresh token missing');
            return res.status(400).json({
                sucess:false,
                message:'refresh token missing'
            });
        }
        // find user from refreshtoken 
        const data= await RefreshToken.findOne({token:refreshToken});
        if(!data){
            logger.warn('Invalid refresh token');
            return res.status(400).json({
                sucess:false,
                message:'Invalid refresh token'
            });
        }
        const user=await User.findById(data.user);
        
        const admin = user ? null : await Admin.findById(data.user);

        if(!user && !admin){
            logger.warn('Invalid refresh token');
            return res.status(400).json({
                sucess:false,
                message:'Invalid refresh token'
            });
        }
        await RefreshToken.deleteOne({token:refreshToken});
        logger.info('refresh token deleted successfully for logout');

        res.status(200).json({
            sucess:true,
            message:'User logout sucessfully'
        })
    } catch (error) {
        logger.error('logout failed due to error: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

module.exports={login,verifyOtp,resendOtp,refreshToken,logout};