const express = require("express");
const controller = require("../controllers/costController");
const { validateRequired, validateProjectLinked } = require("../middleware/validation");

const router = express.Router();

router.get("/", controller.getCosts);
router.get("/comparison/:projectId", controller.getComparison);
router.get("/remaining-materials/:projectId", controller.getRemainingMaterials);
router.post(
  "/",
  validateProjectLinked,
  validateRequired(["version_type", "cost_category", "amount", "entry_date"]),
  controller.createCost
);
router.put(
  "/:id",
  validateProjectLinked,
  validateRequired(["version_type", "cost_category", "amount", "entry_date"]),
  controller.updateCost
);
router.delete("/:id", controller.deleteCost);
router.post(
  "/remaining-materials",
  validateRequired(["project_id", "material_name"]),
  controller.createRemainingMaterial
);

module.exports = router;
