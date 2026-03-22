const logger = require('../utils/logger');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const {sellerRegisterEmailHelper} = require('../utils/user-email-helper');

// seller registration
const registerSeller = async (req,res)=>{
    try {
        logger.info('register-seller endpoint hit');
        const userId = req.info.userId;
        // check shop name is provided
        const {shopName} = req.body;
        if(!shopName){
            logger.warn('missing shop name for register as seller');
            return res.status(400).json({
                success:false,
                message:'shop name is required to register as seller'
            })
        }
        const shopDescription = req.body.shopDescription || '';
        const businessAddress = req.body.businessAddress || '';
        const bankDetails = req.body.bankDetails || {};
        const sellerData = {
            userId,
            shopName,
            shopDescription,
            businessAddress,
            bankDetails
        };
        // check if profile is completed
        
        const user = await User.findOne({_id:userId});
        if(!user.isProfileCompleted){
            logger.warn('seller profile incomplete, registration failed');
            return res.status(400).json({
                success:false,
                message:'Complete your profile first to register as seller'
            })
        }
        // check if seller profile alread
        const existingSeller = await SellerProfile.findOne({userId});
        if(existingSeller){
            logger.warn('seller profile already exists for this user');
            return res.status(400).json({
                success:false,
                message:'Seller profile already exists for this user'
            })
        }
        const newSellerProfile = new SellerProfile(sellerData);
        await newSellerProfile.save();
        logger.info('seller registered successfully');
        await sellerRegisterEmailHelper(user.email,user.name);
        res.status(201).json({
            success:true,
            message:'seller registered successfully',
            newSellerProfile
        })
    } catch (error) {
        logger.error('Error occurred while registering seller: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// get seller profile
const getSellerProfile = async(req,res)=>{
    logger.info('get seller-profile endpoint hit');
    try {
        const userId = req.info.userId;
        const sellerProfile = await SellerProfile.findOne({userId}).populate('userId','name email');
        if(!sellerProfile){
            logger.warn('seller profile not found for this user');
            return res.status(404).json({
                success:false,
                message:'Seller profile not found for this user'
            })
        }
        logger.info('seller profile retrieved successfully');
        res.status(200).json({
            success:true,
            message:'seller profile retrieved successfully',
            sellerProfile
        })
    } catch (error) {
        logger.error('Error occurred while getting seller profile: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// update seller profile
const updateSellerProfile = async(req,res)=>{
    logger.info('update seller profile endpoint hit ');
    try {
        const userId = req.info.userId;
        const sellerProfile = await SellerProfile.findOne({userId});
        if(!sellerProfile){
            logger.warn('seller profile not found for this user');
            return res.status(404).json({
                success:false,
                message:'Seller profile not found for this user'
            })
        }
        const updates = {
            shopName: req.body.shopName || sellerProfile.shopName,
            shopDescription: req.body.shopDescription || sellerProfile.shopDescription,
            businessAddress: req.body.businessAddress || sellerProfile.businessAddress,
            bankDetails: req.body.bankDetails || sellerProfile.bankDetails
        };
        const updatedSellerProfile = await SellerProfile.findOneAndUpdate({userId},updates,{new:true});
        if(!updatedSellerProfile){
            logger.warn('seller profile update failed');
            return res.status(404).json({
                success:false,
                message:'seller profile update failed'
            })
        }
        logger.info('seller profile updated successfully');
        res.status(200).json({
            success:true,
            message:'seller profile update successfully',
            updatedSellerProfile
        })
    } catch (error) {
        logger.error('Error occurred while updating seller profile: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// delete seller profile
const deleteSellerProfile = async(req,res)=>{
    logger.info('delete- profile endpoint hit');
    try {
        res.status(303).json({
            success:false,
            message:"implementation in progress"
        })
    } catch (error) {
        logger.error('seller profile deletion failed due to err: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    } 
}

module.exports = {
    registerSeller,
    getSellerProfile,
    updateSellerProfile,
    deleteSellerProfile
};
