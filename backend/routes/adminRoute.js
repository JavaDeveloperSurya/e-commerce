const express = require('express');
const router = express.Router();
const {authenticate,adminAuth} = require('../middleware/authMiddleware');
const {getAllUsers,getSingleUser,blockUser,unblockUser,getPendingSellers,verifySeller,rejectSeller,getAllSellers,getSingleSeller,blockSeller,unblockSeller} = require('../controllers/adminController');
const {getPendingProducts,verifyProduct,rejectProduct} = require('../controllers/adminProductManage');
router.use(authenticate,adminAuth);

// user management bu admin
router.get('/users',getAllUsers);
router.get('/user/:id',getSingleUser);
router.patch('/block-user',blockUser);
router.patch('/unblock-user',unblockUser);

// seller approval status update by admin
router.get('/sellers/pending',getPendingSellers);
router.patch('/seller/verify/:id',verifySeller);
router.patch('/seller/reject/:id',rejectSeller);

// seller management by admin
router.get('/sellers',getAllSellers);
router.get('/seller/:id',getSingleSeller);
router.patch('/block-seller',blockSeller);
router.patch('/unblock-seller',unblockSeller);

// product approval status update by admin
router.get('/products/pending',getPendingProducts);
router.patch('/product/verify/:id',verifyProduct);
router.patch('/product/reject/:id',rejectProduct);


module.exports = router;


