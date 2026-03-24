const logger = require('../utils/logger');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const orderEvents = require('../events/orderEvents');
const mongoose = require("mongoose");

const emitOrderStatusChanged = async ({ actorUserId, order }) => {
  const user = await User.findById(actorUserId);
  if (!user || !order) return;

  orderEvents.emit('order.status.changed', {
    email: user.email,
    name: user.name,
    orderId: order._id,
    status: order.orderStatus,
  });
};
// create order
const createOrder = async (req, res) => {
    logger.info('create order endpoint hit');
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.info.userId;
    const { shippingAddress, directItem } = req.body;

    const cart = directItem ? null : await Cart.findOne({ userId }).session(session);
    const itemsToOrder = directItem
      ? [{
          productId: directItem.productId,
          quantity: Math.max(1, Number(directItem.quantity) || 1),
        }]
      : cart?.items || [];

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.country || !shippingAddress?.postalCode) {
      return res.status(400).json({ success: false, message: 'shipping address is required' });
    }
    if (itemsToOrder.length === 0) {
      logger.warn('cart is empty.can not create order');
      return res.status(400).json({ success: false, message: 'cart is empty can not create order' });
    }
    const orderItems = [];
    let totalAmount = 0;

    for (const item of itemsToOrder) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ success: false, message: 'invalid product id' });
      }

      const product = await Product.findById(item.productId).session(session);

      if (!product || product.isDeleted || !product.isActive) {
        logger.warn('One or more products in the cart are not available');
        return res.status(400).json({ success: false, message: 'product not available' });
      }

      if (product.stock < item.quantity) {
        logger.warn(`Insufficient stock for ${product.name}`);
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      const unitPrice = Number(product.discountPrice || product.price || 0);
      orderItems.push({
        productId: product._id,
        sellerId: product.sellerId,
        quantity: item.quantity,
        price: unitPrice,
      });
      totalAmount += unitPrice * item.quantity;

      const updated = await Product.updateOne(
        { _id: product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session },
      );

      if (updated.modifiedCount === 0) {
        logger.warn(`Failed to update stock for ${product.name}. Possible concurrent modification.`);
        return res.status(400).json({
          success: false,
          message: `Failed to update stock for ${product.name}. Possible concurrent modification.`,
        });
      }
    }

    const createdOrders = await Order.create([
      {
        userId,
        items: orderItems,
        totalAmount,
        shippingAddress,
        orderStatus: 'created',
        paymentStatus: 'pending',
      },
    ], { session });

    const order = createdOrders[0];

    if (!directItem) {
      await Cart.deleteOne({ userId }).session(session);
    }
    await session.commitTransaction();
    await emitOrderStatusChanged({ actorUserId: userId, order });

    logger.info('order created successfully');
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error('error while creating order', error);
    res.status(400).json({ success: false, message: error.message || 'Internal server error' });
  } finally {
    session.endSession();
  }
}

// get all orders(admin)
const getAllOrders = async (req, res) => {
  logger.info('get all orders endpoint hit');
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'name price discountPrice images')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: 'orders retrieved successfully', orders });
  } catch (err) {
    logger.error('error while fetching all orders', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

//get user orders
const getUserOrders = async (req, res) => {
  logger.info('get user orders endpoint hit');
  try {
    const orders = await Order.find({ userId: req.info.userId })
      .populate('items.productId', 'name price discountPrice images')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: 'order fetched successfully', orders });
  } catch (error) {
    logger.error('error while fetching user orders', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

// get orders by id
const getOrderById = async (req, res) => {
    logger.info('get-order-by-id endpoint hit');
    try {
        const order = await Order.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('items.productId', 'name price discountPrice images');

        if (!order) {
            logger.warn('order not found for this id');
            return res.status(404).json({
                success:false,
                message:'order not found'
            })
        }
        logger.info('order fetched successfully');
        res.status(200).json({
            success:true,
            message:'order fetched successfully',
            order
        })

    } catch (error) {
        logger.error('error while fetchig order by id');
        res.status(500).json({
            success:false,
            message:error.message || 'Internal server error'
        })
    }
}

// update order status by admin
const updateOrderStatus = async (req, res) => {
    logger.info('update-order-status endpoint hit');
    try {
        const { status } = req.body;
        const allowed = ["shipped", "out_for_delivery", "delivered"];

        if (!allowed.includes(status)) {
            logger.warn('invalid order status');
            return res.status(404).json({
                success:false,
                message:'Invalid order status'
            })
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus: status },
            { new: true }
        );
        if (!order) {
            logger.warn('order not found and update ');
            return res.status(404).json({
                success:false,
                message:'order not found'
            })
        }
        const user = await User.findById(req.info.userId);
        // order events
        await emitOrderStatusChanged({ actorUserId: req.info.userId, order });
        logger.info('order status updated successfully');
        res.status(200).json({
            success:true,
            message:'order status updated successfully'
        })

    } catch (err) {
        logger.error('order status update failed');
        res.status(500).json({
            sucess:false,
            message:err.message || 'Internal server error'
        });
    }
}

// cancel order by user
const cancelOrder = async (req, res) => {
    logger.info('cancel order endpoint hit');
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.info.userId });

        if (!order) {
            logger.warn('order not found for this id');
            return res.status(404).json({
                success:false,
                message:'order not found'
            });
        }

        if (order.orderStatus !== "created") {
            logger.warn('only pending can be cancelled');
            return res.status(400).json({
                success: false,
                message: "Only pending orders can be cancelled"
            });
        }
        logger.info('cancelling order and restoring stock');
        order.orderStatus = 'cancelled';
        order.paymentStatus = order.paymentStatus === 'paid' ? 'paid' : 'failed';
        await order.save();

        // Restore stock
        for (const item of order.items) {
        await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } }
        );
        }
        // order events
        await emitOrderStatusChanged({ actorUserId: req.info.userId, order });
        logger.info('order cancelled successfully');
        res.status(200).json({
            success:true,
            message:'order cancelled successfully'
        })

    } catch (err) {
        logger.error('error while cancelling order',err);
        res.status(500).json({
            success:false,
            message:err.message || 'Internal server error'
        })
    }
}

// reject order by admin or seller
const rejectOrder = async (req, res) => {
    logger.info('reject order endpoint hit');
    try {
        const order = await Order.findById(req.params.id);
        if(!order){
            logger.warn('order not found for this id');
            return res.status(404).json({
                success:false,
                message:'order not found'
            });
        }
        logger.info('order rejected successfully');
        res.status(200).json({
            success:true,
            message:'order rejected successfully'
        })
        if (!['created', 'pending_payment'].includes(order.orderStatus)) {
            logger.warn('only pending can be cancelled by admin');
            return res.status(400).json({
                success: false,
                message: "Only pending orders can be cancelled"
            });
        }
        order.orderStatus = 'cancelled';
        order.paymentStatus = 'failed';
        await order.save();

        // restore stock
        for (const item of order.items) {
            await Product.updateOne(
                { _id: item.productId },
                { $inc: { stock: item.quantity } }
            );
        }
        await emitOrderStatusChanged({ actorUserId: req.info.userId, order });
        logger.info('stock restored successfully after order rejection');
        res.json(200).json({
            success:true,
            message:'order reject and stock restored successfully'
        })
    } catch (err) {
        logger.error('order rejection failed');
        res.status(500).json({
            success:false,
            message:err.message || 'Internal server error'
        })
    }
}


module.exports = {
    createOrder,
    getAllOrders,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    rejectOrder,
}