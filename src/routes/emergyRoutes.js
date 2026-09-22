const express = require("express");
const emergyController = require("../controllers/emergyController");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

router.get("/", emergyController.list);
router.post("/", emergyController.create);
router.delete("/:id", requireRole("admin"), emergyController.remove);

module.exports = router;
