const db = require("../config/db");

async function getAllCosts(filters = {}) {
  let sql = `
    SELECT ce.*, p.project_code, p.name AS project_name
    FROM cost_entries ce
    JOIN projects p ON p.id = ce.project_id
    WHERE 1 = 1
  `;
  const params = {};

  if (filters.project_id) {
    sql += " AND ce.project_id = :project_id";
    params.project_id = filters.project_id;
  }

  if (filters.version_type) {
    sql += " AND ce.version_type = :version_type";
    params.version_type = filters.version_type;
  }

  sql += " ORDER BY ce.entry_date DESC, ce.id DESC";
  const [rows] = await db.query(sql, params);
  return rows;
}

async function createCost(payload) {
  const [result] = await db.query(
    `INSERT INTO cost_entries
      (project_id, contract_id, version_type, cost_category, amount, entry_date, source_ref, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.project_id,
      payload.contract_id || null,
      payload.version_type,
      payload.cost_category,
      payload.amount,
      payload.entry_date,
      payload.source_ref || null,
      payload.notes || null
    ]
  );

  const [[row]] = await db.query("SELECT * FROM cost_entries WHERE id = ?", [result.insertId]);
  return row;
}

async function updateCost(id, payload) {
  await db.query(
    `UPDATE cost_entries SET
      project_id = ?, contract_id = ?, version_type = ?, cost_category = ?, amount = ?,
      entry_date = ?, source_ref = ?, notes = ?
     WHERE id = ?`,
    [
      payload.project_id,
      payload.contract_id || null,
      payload.version_type,
      payload.cost_category,
      payload.amount,
      payload.entry_date,
      payload.source_ref || null,
      payload.notes || null,
      id
    ]
  );
  const [[row]] = await db.query("SELECT * FROM cost_entries WHERE id = ?", [id]);
  return row || null;
}

async function deleteCost(id) {
  const [result] = await db.query("DELETE FROM cost_entries WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function getCostComparison(projectId) {
  const [rows] = await db.query(
    `SELECT
      cost_category,
      SUM(CASE WHEN version_type = 'SIGNED' THEN amount ELSE 0 END) AS signed_cost,
      SUM(CASE WHEN version_type = 'BUDGET' THEN amount ELSE 0 END) AS budget_cost,
      SUM(CASE WHEN version_type = 'ACTUAL' THEN amount ELSE 0 END) AS actual_cost
     FROM cost_entries
     WHERE project_id = ?
     GROUP BY cost_category`,
    [projectId]
  );

  const [remainingMaterials] = await db.query(
    "SELECT * FROM remaining_materials WHERE project_id = ? ORDER BY updated_at DESC",
    [projectId]
  );

  return { project_id: Number(projectId), comparison: rows, remainingMaterials };
}

async function getRemainingMaterials(projectId) {
  const [rows] = await db.query(
    "SELECT * FROM remaining_materials WHERE project_id = ? ORDER BY updated_at DESC",
    [projectId]
  );
  return rows;
}

async function createRemainingMaterial(payload) {
  const [result] = await db.query(
    `INSERT INTO remaining_materials
      (project_id, material_name, specification, quantity, unit, estimated_value, status, disposal_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.project_id,
      payload.material_name,
      payload.specification || null,
      payload.quantity || 0,
      payload.unit || "pcs",
      payload.estimated_value || 0,
      payload.status || "REUSABLE",
      payload.disposal_notes || null
    ]
  );

  const [[row]] = await db.query("SELECT * FROM remaining_materials WHERE id = ?", [result.insertId]);
  return row;
}

module.exports = {
  getAllCosts,
  createCost,
  updateCost,
  deleteCost,
  getCostComparison,
  getRemainingMaterials,
  createRemainingMaterial
};
