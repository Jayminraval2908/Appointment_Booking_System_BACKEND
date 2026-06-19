const nodemailer = require('nodemailer');

const sendOtp = async(email,otp)=>{
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL,
            pass:process.env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from:process.env.EMAIL,
        to:email,
        subject:"Verify Your Account",
        html:`<h2>OTP Verification</h2>
        <p>Your OTP is : </p>
        <h1>${otp}</h1>
        <p>Valid for 10 mins.</p>
        `
    });
};

module.exports = sendOtp;