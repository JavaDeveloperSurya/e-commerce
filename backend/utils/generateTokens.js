const crypto=require('crypto');
const jwt=require('jsonwebtoken');
const RefreshToken=require('../models/RefreshToken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const logger = require("../utils/logger");

// generate both accessToken and refreshToken
const generateTokens=async (email)=>{
    try {
        logger.info(`Generating tokens for user: ${email}`);
        let account = await User.findOne({ email });

        if (!account) {
            account = await Admin.findOne({ email });
        }

        if (!account) {
            logger.warn(`Token generation failed - user not found: ${email}`);
            throw new Error("User not found");
        }
        // access token with 15 minutes expiry
        const accessToken=jwt.sign({
            userId: account._id,
            email: account.email,
            role: account.role
        }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });

        // refresh token with 7 days expiry
        const refreshToken=crypto.randomBytes(40).toString('hex');
        const expiresAt=new Date();
        expiresAt.setDate(expiresAt.getDate()+7); //refresh token in 7 every 7 days 
        await RefreshToken.create({
            token:refreshToken,
            user:account._id,
            expiresAt
        });
        logger.info(`Tokens generated successfully for userId: ${account._id}`);
        return {accessToken,refreshToken};
    } catch (error) {
        logger.error('Error generating tokens:', error.message);
        throw error;
    }
}

module.exports=generateTokens;