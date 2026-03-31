const contractModel = require("../models/contractModel");

async function getContracts(req, res, next) {
  try {
    res.json(await contractModel.getAllContracts(req.query));
  } catch (error) {
    next(error);
  }
}

async function getContract(req, res, next) {
  try {
    const contract = await contractModel.getContractById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    return res.json(contract);
  } catch (error) {
    return next(error);
  }
}

async function createContract(req, res, next) {
  try {
    res.status(201).json(await contractModel.createContract(req.body));
  } catch (error) {
    next(error);
  }
}

async function updateContract(req, res, next) {
  try {
    res.json(await contractModel.updateContract(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

async function deleteContract(req, res, next) {
  try {
    const deleted = await contractModel.deleteContract(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Contract not found" });
    return res.json({ message: "Contract deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract
};
