const express = require('express');
const router = express.Router();
const { registerSeller, getSellerProfile, updateSellerProfile,deleteSellerProfile } = require('../controllers/sellerController');
const { authenticate, AdminSellerAuth } = require('../middleware/authMiddleware');



router.post('/register',authenticate,registerSeller);
router.use(authenticate,AdminSellerAuth);
router.get('/profile',getSellerProfile);
router.put('/profile/update',updateSellerProfile);
router.delete('/profile/delete-account',deleteSellerProfile);


module.exports = router;