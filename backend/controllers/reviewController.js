const logger = require('../utils/logger');
const Review = require('../models/Review');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// add review
const addReview = async (req, res) => {
    logger.info('add review endpoint hit');
    try {
        const userId = req.info.userId;
        const { productId, rating, comment } = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            logger.warn('invalid product id');
            return res.status(400).json({
                success:false,
                message:'invalid product id'
            });
        }

        // Check if user purchased & order delivered
        const order = await Order.findOne({
        userId: userId,
        orderStatus: "delivered",
        "items.productId": productId
        });

        if (!order) {
            logger.warn('not authorized to give review');
            return res.status(403).json({
                success:false,
                message: "You can review only purchased & delivered products"
            });
        }

        // Create Review
        const review = await Review.create({
            userId,
            productId,
            rating,
            comment
        });

        if (!review) {
            logger.warn('review not added');
            return res.status(403).json({
                success:false,
                message: "review not added"
            });
        }
        logger.info('review added');
        res.status(201).json({
            success: true,
            message: "Review added",
            data: review
        });

    } catch (err) {
        if (err.code === 11000) {
            logger.warn('user already reviewed this product')
            return res.status(400).json({
                success:false,
                message: "You already reviewed this product"
            });
        }
        res.status(500).json({
            sucess:false,
            message:err.message || 'internal server error'
        });
    }
};

// get review
const getReview = async (req, res) => {
    try {
        const productId = req.params.productId;
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            logger.warn('invalid product id');
            return res.status(400).json({
                success:false,
                message:'invalid product id'
            });
        }

        const reviews = await Review.find({ productId })
        .populate("userId", "name")
        .sort({ createdAt: -1 });

        if (!reviews) {
            logger.warn('review not found');
            return res.status(403).json({
                success:false,
                message: "review not found"
            });
        }
        logger.info('review fetched successfully');
        res.status(200).json({
            success: true,
            message:'review fetched successfully',
            count: reviews.length,
            data: reviews
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// update review
const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, userId: userId },
      { rating, comment },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found or not authorized"
      });
    }

    res.status(200).json({
      success: true,
      message: "Review updated",
      data: review
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete review
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      userId: userId
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found or not authorized"
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
    addReview,
    getReview,
    updateReview,
    deleteReview
}