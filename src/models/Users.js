const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: function () {
            return !this.googleId;  //  only required if not Google user
        }

    },

    googleId: {
        type: String,
        default: null
    },

    role: {
        type: String,
        enum: ["patient", "psychologist", "admin"],
        required: true
    },

    city: {
        type: String
    },

    specialization: {
        type: String,
    },

    experience: {
        type: Number
    },

    license: {
        type: String,
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    otp: {
        type: String,
        default: null
    },

    otpExpiry: {
        type: Date,
        default: null
    },

    isApproved: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });



module.exports = mongoose.model("User", userSchema);