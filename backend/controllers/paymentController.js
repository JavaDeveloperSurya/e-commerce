const logger = require('../utils/logger');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');

// create payment
const createPayment = async (req, res) => {
    logger.info('create payment endpoint hit');
    try {
        const { orderId, amount } = req.body;
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            logger.warn('invalid order id');
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        // Check order exists
        const order = await Order.findById(orderId);
        if (!order) {
            logger.warn('order not found');
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Prevent duplicate payment
        const existingPayment = await Payment.findOne({ orderId });
        if (existingPayment) {
            logger.warn('Payment already created');
            return res.status(400).json({
                success: false,
                message: "Payment already created for this order"
            });
        }
        // create payment 
        const payment = await Payment.create({
            orderId,
            userId: req.info.userId,
            amount,
            paymentStatus: 'pending',

        });
        if(!payment){
            logger.warn('Payment creation failed');
            return res.status(400).json({
                success: false,
                message: "Payment creation failed for this order"
            });
        }
        // change order status 
        await Order.findByIdAndUpdate(orderId, {
            orderStatus: "pending_payment"
        });

        logger.info('payment created');
        res.status(201).json({
            success: true,
            message: "Payment created successfully",
            data: payment
        });

    } catch (error) {
        logger.error('payment creation failed due to error');
        res.status(500).json({
            success: false,
            message: error.message || 'internal server error'
        });
    }
};

// get pending payments
const getPendingPayment = async (req, res) => {
    logger.info('get pending payment endpoint hit');
    try {
        const payments = await Payment.find({ paymentStatus: "pending" })
            .populate("orderId")
            .populate("userId", "name email");

        if (!payments) {
            logger.warn('pending payments not found');
            return res.status(404).json({
                success: false,
                message: "pending payments not found"
            });
        }
        logger.info('pending payments fetched');
        res.status(200).json({
            success: true,
            message:'pending payments fetched',
            count: payments.length,
            data: payments
        });

    } catch (error) {
        logger.error('pending payments fetched failed');
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
            
        });
    }
};

// approve payment
const approvePayment = async (req, res) => {
    logger.info('approve-payment endpoint hit');
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            logger.warn('Invalid order id');
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const payment = await Payment.findOneAndUpdate(
            { orderId },
            {
                paymentStatus: "success",
                paidAt: new Date()
            },
            { new: true }
        );

        if (!payment) {
            logger.warn('payment not found');
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        // Update Order Status
        const order = await Order.findByIdAndUpdate(orderId, {
            orderStatus: "paid"
        });
        const user = await User.findById(req.info.userId);
        // order events
        orderEvents.emit("order.status.changed", {
            email: user.email,
            name: user.name,
            orderId: order._id,
            status: order.orderStatus
        });
        res.status(200).json({
            success: true,
            message: "Payment approved and order confirmed",
            data: payment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error approving payment",
            error: error.message
        });
    }
};

// reject payment 
const rejectPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            logger.warn('invalid order Id');
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const payment = await Payment.findOneAndUpdate(
            { orderId },
            {
                paymentStatus: "failed"
            },
            { new: true }
        );

        if (!payment) {
            logger.warn('payment not found');
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        // Update Order Status
        const order = await Order.findByIdAndUpdate(orderId, {
            orderStatus: "failed"
        });
        const user = await User.findById(req.info.userId);
        // order events
        orderEvents.emit("order.status.changed", {
            email: user.email,
            name: user.name,
            orderId: order._id,
            status: order.orderStatus
        });
        logger.info('payment rejected and order failed');
        res.status(200).json({
            success: true,
            message: "Payment rejected and order failed",
            data: payment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error rejecting payment",
            error: error.message
        });
    }
};

module.exports = {
    createPayment,
    getPendingPayment,
    approvePayment,
    rejectPayment
}