const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
// authenticate
const authenticate = async(req,res,next)=>{
    logger.info('authenticate endpoin hit');
    try {
        const authHeader=req.headers['authorization'];
        if(!authHeader){
            logger.error('authentication error, no token provided');
            return res.status(400).json({
                sucess:false,
                message:'authentication failed, no token provided'
            })
        }
        const accessToken=authHeader.split(' ')[1];
        if(!accessToken){
            logger.error('authentication error, please provide token');
            return res.status(400). json({
                sucess:false,
                message:'authentication failed,please provide token'
            })
        }
        const decodedToken=jwt.verify(accessToken,process.env.JWT_SECRET_KEY);
        req.info=decodedToken;
        logger.info('authenticated successfully');
        next();
    } catch (error) {
        if(error.name === 'TokenExpiredError'){
            logger.warn('authentication failed, token expired');
            return res.status(401).json({
                sucess:false,
                message:'authentication failed, token expired'
            });
        }
        logger.error('authentication failed: ',error);
        return res.status(500).json({
            sucess:false,
            message:'Internal server error'
        })
    }
}
// buyer
const buyerAuth = async(req,res,next)=>{
    logger.info('buyer auth middleware endpoint hit');
    try {
        if(req.info.role == 'buyer'){
            logger.info('buyer authenticated');
            return next();
        }
        logger.warn('buyer authorization failed');
        res.status(403).json({
            success:false,
            message:'buyer access only, authorization failed'
        })
    } catch (error) {
        logger.error('buyer authentication failed: ',error);
        return res.status(500).json({
            sucess:false,
            message:'Internal server error'
        })
    }
}

// seller
const sellerAuth = async(req,res,next)=>{
    logger.info('seller auth middleware endpoint hit');
    try {
        if(req.info.role == 'seller'){
            logger.info('seller authenticated');
            return next();
        }
        logger.warn('seller authorization failed');
        res.status(403).json({
            success:false,
            message:'seller access only, authorization failed'
        })
    } catch (error) {
        logger.error('seller authentication failed: ',error);
        return res.status(500).json({
            sucess:false,
            message:'Internal server error'
        })
    }
}

// admin
const adminAuth = async(req,res,next)=>{
    logger.info('admin auth middleware endpoint hit');
    try {
        if(req.info.role == 'admin'){
            logger.info('admin authenticated');
            return next();
        }
        logger.warn('admin authorization failed');
        res.status(403).json({
            success:false,
            message:'admin access only, authorization failed'
        })
    } catch (error) {
        logger.error('admin authentication failed: ',error);
        return res.status(500).json({
            sucess:false,
            message:'Internal server error'
        })
    }
}
// user and admin both
const AdminUserAuth = async(req,res,next)=>{
    logger.info('admin and user auth middleware endpoint hit');
    try {
        if(req.info.role == 'admin'){
            logger.info('admin authenticated');
            return next();
        }
        else{
            let user = await User.findOne({_id:req.info.userId});
            const isOwner = user.email === req.info.email;
            if(isOwner){
                logger.info('user authenticated');
                return next();
            } 
        }
        logger.warn('admin and user both authorization failed');
        res.status(403).json({
            success:false,
            message:'admin and user both access only, authorization failed'
        })
    } catch (error) {
        logger.error('admin and user authentication failed: ',error);
        return res.status(500).json({
            sucess:false,
            message:'Internal server error'
        })
    }
}

// seller and admin both
const AdminSellerAuth = async(req,res,next)=>{
    logger.info('admin and seller auth middleware endpoint hit');
    try {
        if(req.info.role == 'admin'){
            logger.info('admin authenticated');
            return next();
        }
        else{
            const user = await User.findOne({_id:req.info.userId});
            if(!user){
                logger.warn('seller profile not found ,first complete profile ');
                return res.status(404).json({
                    success:false,
                    message:'seller profile not found ,first complete profile'
                })
            }
            const sellerProfile = await SellerProfile.findOne({userId:req.info.userId});
            if(sellerProfile.approvalStatus === 'pending'){
                logger.warn("seller approval status pending,so you can't see your profile");
                return res.status(403).json({
                    sucess:false,
                    message:"seller approval status pending"
                })
            }
            const isOwner = user.email === req.info.email;
            const role = user.role === req.info.role;
            if(isOwner && role){
                logger.info('seller authenticated');
                return next();
            } 
        }
        logger.warn('admin and seller both authorization failed');
        res.status(403).json({
            success:false,
            message:'admin and seller both access only, authorization failed'
        })
    } catch (error) {
        logger.error('admin and seller authentication failed: ',error);
        return res.status(500).json({
            sucess:false,
            message:'Internal server error'
        })
    }
}
module.exports = {
    authenticate,
    buyerAuth,
    sellerAuth,
    adminAuth,
    AdminUserAuth,
    AdminSellerAuth
}