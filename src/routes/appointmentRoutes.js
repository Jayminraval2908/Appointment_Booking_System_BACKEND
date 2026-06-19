const router = require('express').Router()
const appointmentController = require("../controllers/appointmentController")
const {verifyToken,requireRole} = require('../middleware/authMiddleware')

router.post("/book",verifyToken,requireRole("patient"),appointmentController.bookAppointment);
router.get("/my",verifyToken,requireRole("patient"),appointmentController.getMyAppointments);
router.delete("/cancel/:id",verifyToken,requireRole("patient"),appointmentController.cancelAppointment)

router.get("/psychologist",verifyToken,requireRole("psychologist"),appointmentController.getPsychologistAppointments)
router.put("/accept/:id",verifyToken,requireRole("psychologist"),appointmentController.acceptAppointment);
router.put("/reject/:id",verifyToken,requireRole("psychologist"),appointmentController.rejectAppointment);

module.exports = router;