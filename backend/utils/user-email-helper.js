const logger = require('../utils/logger');
const sendEmail = require('../services/emailService');
const mailOptions = require('../templates/sellerRegisterOption');
const sellerApprovalStatusMail = require('../templates/sellerApprovalOptions');


const sellerRegisterEmailHelper=async (email,name)=>{
    try {
        const otpSendOptions=mailOptions(email,name);
        const info = await sendEmail(otpSendOptions);
        logger.info('Email sent:', info.response);
    } catch (error) {
        logger.error('Error sending email:', error.message);
    }
}

// seller approval status update email helper
const sellerApprovalEmailHelper = async(email,name,shopName,approvalStatus)=>{
    try {
        const info = await sendEmail(sellerApprovalStatusMail(email,name,shopName,approvalStatus));
        logger.info('Email sent:', info.response);
    } catch (error) {
        logger.error('Error sending email:', error.message);
    }
}


module.exports={
    sellerRegisterEmailHelper,
    sellerApprovalEmailHelper
};