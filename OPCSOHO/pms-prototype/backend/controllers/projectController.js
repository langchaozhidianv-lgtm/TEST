const projectModel = require("../models/projectModel");

async function getProjects(req, res, next) {
  try {
    const data = await projectModel.getAllProjects(req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getProject(req, res, next) {
  try {
    const project = await projectModel.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json(project);
  } catch (error) {
    return next(error);
  }
}

async function getProjectDetail(req, res, next) {
  try {
    const project = await projectModel.getProjectDetailById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json(project);
  } catch (error) {
    return next(error);
  }
}

async function createProject(req, res, next) {
  try {
    const project = await projectModel.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

async function updateProject(req, res, next) {
  try {
    const project = await projectModel.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    const deleted = await projectModel.deleteProject(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Project not found" });
    return res.json({ message: "Project deleted" });
  } catch (error) {
    return next(error);
  }
}

async function getDashboard(req, res, next) {
  try {
    const threshold = Number(process.env.PAYMENT_RISK_THRESHOLD || 1000000);
    const data = await projectModel.getDashboardSummary(threshold);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function validateDocuments(req, res, next) {
  try {
    const result = await projectModel.validateRequiredDocuments(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProjects,
  getProject,
  getProjectDetail,
  createProject,
  updateProject,
  deleteProject,
  getDashboard,
  validateDocuments
};
