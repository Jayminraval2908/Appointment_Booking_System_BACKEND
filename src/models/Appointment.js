const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    psychologistId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    slotId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Slot",
        required:true
    },

    status:{
        type:String,
        enum:["pending","accepted","rejected","completed"],
        default:"pending"
    }
},{timestamps:true});

module.exports = mongoose.model("Appointment",appointmentSchema);