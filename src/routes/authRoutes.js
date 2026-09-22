const express = require("express");
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", loginLimiter, authController.login);

module.exports = router;
