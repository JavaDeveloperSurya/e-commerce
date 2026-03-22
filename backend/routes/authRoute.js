const express = require('express');
const router = express.Router();
const { login,verifyOtp,resendOtp,refreshToken,logout } = require('../controllers/authController');
router.post('/login', login);
router.post('/verify', verifyOtp);
router.post('/resend', resendOtp);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
 
module.exports=router;