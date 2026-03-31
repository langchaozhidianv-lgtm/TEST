const express = require("express");
const controller = require("../controllers/projectController");
const { validateRequired } = require("../middleware/validation");

const router = express.Router();

router.get("/", controller.getProjects);
router.get("/dashboard", controller.getDashboard);
router.get("/:id/detail", controller.getProjectDetail);
router.get("/:id", controller.getProject);
router.get("/:id/validate-documents", controller.validateDocuments);
router.post(
  "/",
  validateRequired(["project_code", "name", "project_type", "customer_name", "division_name", "project_manager"]),
  controller.createProject
);
router.put(
  "/:id",
  validateRequired(["project_code", "name", "project_type", "customer_name", "division_name", "project_manager"]),
  controller.updateProject
);
router.delete("/:id", controller.deleteProject);

module.exports = router;
