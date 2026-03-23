const logger = require("../utils/logger");
const User = require('../models/User');
const Admin = require('../models/Admin');

// get profile
const getProfile = async(req,res)=>{
    try {
        logger.info('get- profile endpoint  hit');
        let account = await User.findOne({email:req.info.email});
        if(!account && req.info.role === 'admin'){
            account = await Admin.findOne({email:req.info.email});
        }

        if(!account){
            logger.warn('user not found');
            return res.status(404).json({
                sucess:false,
                message:'user not found'
            })
        }
        logger.info('user data successfully find ');
        res.status(200).json({
            success:true,
            message:'user successfully fetched',
            user: account
        })
    } catch (error) {
        logger.error('profile can not get due to err: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// update profile
const updateProfile = async(req,res)=>{
    try{
        logger.info('update-profile endpoint hit ');
        const userId = req.info.userId; // from auth middleware
        const updates = { ...req.body };
        // Fields allowed to update
        const allowedFields = ["name", "phone", "addresses"];
        // Remove restricted fields
        Object.keys(updates).forEach((key) => {
            if (!allowedFields.includes(key)) {
                delete updates[key];
            }
        });
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('user not found while profile update');
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // If profile not completed → require full details
        if (!user.isProfileCompleted) {
            if (!updates.name || !updates.phone || !updates.addresses) {
                    logger.warn('incomplete profile update attempt');
                    return res.status(400).json({
                        success: false,
                        message: "Complete profile requires name, phone and addresses"
                    });
            }
        user.isProfileCompleted = true;
        }
        // Update allowed fields
        Object.assign(user, updates);

        await user.save();
        logger.info('user profile updated successfully')
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });
    
    } catch (error) {
        logger.error('profile update failed due to err: ',error);
        res.status(500).json({
        success: false,
        message: "Profile update failed",
        error: error.message
        });
    } 
}

// delete profile
const deleteProfile = async(req,res)=>{
    logger.info('delete- profile endpoint hit');
    try {
        res.status(303).json({
            success:false,
            message:"implementation in progress"
        })
    } catch (error) {
        logger.error('profile deletion failed due to err: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    } 
}

module.exports = {
    getProfile,
    updateProfile,
    deleteProfile
}