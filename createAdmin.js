// createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/Users");

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Admin",
    email: "admin@gmail.com",
    password: hashedPassword,
    role: "admin",
    isApproved: true
  });

  console.log("Admin created successfully");
  process.exit();
}

createAdmin();