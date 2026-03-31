const siteModel = require("../models/siteModel");

async function getSiteRecords(req, res, next) {
  try {
    res.json(await siteModel.getAllSiteRecords(req.query));
  } catch (error) {
    next(error);
  }
}

async function createSiteRecord(req, res, next) {
  try {
    res.status(201).json(await siteModel.createSiteRecord(req.body));
  } catch (error) {
    next(error);
  }
}

async function updateSiteRecord(req, res, next) {
  try {
    res.json(await siteModel.updateSiteRecord(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

async function deleteSiteRecord(req, res, next) {
  try {
    const deleted = await siteModel.deleteSiteRecord(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Site record not found" });
    return res.json({ message: "Site record deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSiteRecords,
  createSiteRecord,
  updateSiteRecord,
  deleteSiteRecord
};
