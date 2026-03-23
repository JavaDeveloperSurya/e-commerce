const logger=require('../utils/logger');
const sendEmail=require('../services/emailService');
const mailOptions=require('../templates/otpMailOptions');

const sendOtp=async (userEmail,otp)=>{
    try {
        // console.log(otp)
        const otpSendOptions=mailOptions(userEmail,otp);
        const info = await sendEmail(otpSendOptions);
        logger.info('Email sent:', info.response);
    } catch (error) {
        logger.error('Error sending email:', error.message);
    }
}

const compareOtp=(otp,redisOtp)=>{
    if(otp===redisOtp) 
        return true 
    else 
        return false;
}
module.exports={sendOtp,compareOtp};