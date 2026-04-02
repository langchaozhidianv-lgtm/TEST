const db = require("../config/db");

function normalizeStages(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean).join("\n") || null;
  }

  const normalized = String(value || "")
    .split(/\r?\n|,|，|;|；/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");

  return normalized || null;
}

async function getAllContracts(filters = {}) {
  let sql = `
    SELECT c.*, p.project_code, p.name AS project_name
    FROM contracts c
    JOIN projects p ON p.id = c.project_id
    WHERE 1 = 1
  `;
  const params = {};

  if (filters.project_id) {
    sql += " AND c.project_id = :project_id";
    params.project_id = filters.project_id;
  }

  if (filters.contract_type) {
    sql += " AND c.contract_type = :contract_type";
    params.contract_type = filters.contract_type;
  }

  sql += " ORDER BY c.updated_at DESC";
  const [rows] = await db.query(sql, params);
  return rows;
}

async function getContractById(id) {
  const [[row]] = await db.query(
    `SELECT c.*, p.project_code, p.name AS project_name
     FROM contracts c
     JOIN projects p ON p.id = c.project_id
     WHERE c.id = ?`,
    [id]
  );
  return row || null;
}

async function createContract(payload) {
  const [result] = await db.query(
    `INSERT INTO contracts
      (project_id, contract_code, contract_type, contract_name, counterparty_name, amount, tax_rate, payment_terms, collection_stages, actual_collection_amount, actual_payment_amount, signed_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.project_id,
      payload.contract_code,
      payload.contract_type,
      payload.contract_name,
      payload.counterparty_name,
      payload.amount,
      payload.tax_rate || 13,
      payload.payment_terms || null,
      normalizeStages(payload.collection_stages),
      payload.actual_collection_amount || 0,
      payload.actual_payment_amount || 0,
      payload.signed_date || null,
      payload.status || "APPROVED"
    ]
  );
  return getContractById(result.insertId);
}

async function updateContract(id, payload) {
  await db.query(
    `UPDATE contracts SET
      project_id = ?, contract_code = ?, contract_type = ?, contract_name = ?, counterparty_name = ?,
      amount = ?, tax_rate = ?, payment_terms = ?, collection_stages = ?, actual_collection_amount = ?, actual_payment_amount = ?, signed_date = ?, status = ?
     WHERE id = ?`,
    [
      payload.project_id,
      payload.contract_code,
      payload.contract_type,
      payload.contract_name,
      payload.counterparty_name,
      payload.amount,
      payload.tax_rate || 13,
      payload.payment_terms || null,
      normalizeStages(payload.collection_stages),
      payload.actual_collection_amount || 0,
      payload.actual_payment_amount || 0,
      payload.signed_date || null,
      payload.status || "APPROVED",
      id
    ]
  );
  return getContractById(id);
}

async function deleteContract(id) {
  const [result] = await db.query("DELETE FROM contracts WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract
};
