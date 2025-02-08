const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name , email, password)

  try {
    // Validate the input fields
    if (!name.trim() || !email.trim() || !password.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const user = new User({ name, email, password });

    // Hash the password before saving it
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the new user to the database
    const savedUser = await user.save();

    // Create a JWT token for the user
    const token = jwt.sign(
      { id: savedUser._id, name: savedUser.name, email: savedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save the token in a cookie
    res.cookie("token", token, {
      httpOnly: true,  // Ensures the cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === "production", 
      domain: "https://event-cyan-rho.vercel.app",
    });

    // Respond with the saved user's data (except the password)
    res.status(201).json({
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
    });
  } catch (err) {
    console.error("Error occurred during registration:", err);
    res.status(500).json({ message: "Server Error, please try again later." });
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
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Save the token in cookies
    res.cookie("token", token, {
      httpOnly: true,  // Ensures the cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === "production",
      domain: "https://event-cyan-rho.vercel.app",
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

const getUserData = (req, res) => {
  res.status(200).json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  });
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production", 
    maxAge: 0,  
  });

  res.status(200).json({ message: "Logged out successfully" });
};


module.exports = {
  registerUser,
  loginUser,
  getUserData,
  logoutUser
};
