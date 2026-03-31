const financeModel = require("../models/financeModel");

async function getTransactions(req, res, next) {
  try {
    res.json(await financeModel.getAllTransactions(req.query));
  } catch (error) {
    next(error);
  }
}

async function createTransaction(req, res, next) {
  try {
    const result = await financeModel.createTransaction(req.body);
    if (result.blocked) {
      return res.status(409).json(result);
    }
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateTransaction(req, res, next) {
  try {
    res.json(await financeModel.updateTransaction(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

async function deleteTransaction(req, res, next) {
  try {
    const deleted = await financeModel.deleteTransaction(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Finance transaction not found" });
    return res.json({ message: "Finance transaction deleted" });
  } catch (error) {
    return next(error);
  }
}

async function getPaymentRiskAlerts(req, res, next) {
  try {
    const threshold = Number(req.query.threshold || process.env.PAYMENT_RISK_THRESHOLD || 1000000);
    res.json(await financeModel.getPaymentRiskAlert(threshold));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getPaymentRiskAlerts
};
