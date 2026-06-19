const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    
    psychologistId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    date:{
        type:Date,
        required:true

    },

    time:{
        type:String,
        required:true
    },

    isBooked:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

module.exports = mongoose.model("Slot",slotSchema);