const logger = require('../utils/logger');
const Wishlist = require("../models/Wishlist");
const mongoose = require("mongoose");

// get wishlist for user
const getWishlist = async(req,res)=>{
    logger.info('get wishlist endpoint hit');
    const userId = req.info.userId;
    try {
        const wishlist = await Wishlist.findOne({ userId })
        .populate("products", "name price images");

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                wishlist: { items: [] },
            });
        }
        logger.info('wishlist fetchd successfully');
        res.status(200).json({
            success: true,
            wishlist: { items: wishlist.products },
        });

    } catch (error) {
        logger.error('error while fetching wishlist');
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

// add to wishlist
const addToWishlist = async(req,res)=>{
    logger.info('add to wishlist endpoint hit');
    const userId = req.info.userId;
    try {
        const { productId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const wishlist = await Wishlist.findOneAndUpdate(
            { userId },
            {
                $addToSet: { products: productId } // prevents duplicates
            },
            {
                new: true,
                upsert: true // create wishlist if not exists
            }
            ).populate("products", "name price images slug");
        logger.info('product added to wishlist successfully');
        res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            data: wishlist
        });
    } catch (error) {
        logger.error('wishlist creation failed');
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

// update wishlist
const updateWishlist = async(req,res)=>{
    logger.info('update wishlist endpoint hit');
    try {
        const userId = req.info.userId;
        const productId = req.params.productId;
        if (!Array.isArray(products)) {
        return res.status(400).json({
            success: false,
            message: "Products must be an array"
        });
        }

        const wishlist = await Wishlist.findOneAndUpdate(
        { userId },
        { products },
        { new: true }
        ).populate("products", "name price images slug");
        logger.info('wishlist updated successfully');
        res.status(200).json({
            success: true,
            message: "Wishlist updated",
            data: wishlist
        });
    } catch (error) {
        logger.error('error while fetching wishlist');
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

// delete from wishlist
const deleteFromWishlist = async(req,res)=>{
    try {
        logger.info('delete from wishlist endpoint hit');
        const userId = req.info.userId;
        const productId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
        }

        const wishlist = await Wishlist.findOneAndUpdate(
            { userId },
            {
                $pull: { products: productId } // remove product
            },
            { new: true }
            ).populate("products", "name price images slug");

        if (!wishlist) {
        return res.status(404).json({
            success: false,
            message: "Wishlist not found"
        });
        }
        logger.info('product removed from wishlist successfully');
        res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            data: wishlist
        });
    } catch (error) {
        logger.error('error while fetching wishlist');
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

module.exports = {
    getWishlist,
    addToWishlist,
    updateWishlist,
    deleteFromWishlist
}