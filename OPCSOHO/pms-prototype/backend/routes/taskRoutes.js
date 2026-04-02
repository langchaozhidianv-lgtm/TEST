const express = require("express");
const controller = require("../controllers/taskController");
const { validateProjectLinked, validateRequired } = require("../middleware/validation");

const router = express.Router();

router.get("/", controller.getTasks);
router.post("/", validateProjectLinked, validateRequired(["phase", "task_name"]), controller.createTask);

module.exports = router;
