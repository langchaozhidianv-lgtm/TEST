const db = require("../config/db");

async function getAllSiteRecords(filters = {}) {
  let sql = `
    SELECT sr.*, p.project_code, p.name AS project_name
    FROM site_records sr
    JOIN projects p ON p.id = sr.project_id
    WHERE 1 = 1
  `;
  const params = {};

  if (filters.project_id) {
    sql += " AND sr.project_id = :project_id";
    params.project_id = filters.project_id;
  }

  if (filters.record_type) {
    sql += " AND sr.record_type = :record_type";
    params.record_type = filters.record_type;
  }

  sql += " ORDER BY sr.updated_at DESC";
  const [rows] = await db.query(sql, params);
  return rows;
}

async function createSiteRecord(payload) {
  const [result] = await db.query(
    `INSERT INTO site_records
      (project_id, record_type, title, vendor_or_team, status, planned_date, actual_date, amount, quantity, unit, details)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.project_id,
      payload.record_type,
      payload.title,
      payload.vendor_or_team || null,
      payload.status || "PLANNING",
      payload.planned_date || null,
      payload.actual_date || null,
      payload.amount || 0,
      payload.quantity || 0,
      payload.unit || null,
      payload.details || null
    ]
  );
  const [[row]] = await db.query("SELECT * FROM site_records WHERE id = ?", [result.insertId]);
  return row;
}

async function updateSiteRecord(id, payload) {
  await db.query(
    `UPDATE site_records SET
      project_id = ?, record_type = ?, title = ?, vendor_or_team = ?, status = ?, planned_date = ?,
      actual_date = ?, amount = ?, quantity = ?, unit = ?, details = ?
     WHERE id = ?`,
    [
      payload.project_id,
      payload.record_type,
      payload.title,
      payload.vendor_or_team || null,
      payload.status || "PLANNING",
      payload.planned_date || null,
      payload.actual_date || null,
      payload.amount || 0,
      payload.quantity || 0,
      payload.unit || null,
      payload.details || null,
      id
    ]
  );
  const [[row]] = await db.query("SELECT * FROM site_records WHERE id = ?", [id]);
  return row || null;
}

async function deleteSiteRecord(id) {
  const [result] = await db.query("DELETE FROM site_records WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllSiteRecords,
  createSiteRecord,
  updateSiteRecord,
  deleteSiteRecord
};
