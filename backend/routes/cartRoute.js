const express = require('express');
const router = express.Router();

const {authenticate,buyerAuth} = require('../middleware/authMiddleware');
const {getCart,addToCart,updateCart,removeCart,clearCart} = require('../controllers/cartController');

router.use(authenticate,buyerAuth);
router.get('/',getCart);
router.post('/add',addToCart);
router.put('/update/:productId',updateCart);
router.delete('/delete/:productId',removeCart);
router.delete('/clear',clearCart);

module.exports = router;
