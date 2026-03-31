const express = require("express");
const controller = require("../controllers/contractController");
const { validateRequired } = require("../middleware/validation");

const router = express.Router();

router.get("/", controller.getContracts);
router.get("/:id", controller.getContract);
router.post(
  "/",
  validateRequired(["project_id", "contract_code", "contract_type", "contract_name", "counterparty_name", "amount"]),
  controller.createContract
);
router.put(
  "/:id",
  validateRequired(["project_id", "contract_code", "contract_type", "contract_name", "counterparty_name", "amount"]),
  controller.updateContract
);
router.delete("/:id", controller.deleteContract);

module.exports = router;
