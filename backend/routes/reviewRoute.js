const express = require('express');
const router = express.Router();
const {authenticate,buyerAuth} = require('../middleware/authMiddleware');
const {addReview,getReview,updateReview,deleteReview} = require('../controllers/reviewController');

router.use(authenticate,buyerAuth);
router.post('/add',addReview);
router.get('/product/:productId',getReview);
router.put('/update/:id',updateReview);
router.delete('/delete/:id',deleteReview);

module.exports = router;