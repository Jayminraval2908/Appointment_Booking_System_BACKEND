const slotSchema = require("../models/Slot");

const createSlot = async(req , res) =>{
    try {

        const { date , time } = req.body;

        if (!date || !time) {
            return res.status(400).json({
                message:"Date and time are required"
            })
        }

        const existingSlot = await slotSchema.findOne({
            psychologistId:req.user.userId,
            date:new Date(date),
            time
        });

        if (existingSlot) {
            return res.status(400).json({
                message:"Slot already exists for this date and time"
            });
        }

        const slot = await slotSchema.create({
            psychologistId:req.user.userId,
            date:new Date(date),
            time,
            isBooked:false 
        })

        return res.status(200).json({
            message:"Slot Created Successfully!!!",
            data:slot
        })
        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

const getSlotsByPsychologist = async(req,res)=>{
    try {
         const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const slots = await slotSchema.find({
            psychologistId:req.params.id,
            isBooked:false,   
            date:{ $gte: today } 
        }).sort({date:1,time:1});

        console.log("Slots found:", slots.length);

        return res.status(200).json({
            message:"Slots Fetched Successfully",
            data:slots
        });
        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

const getMySlots  = async(req,res)=>{
    try {
        const slots = await slotSchema.find({
            psychologistId:req.user.userId,

        }).sort({date:1,time:1});

        return res.status(200).json({
            message:"My Slots fetched Successfully",
            data:slots
        })
        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

const delteSlots = async(req,res)=>{
    try {
        const slot = await slotSchema.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({
                message:"Slot not found"
            })
        }

        if (slot.psychologistId.toString()!==req.user.userId) {
            return res.status(403).json({
                message:"Access Denied"
            })
        }

        if(slot.isBooked){
            return res.status(400).json({
                message:"Cannot delete booked slot"
            })
        }

        await slotSchema.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message:"Slot deleted successfully"
        })
        
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

module.exports = { createSlot,delteSlots,getMySlots,getSlotsByPsychologist }