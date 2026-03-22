const express = require('express');
const router = express.Router();
const {authenticate,buyerAuth} = require('../middleware/authMiddleware');
const { getWishlist,addToWishlist,updateWishlist,deleteFromWishlist } = require('../controllers/wishlistController');

router.use(authenticate,buyerAuth);
router.get('/',getWishlist);
router.post('/add',addToWishlist);
router.delete('/remove/:productId',deleteFromWishlist);

module.exports = router;