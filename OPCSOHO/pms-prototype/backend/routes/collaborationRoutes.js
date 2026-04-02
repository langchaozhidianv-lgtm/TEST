const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const controller = require("../controllers/collaborationController");

const router = express.Router();
const uploadRoot = path.join(__dirname, "..", "uploads", "collaboration");

fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadRoot),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`.replace(/\s+/g, "_");
    cb(null, safeName);
  }
});

const upload = multer({ storage });

router.get("/", controller.getItems);
router.post("/", upload.array("attachments", 10), controller.createItem);
router.put("/:id", upload.array("attachments", 10), controller.updateItem);
router.delete("/:id", controller.deleteItem);

module.exports = router;
