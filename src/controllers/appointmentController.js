const appointmentSchema = require('../models/Appointment');
const slotSchema = require('../models/Slot');

const bookAppointment = async(req,res)=>{
    try {

        const {slotId} = req.body;

        if (!slotId) {
            return res.status(400).json({
                message:"Slot is required"
            });
        }

        const slot = await slotSchema.findById(slotId);

        if(!slot){
            return res.status(404).json({
                message:"Slot not found"
            })
        }

        if(slot.isBooked){
            return res.status(400).json({
                message:"Slot already booked"
            });
        }

        const appointment = await appointmentSchema.create({
            patientId:req.user.userId,
            psychologistId:slot.psychologistId,
            slotId:slot._id,
            status:"pending"
        });

        await slotSchema.findByIdAndUpdate(slotId, {isBooked:true});

        return res.status(201).json({
            message:"Appointment Booked Successfully",
            data:appointment
        })
        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

const getMyAppointments = async(req,res)=>{
    try {
        const appointments = await appointmentSchema.find({
            patientId:req.user.userId
        })
        .populate("psychologistId", "name email city specialization")
        .populate("slotId","date time")
        .sort({ createdAt : -1 });

        return res.status(200).json({
            message:"Appointments fetched successfully!",
            data:appointments
        })

        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

const getPsychologistAppointments = async(req,res)=>{
    try {

        const appointments = await appointmentSchema.find({
            psychologistId:req.user.userId
        })
        .populate("patientId","name email")
        .populate("slotId", "date time")
        .sort({createdAt:-1})

        return res.status(200).json({
            message:"Appointements fetched successfully",
            data:appointments
        })
        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

const cancelAppointment = async(req,res)=>{
    try {

        const appointment = await appointmentSchema.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                message:"Appointment not found"
            })
        }

        if(appointment.patientId.toString() !== req.user.userId){
            return res.status(403).json({
                message:"Access denied"
            })
        }

        await slotSchema.findByIdAndUpdate(appointment.slotId , {isBooked:false});

        await appointmentSchema.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message:"Appointment Cancelled Successfully"
        });
        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

const acceptAppointment = async(req,res)=>{
    try {
        const appointment = await appointmentSchema.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                message:"Appointment not Found"
            })
        }
        
        //Only the psychologist of this appointment can accept
        if (appointment.psychologistId.toString() !== req.user.userId) {
            return res.status(403).json({
                message:"Access Deiend"
            })
        }

        appointment.status = "accepted",
        await appointment.save();

        return res.status(200).json({
            message:"Appointment Accepted Successfully"
        });
        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

const rejectAppointment = async(req,res)=>{
    try {

        const appointment = await appointmentSchema.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                message:"Appointment not found"
            })
        }

        if (appointment.psychologistId.toString() !== req.user.userId) {
            return res.status(403).json({
                message:"Access Denied"
            })
        }

        await slotSchema.findByIdAndUpdate(appointment.slotId,{isBooked:false});

        appointment.status = "rejected"
        await appointment.save();

        return res.status(200).json({
            message:"Appointment rejected successfully"
        });
        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}
module.exports = { bookAppointment , cancelAppointment, getMyAppointments, getPsychologistAppointments ,acceptAppointment,rejectAppointment}