const express = require('express');
const router = express.Router();
const {authenticate,buyerAuth} = require('../middleware/authMiddleware');
const {addReview,getReview,updateReview,deleteReview} = require('../controllers/reviewController');

router.get('/product/:productId', getReview);
router.post('/add', authenticate, buyerAuth, addReview);
router.put('/update/:id', authenticate, buyerAuth, updateReview);
router.delete('/delete/:id', authenticate, buyerAuth, deleteReview);

module.exports = router;