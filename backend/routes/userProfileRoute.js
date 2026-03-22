const express = require('express');
const router = express.Router();
const {getProfile,updateProfile,deleteProfile} = require('../controllers/userProfileController');
const {authenticate,buyerAuth,AdminUserAuth} = require('../middleware/authMiddleware');

router.get('/profile',authenticate,buyerAuth,getProfile);
router.put('/profile/update',authenticate,AdminUserAuth,updateProfile);
router.delete('/profile/delete-account',authenticate,AdminUserAuth,deleteProfile);



module.exports = router;
 