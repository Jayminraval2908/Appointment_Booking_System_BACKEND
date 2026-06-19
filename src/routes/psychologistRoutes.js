const router = require('express').Router();

const psychologistController = require('../controllers/psychologistController');
const {verifyToken, requireRole}= require('../middleware/authMiddleware');

router.get("/",verifyToken,requireRole("patient") , psychologistController.getAllPsychologist);
router.get("/me",verifyToken,requireRole("psychologist"),psychologistController.getMyProfile);
router.get("/:id" ,verifyToken,requireRole("patient"),psychologistController.getPsychologistById);
router.post("/profile", verifyToken, requireRole("psychologist"),psychologistController.createProfile);
router.put("/profile",verifyToken,requireRole("psychologist"),psychologistController.updateProfile);


module.exports = router;