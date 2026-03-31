const express = require("express");
const controller = require("../controllers/financeController");
const { validateProjectLinked, validateRequired } = require("../middleware/validation");

const router = express.Router();

router.get("/", controller.getTransactions);
router.get("/alerts/payment-risk", controller.getPaymentRiskAlerts);
router.post(
  "/",
  validateProjectLinked,
  validateRequired(["transaction_type", "direction", "amount"]),
  controller.createTransaction
);
router.put(
  "/:id",
  validateProjectLinked,
  validateRequired(["transaction_type", "direction", "amount", "status"]),
  controller.updateTransaction
);
router.delete("/:id", controller.deleteTransaction);

module.exports = router;
