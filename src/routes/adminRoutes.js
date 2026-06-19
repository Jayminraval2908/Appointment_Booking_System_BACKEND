const router = require('express').Router();
const adminController = require('../controllers/adminController');
const {verifyToken , requireRole} = require('../middleware/authMiddleware');

router.get("/pending-psychologists",verifyToken,requireRole("admin"),adminController.getPendingPsychologists);
router.get("/stats",verifyToken,requireRole("admin"),adminController.getDashboardStats);
router.put("/approve/:id",verifyToken,requireRole("admin"),adminController.approvePsychologist);


module.exports = router;