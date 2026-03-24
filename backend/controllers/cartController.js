const logger = require('../utils/logger');
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// get cart
const getCart = async(req,res)=>{
    logger.info('get cart endpoint hit');
    const userId = req.info.userId;
    try {
        const cart = await Cart.findOne({ userId })
            .populate("items.productId", "name price discountPrice images");

        if (!cart) {
            logger.info('user cart empty');
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                cart: { items: [], totalAmount: 0 },
                data: { items: [], totalAmount: 0 }
            });
        }
        const totalAmount = cart.items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
        logger.info('user cart fetched');
        res.status(200).json({
            success: true,
            cart: {
                items: cart.items,
                totalAmount
            },
            data: {
                items: cart.items,
                totalAmount
            }
        });
    } catch (error) {
        logger.error('error while fetching cart');
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

// add to cart
const addToCart = async(req,res)=>{
    logger.info('add to cart endpoint hit');
    const userId = req.info.userId;
    try {
        const { productId, quantity = 1 } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            logger.warn('invalid product id');
            return res.status(400).json({
                success: false,
                message: "Invalid product id"
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            logger.warn('product not found');
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        if (!product.isActive || product.stock < 1) {
            return res.status(400).json({ success: false, message: 'Product is not available' });
        }
        // try increment 
        const updatedCart = await Cart.findOneAndUpdate(
            {
                userId,
                "items.productId": productId
            },
            {
                $inc: { "items.$.quantity": quantity }
            },
            { new: true }
        );
        // if updation failed or productnot available
        if (!updatedCart) {
            // If product not found in cart → push
            await Cart.findOneAndUpdate(
                { userId },
                {
                    $push: {
                        items: {
                            productId,
                            quantity,
                            price: product.discountPrice || product.price
                        }
                    }
                },
                { upsert: true, new: true }
            );
        }
        const cart = await Cart.findOne({ userId }).populate("items.productId", "name price discountPrice images");
        logger.info('Product added to cart');
        res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart,
            data: cart
        });
    } catch (error) {
        logger.error('add to cart failed');
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

// update cart
const updateCart = async (req, res) => {
    try{
        logger.info('update cart endpoint hit');
        const userId = req.info.userId;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity < 0) {
            logger.warn('quantity can not be negative');
            return res.status(400).json({
                success: false,
                message: "Quantity cannot be negative"
            });
        }

        if (quantity === 0) {
            await Cart.updateOne(
                { userId },
                { $pull: { items: { productId } } }
            );
        } else {
            await Cart.updateOne(
                { userId, "items.productId": productId },
                { $set: { "items.$.quantity": quantity } }
            );
        }

        const cart = await Cart.findOne({ userId }).populate("items.productId", "name price discountPrice images");
        logger.info('cart updated successfully');
        res.status(200).json({
            success: true,
            message: "Cart updated",
            cart,
            data: cart
        });
    } catch(error){
        logger.error('error while updating cart');
        res.status(500).json({
            success:false,
            message:error.message ||'Internal server error'
        })
    }
};

// remove cart 
const removeCart = async(req,res)=>{
    logger.info('delete cart endpoint hit');
    const userId = req.info.userId;
    try {
        const productId = req.params.productId;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            logger.warn('cart not found');
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );
        await cart.save();
        logger.warn('item removed from cart');
        res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart,
            data: cart
        });
    } catch (error) {
        logger.error('error while fetching cart');
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

// clear cart
const clearCart = async(req,res)=>{
    logger.info('clear cart endpoint hit');
    try {
        const userId = req.info.userId;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            logger.warn('cart no found');
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
        // Check if cart already empty
        if (cart.items.length === 0) {
            logger.warn('cart already empty');
            return res.status(200).json({
                success: true,
                message: "Cart already empty",
                cart,
                data: cart
            });
        }

        cart.items = [];
        await cart.save();
        logger.info('cart cleared successfully');
        res.status(200).json({
            success: true,
            message: "Cart cleared",
            cart,
            data: cart
        });

    } catch (error) {
        logger.error("error while clearing cart", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}

module.exports = {
    getCart,
    addToCart,
    updateCart,
    removeCart,
    clearCart
}