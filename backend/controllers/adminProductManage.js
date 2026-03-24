const logger = require('../utils/logger');
const Product = require('../models/Product');
const {productApprovalStatusEmailHelper} = require('../utils/product-email-helper');
const mongoose = require('mongoose');

// get pending products
const getPendingProducts = async(req,res)=>{
    logger.info('get pending products endpoint hit');
    try {
        const products = await Product.find({status:'pending'});
        logger.info('pending products retrieved successfully');
        res.status(200).json({
            success:true,
            message:'pending sellers retrieved successfully',
            products
        })
    } catch (error) {
        logger.error('failed to get pending products: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// verify product
const verifyProduct = async(req,res)=>{
    logger.info('verify product endpoint hit');
    const productId = req.params.id;
    try {
        //Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            logger.warn("invalid product id");
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }
        const product = await Product.findById(productId)
        .populate({
            path: "sellerId",
            populate: {
                path: "userId",
                select: "name email"
            }
        });

        if(!product){
            logger.warn('product  not found for this id');
            return res.status(404).json({
                success:false,
                message:'product not found'
            })
        }
        if (product.status === 'approved') {
            logger.warn("product already approved");
            return res.status(400).json({
                success: false,
                message: "Product already approved",
            });
        }
        if (!product.sellerId || !product.sellerId.userId) {
            logger.warn("seller not found");
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }
        product.status = 'approved';
        product.isActive = true;
        await product.save();
        const userName = product.sellerId.userId.name;
        const email = product.sellerId.userId.email;
        logger.info('product approved successfully');
        await productApprovalStatusEmailHelper(email,userName,product.name,'approved','');
        res.status(200).json({
            success:true,
            message:'product approved successfully'
        })
    } catch (error) {
        logger.error('failed to approve product: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

// reject seller
const rejectProduct = async(req,res)=>{
    logger.info('rejected product endpoint hit');
    const productId = req.params.id;
    const reason = 'The product did not meet our platform guidelines.';
    try {
        //Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            logger.warn("invalid product id");
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }
        const product = await Product.findById(productId)
        .populate({
            path: "sellerId",
            populate: {
                path: "userId",
                select: "name email"
            }
        });

        if(!product){
            logger.warn('product  not found for this id');
            return res.status(404).json({
                success:false,
                message:'product not found'
            })
        }
        if (product.status === 'rejected') {
            logger.warn("product already rejected");
            return res.status(400).json({
                success: false,
                message: "Product already rejected",
            });
        }
        if (!product.sellerId) {
            logger.warn("seller not found");
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }
        product.status = 'rejected';
        product.isActive = false;
        await product.save();
        const userName = product.sellerId.userId.name;
        const email = product.sellerId.userId.email;
        logger.info('product approved successfully');
        // email,sellerName,productName,sellerApprovalStatusMail,rejectionReaso
        await productApprovalStatusEmailHelper(email,userName,product.name,'rejected',reason);
        res.status(200).json({
            success:true,
            message:'product rejected successfully'
        })
    } catch (error) {
        logger.error('failed to reject product: ',error);
        res.status(500).json({
            sucess:false,
            message:'Internal server error'
        });
    }
}

module.exports= {
    getPendingProducts,
    verifyProduct,
    rejectProduct
}