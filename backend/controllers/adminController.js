const logger = require('../utils/logger');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const {sellerApprovalEmailHelper} = require('../utils/user-email-helper')
// get all users
const getAllUsers = async(req,res)=>{
    logger.info('fetching all users endpoint hit');
    try {
        const users = await User.find({});
        res.status(200).json({
            success:true,
            message:'all users fetched successfully',
            users
        })
    } catch (error) {
        logger.error('failed to fetching users: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// get single users
const getSingleUser = async(req,res)=>{
    logger.info('fetching single user endpoint hit');
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if(!user){
            logger.warn('user not found while fetching single user');
            return res.status(404).json({
                success:false,
                message:'user not found'
            })
        }
        res.status(200).json({
            success:true,
            message:'single user fetched',
            user
        })
    } catch (error) {
        logger.error('failed to fetching single user: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

//block user
const blockUser = async(req,res)=>{
    logger.info('block user endpoint hit');
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if(!user){
            logger.warn('user not found');
            return res.status(404).json({
                success:false,
                message:'user not found'
            })
        }
        user.isBlocked = true;
        await user.save();
        logger.info('user blocked successfully');
        res.status(200).json({
            success:true,
            message:'user blocked successfully'
        })
    } catch (error) {
        logger.error('failed to block user: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// unblock user
const unblockUser = async(req,res)=>{
    logger.info('unblock user endpoint hit');
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if(!user){
            logger.warn('user not found');
            return res.status(404).json({
                success:false,
                message:'user not found'
            })
        }
        user.isBlocked = false;
        await user.save();
        logger.info('user unblocked successfully');
        res.status(200).json({
            success:true,
            message:'user unblocked successfully'
        })
    } catch (error) {
        logger.error('failed to unblock user: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// get pending sellers
const getPendingSellers = async(req,res)=>{
    logger.info('get pending sellers endpoint hit');
    try {
        const sellers = await SellerProfile.find({approvalStatus:'pending'}).populate('userId','name email');
        logger.info('pending sellers retrieved successfully');
        res.status(200).json({
            success:true,
            message:'pending sellers retrieved successfully',
            sellers
        })
    } catch (error) {
        logger.error('failed to get pending sellers: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// verify seller
const verifySeller = async(req,res)=>{
    logger.info('verify seller endpoint hit');
    const sellerId = req.params.id;
    try {
        const seller = await SellerProfile.findById(sellerId);
        if(!seller){
            logger.warn('seller profile not found for this id');
            return res.status(404).json({
                success:false,
                message:'seller profile not found'
            })
        }
        const user = await User.findById(seller.userId);

        if(!user){
            logger.warn('user not found for this seller profile');
            return res.status(404).json({
                success:false,
                message:'user not found for this seller profile'
            })
        }
        user.role = 'seller';
        await user.save();
        seller.approvalStatus = 'verified';
        await seller.save();
        logger.info('seller verified successfully');
        await sellerApprovalEmailHelper(user.email,user.name,seller.shopName,seller.approvalStatus);
        res.status(200).json({
            success:true,
            message:'seller verified successfully'
        })
    } catch (error) {
        logger.error('failed to verify seller: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// reject seller
const rejectSeller = async(req,res)=>{
    logger.info('reject seller endpoint hit');
    const sellerId = req.params.id;
    try {
        const seller = await SellerProfile.findById(sellerId);
        if(!seller){
            logger.warn('seller profile not found for this id');
            return res.status(404).json({
                success:false,
                message:'seller profile not found'
            })
        }
        const user = await User.findById(seller.userId);

        if(!user){
            logger.warn('user not found for this seller profile');
            return res.status(404).json({
                success:false,
                message:'user not found for this seller profile'
            })
        }
        seller.approvalStatus = 'rejected';
        await seller.save();
        logger.info('seller rejected successfully');
        await sellerApprovalEmailHelper(user.email,user.name,seller.shopName,seller.approvalStatus);
        res.status(200).json({
            success:true,
            message:'seller rejected successfully'
        })
    } catch (error) {
        logger.error('failed to reject seller: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// get all sellers
const getAllSellers = async(req,res)=>{
    logger.info('get all sellers endpoint hit');
    try {
        const sellers = await SellerProfile.find({}).populate('userId','name email phone');
        res.status(200).json({
            success:true,
            message:'all sellers fetched successfully',
            sellers
        })
    } catch (error) {
        logger.error('failed to fetching sellers: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// get single seller
const getSingleSeller = async(req,res)=>{
    logger.info('fetching single seller endpoint hit');
    const sellerId = req.params.id;
    try {
        const seller = await SellerProfile.findById(sellerId);
        if(!seller){
            logger.warn('seller not found while fetching single seller');
            return res.status(404).json({
                success:false,
                message:'seller not found'
            })
        }
        res.status(200).json({
            success:true,
            message:'single seller fetched',
            seller
        })
    } catch (error) {
        logger.error('failed to fetching single seller: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// block seller
const blockSeller = async(req,res)=>{
    logger.info('blocked seller endpoint hit');
    const sellerId = req.params.id;
    try {
        const seller = await SellerProfile.findById(sellerId);
        if(!seller){
            logger.warn('seller not found');
            return res.status(404).json({
                success:false,
                message:'seller not found'
            })
        }
        seller.isBlocked = true;
        await seller.save();
        logger.info('seller blocked successfully');
        res.status(200).json({
            success:true,
            message:'seller blocked successfully'
        })
    } catch (error) {
        logger.error('failed to block seller: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// unblock seller
const unblockSeller = async(req,res)=>{
    logger.info('unblock seller endpoint hit');
    const sellerId = req.params.id;
    try {
        const seller = await SellerProfile.findById(sellerId);
        if(!seller){
            logger.warn('seller not found');
            return res.status(404).json({
                success:false,
                message:'seller not found'
            })
        }
        seller.isBlocked = false;
        await seller.save();
        logger.info('seller unblocked successfully');
        res.status(200).json({
            success:true,
            message:'seller unblocked successfully'
        })
    } catch (error) {
        logger.error('failed to unblock seller: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

module.exports ={
    getAllUsers,
    getSingleUser,
    blockUser,
    unblockUser,
    getPendingSellers,
    verifySeller,
    rejectSeller,
    getAllSellers,
    getSingleSeller,
    blockSeller,
    unblockSeller
}
