const express = require("express");
const adminController = require("../controllers/adminController");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken, requireRole("admin"));

router.get("/logs", adminController.listLogs);

module.exports = router;
