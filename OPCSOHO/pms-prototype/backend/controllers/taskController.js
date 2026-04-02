const taskModel = require("../models/taskModel");

async function getTasks(req, res, next) {
  try {
    res.json(await taskModel.getTasks(req.query));
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    res.status(201).json(await taskModel.createTask(req.body));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  createTask
};
