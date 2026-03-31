function validateRequired(fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === "";
    });

    if (missing.length) {
      return res.status(400).json({
        message: "Missing required fields",
        missing
      });
    }

    return next();
  };
}

function validateProjectLinked(req, res, next) {
  if (!req.body.project_id) {
    return res.status(400).json({
      message: "project_id is required for this request."
    });
  }

  return next();
}

module.exports = {
  validateRequired,
  validateProjectLinked
};
