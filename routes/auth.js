const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserData,
  logoutUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user", authMiddleware, getUserData);
router.post("/logout", logoutUser);

module.exports = router;
