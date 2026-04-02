const collaborationModel = require("../models/collaborationModel");

async function getItems(req, res, next) {
  try {
    res.json(await collaborationModel.getItems());
  } catch (error) {
    next(error);
  }
}

async function createItem(req, res, next) {
  try {
    const id = await collaborationModel.createItem(req.body, req.files || []);
    const items = await collaborationModel.getItems();
    res.status(201).json(items.find((item) => item.id === id));
  } catch (error) {
    next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const id = Number(req.params.id);
    await collaborationModel.updateItem(id, req.body, req.files || []);
    const items = await collaborationModel.getItems();
    res.json(items.find((item) => item.id === id));
  } catch (error) {
    next(error);
  }
}

async function deleteItem(req, res, next) {
  try {
    const deleted = await collaborationModel.deleteItem(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Collaboration item not found" });
    return res.json({ message: "Collaboration item deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem
};
