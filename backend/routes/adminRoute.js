const express = require('express');
const router = express.Router();
const {authenticate,adminAuth} = require('../middleware/authMiddleware');
const {getAllUsers,getSingleUser,blockUser,unblockUser,getPendingSellers,verifySeller,rejectSeller,getAllSellers,getSingleSeller,blockSeller,unblockSeller} = require('../controllers/adminController');
const {getPendingProducts,verifyProduct,rejectProduct} = require('../controllers/adminProductManage');

// user management bu admin
router.get('/users',authenticate,adminAuth,getAllUsers);
router.get('/user/:id',authenticate,adminAuth,getSingleUser);
router.patch('/block-user',authenticate,adminAuth,blockUser);
router.patch('/unblock-user',authenticate,adminAuth,unblockUser);

// seller approval status update by admin
router.get('/sellers/pending',authenticate,adminAuth,getPendingSellers);
router.patch('/seller/verify/:id',authenticate,adminAuth,verifySeller);
router.patch('/seller/reject/:id',authenticate,adminAuth,rejectSeller);

// seller management by admin
router.get('/sellers',authenticate,adminAuth,getAllSellers);
router.get('/seller/:id',authenticate,adminAuth,getSingleSeller);
router.patch('/block-seller',authenticate,adminAuth,blockSeller);
router.patch('/unblock-seller',authenticate,adminAuth,unblockSeller);

// product approval status update by admin
router.get('/products/pending',authenticate,adminAuth,getPendingProducts);
router.patch('/product/verify/:id',authenticate,adminAuth,verifyProduct);
router.patch('/product/reject/:id',authenticate,adminAuth,rejectProduct);


module.exports = router;


