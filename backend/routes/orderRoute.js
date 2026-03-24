const express = require('express');
const router = express.Router();
const {authenticate,buyerAuth,sellerAuth,adminAuth,AdminSellerAuth} = require('../middleware/authMiddleware');
const {createOrder,getAllOrders,getUserOrders,getOrderById,updateOrderStatus,cancelOrder,rejectOrder} = require('../controllers/orderController');

router.use(authenticate);
router.get('/orders',adminAuth,getAllOrders);

router.post('/create',buyerAuth,createOrder);
router.get('/my-orders',buyerAuth,getUserOrders);
router.get('/:id',adminAuth,getOrderById);


router.patch('/:id/status',sellerAuth,updateOrderStatus);
router.patch('/:id/cancel',buyerAuth,cancelOrder);

// order reject forcefully
router.patch('/:id/reject',AdminSellerAuth,rejectOrder);

module.exports = router;