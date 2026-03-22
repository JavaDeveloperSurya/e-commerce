const express = require('express');
const router = express.Router();
const {authenticate,sellerAuth, buyerAuth} = require('../middleware/authMiddleware');
const {createPayment,getPendingPayment,approvePayment,rejectPayment} = require('../controllers/paymentController');

router.post('/create',authenticate,buyerAuth,createPayment);
router.use(authenticate,sellerAuth);
router.get('/pending',getPendingPayment);
router.patch('/payment/:orderId/approve',approvePayment);
router.patch('/payment/:orderId/reject',rejectPayment);


module.exports = router;