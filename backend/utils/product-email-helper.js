const logger = require('../utils/logger');
const sendEmail = require('../services/emailService');
const productApprovalPendingMail = require('../templates/productRegisterOptions');
const productApprovalStatusMail = require('../templates/productApprovalOptions');
const sellerProductDeletionMail = require('../templates/productDeleteBySeller');
const adminProductDeletionMail = require('../templates/productDeleteByAdmin');
// product registeration 
const productregisterEmailhelper = async(email,name,productName)=>{
    try {
        const info = await sendEmail(productApprovalPendingMail(email,name,productName));
        logger.info('Email sent:', info.response);
    } catch (error) {
        logger.error('Error sending email:', error.message);
    }
}

// product approval status update
const productApprovalStatusEmailHelper = async(email,sellerName,productName,sellerApprovalStatusMail,rejectionReason)=>{
    try {
        const info = await sendEmail(productApprovalStatusMail(email,sellerName,productName,sellerApprovalStatusMail,rejectionReason));
        logger.info('Email sent:', info.response);
    } catch (error) {
        logger.error('Error sending email:', error.message);
    }
}

// product delete by seller
const sellerProductDeletionEmailHelper = async(email,sellerName,productName)=>{
    try {
        const info = await sendEmail(sellerProductDeletionMail(email,sellerName,productName));
        logger.info('Email sent:', info.response);
    } catch (error) {
        logger.error('Error sending email:', error.message);
    }
}

// product delete by admin
const adminProductDeletionEmailHelper = async(email,sellerName,productName,deletionReason)=>{
    try {
        const info = await sendEmail(adminProductDeletionMail(email,sellerName,productName,deletionReason));
        logger.info('Email sent:', info.response);
    } catch (error) {
        logger.error('Error sending email:', error.message);
    }
}
module.exports = {
    productregisterEmailhelper,
    productApprovalStatusEmailHelper,
    sellerProductDeletionEmailHelper,
    adminProductDeletionEmailHelper
}