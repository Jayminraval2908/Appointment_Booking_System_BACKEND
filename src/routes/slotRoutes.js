const router = require('express').Router();
const slotController = require('../controllers/slotController');
const {verifyToken,requireRole} = require('../middleware/authMiddleware');

router.post("/",verifyToken,requireRole("psychologist"),slotController.createSlot);
router.get("/my",verifyToken,requireRole("psychologist"),slotController.getMySlots);
router.delete("/:id",verifyToken,requireRole("psychologist"),slotController.delteSlots);

router.get("/:id",verifyToken, requireRole("patient"),slotController.getSlotsByPsychologist);


module.exports = router;