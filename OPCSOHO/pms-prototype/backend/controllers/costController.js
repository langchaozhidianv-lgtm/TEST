const costModel = require("../models/costModel");

async function getCosts(req, res, next) {
  try {
    res.json(await costModel.getAllCosts(req.query));
  } catch (error) {
    next(error);
  }
}

async function createCost(req, res, next) {
  try {
    res.status(201).json(await costModel.createCost(req.body));
  } catch (error) {
    next(error);
  }
}

async function updateCost(req, res, next) {
  try {
    res.json(await costModel.updateCost(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

async function deleteCost(req, res, next) {
  try {
    const deleted = await costModel.deleteCost(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Cost entry not found" });
    return res.json({ message: "Cost entry deleted" });
  } catch (error) {
    return next(error);
  }
}

async function getComparison(req, res, next) {
  try {
    res.json(await costModel.getCostComparison(req.params.projectId));
  } catch (error) {
    next(error);
  }
}

async function getRemainingMaterials(req, res, next) {
  try {
    res.json(await costModel.getRemainingMaterials(req.params.projectId));
  } catch (error) {
    next(error);
  }
}

async function createRemainingMaterial(req, res, next) {
  try {
    res.status(201).json(await costModel.createRemainingMaterial(req.body));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCosts,
  createCost,
  updateCost,
  deleteCost,
  getComparison,
  getRemainingMaterials,
  createRemainingMaterial
};
