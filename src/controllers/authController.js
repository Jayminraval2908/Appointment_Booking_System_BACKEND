const userSchema = require('../models/Users');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const sendotp = require('../utils/SendOtp');
const bcrypt = require('bcrypt');

const googleAuth = async (req, res) => {
    try {

        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "Google token is required"
            });

        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        let user = await userSchema.findOne({
            email: payload.email,
            
        })

        // if (user && user.role !== 'patient') {

        //     return res.status(403).json({
        //         message: "This email is registered as a psychologist. please use manual login"
        //     });

        // }

        if (user && user.isEmailVerified) {
            const accessToken = jwt.sign(
                {
                    userId: user._id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            const { password, googleId, otp, otpExpiry, ...safeUser } = user.toObject();

            return res.status(200).json({
                message: "Login Successful",
                token: accessToken,
                user: safeUser
            });
        }

        if (!user) {
            user = await userSchema.create({
                name: payload.name,
                email: payload.email,
                googleId: payload.sub,
                role: "patient",
                isApproved: true
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp.toString();
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

         await userSchema.findOneAndUpdate(
            { email: payload.email, role:"patient" },
            {
                $set: {
                    otp: otp,
                    otpExpiry: new Date(Date.now() + 10 * 60 * 1000)
                }
            },
            { new: true }
        );

        console.log("=== OTP SAVED DEBUG ===");
console.log("OTP generated:", otp);
console.log("OTP saved in DB:", user.otp);        // ✅ use user directly
console.log("OTP Expiry saved:", user.otpExpiry);

        await sendotp(user.email, otp);

        return res.status(200).json({
            message: "OTP Sent successfully!!",
            email: user.email
        })

        // const accessToken = jwt.sign({
        //     userId: user._id,
        //     role: user.role
        // },
        //     process.env.JWT_SECRET, { expiresIn: "7d" }
        // );

        // return res.status(200).json({
        //     message: "Login Successful",
        //     token: accessToken,
        //     user
        // })


    } catch (error) {

        return res.status(500).json({
            message: error.message
        })
    }
}

const verifyOtp = async (req, res) => {
    try {

        const { email, otp } = req.body;
        console.log("=== VERIFY OTP DEBUG ===");
        console.log("Email received:", email);
        console.log("OTP received:", otp);
        console.log("OTP type:", typeof otp);

        const user = await userSchema.findOne({ email});

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        console.log("OTP in DB:", user.otp);
        console.log("OTP in DB type:", typeof user.otp);
        console.log("OTP Expiry in DB:", user.otpExpiry);
        console.log("Current Time:", new Date());
        console.log("Is Expired:", Date.now() > new Date(user.otpExpiry).getTime());

        // ✅ Step 3 — check comparison
        console.log("OTP Match:", user.otp === otp);
        console.log("OTP toString Match:", user.otp?.toString() === otp?.toString());


       if (!user.otp) {
            return res.status(400).json({
                message: "OTP not found. Please request a new one."
            });
        }

        
        if (user.otp.toString() !== otp.toString()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }


       if (Date.now() > new Date(user.otpExpiry).getTime()) {
            return res.status(400).json({ message: "OTP Expired. Please request a new one." });
        }

        user.isEmailVerified = true,
        user.otp = null,
        user.otpExpiry = null

         await userSchema.findOneAndUpdate(
            { email},
            {
                $set: {
                    isEmailVerified: true,
                    otp: null,
                    otpExpiry: null
                }
            }
        );

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )


        return res.status(200).json({
            message: "Email verified successfully",
            token,
            user
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

const resendOtp = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await userSchema.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otp.toString();
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await userSchema.findOneAndUpdate(
            { email },
            {
                $set: {
                    otp: otp,
                    otpExpiry: new Date(Date.now() + 10 * 60 * 1000)
                }
            }
        );

        await sendotp(user.email, otp);

        return res.status(200).json({
            message: "OTP resent successfully!!!"
        });


    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const psychologistSignup = async (req, res) => {
    try {

        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All Fields are required."
            })
        }

        const existingUser = await userSchema.findOne({ email});

        if (existingUser) {
            return res.status(400).json({
                message: "Psychologist account already exists. Please login."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const psychologist = await userSchema.create({
            name,
            email,
            password: hashedPassword,
            role: "psychologist",
            isApproved: false,
            isEmailVerified:true
        });

        // ✅ No OTP — return token directly
        const token = jwt.sign(
            {
                userId: psychologist._id,
                role:   psychologist.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const { password: pass, googleId, otp, otpExpiry, ...safeUser } = psychologist.toObject();

        return res.status(201).json({
            message: "Account created successfully!",
            token,
            user: safeUser
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

const psychologistLogin = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password are required."
            })
        }

        const psychologist = await userSchema.findOne({ email});

        if (!psychologist) {
            return res.status(404).json({
                message: "Psychologist account not found"
            });
        }

        if (psychologist.role !== "psychologist") {
            return res.status(403).json({
                message: "Only Psychologist can login here"
            });
        }

        if(psychologist.isApproved!==true ){
            return res.status(403).json({
                message:"Admin not approved yet...Please wait for admin approval"
            })
        }


       
        const isPasswordMatch = await bcrypt.compare(password, psychologist.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid Credentials"
            });
        }

        const token = jwt.sign({
            userId: psychologist._id,
            role: psychologist.role
        },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login Successful",
            token,
            user: psychologist
        });


    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}



const adminLogin = async (req, res) => {
    try {

        const { email, password } = req.body;

        const admin = await userSchema.findOne({
            email,
            role: "admin"
        });


        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                userId: admin._id,
                role: admin.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Admin Login Successful",
            token,
            user: admin
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = { googleAuth, verifyOtp, resendOtp, psychologistSignup, psychologistLogin, adminLogin };