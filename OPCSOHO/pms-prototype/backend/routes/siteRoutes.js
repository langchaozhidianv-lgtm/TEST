const express = require("express");
const controller = require("../controllers/siteController");
const { validateProjectLinked, validateRequired } = require("../middleware/validation");

const router = express.Router();

router.get("/", controller.getSiteRecords);
router.post(
  "/",
  validateProjectLinked,
  validateRequired(["record_type", "title"]),
  controller.createSiteRecord
);
router.put(
  "/:id",
  validateProjectLinked,
  validateRequired(["record_type", "title"]),
  controller.updateSiteRecord
);
router.delete("/:id", controller.deleteSiteRecord);

module.exports = router;
