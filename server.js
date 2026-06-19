require('dotenv').config();

const cors = require('cors');
const express = require('express');
const connectDB=require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const psychologistRoutes = require('./src/routes/psychologistRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const slotRoutes = require("./src/routes/slotRoutes");


const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.use("/auth",authRoutes);

app.use("/psychologist",psychologistRoutes);

app.use("/admin",adminRoutes);

app.use("/slots",slotRoutes);

app.use("/appointments",appointmentRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}....`);
})