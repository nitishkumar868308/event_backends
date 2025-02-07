const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validation: Check if any of the fields are empty or just spaces
    if (!name.trim() || !email.trim() || !password.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      name,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    const savedUser = await user.save();

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Save the token in cookies
    res.cookie("token", token, {
      httpOnly: true,  // Ensures the cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 3600 * 1000, // 1 hour expiration
    });

    res.status(201).json({
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation: Check if email and password are provided
    if (!email.trim() || !password.trim()) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Save the token in cookies
    res.cookie("token", token, {
      httpOnly: true,  // Ensures the cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 3600 * 1000, // 1 hour expiration
    });

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
