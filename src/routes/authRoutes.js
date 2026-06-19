const router = require('express').Router();
const authController = require('../controllers/authController');

router.post("/google", authController.googleAuth);
router.post("/verify-otp",authController.verifyOtp);
router.post("/resend-otp",authController.resendOtp);

router.post("/psychologist/signup",authController.psychologistSignup);
router.post("/psychologist/login",authController.psychologistLogin);
router.post("/admin/login",authController.adminLogin);


module.exports = router;