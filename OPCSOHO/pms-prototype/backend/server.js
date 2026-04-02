require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const projectRoutes = require("./routes/projectRoutes");
const contractRoutes = require("./routes/contractRoutes");
const costRoutes = require("./routes/costRoutes");
const financeRoutes = require("./routes/financeRoutes");
const siteRoutes = require("./routes/siteRoutes");
const taskRoutes = require("./routes/taskRoutes");
const collaborationRoutes = require("./routes/collaborationRoutes");
const { ensureSchema } = require("./initSchema");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PMS backend is running" });
});

app.use("/api/projects", projectRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/costs", costRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/collaboration", collaborationRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Internal server error"
  });
});

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`PMS backend listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to ensure schema", error);
    process.exit(1);
  });
