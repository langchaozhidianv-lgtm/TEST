const db = require("../config/db");

async function getAllProjects(filters = {}) {
  let sql = `
    SELECT p.*,
      COALESCE(SUM(CASE WHEN f.transaction_type = 'COLLECTION' THEN f.amount END), 0) AS total_collections
    FROM projects p
    LEFT JOIN finance_transactions f ON f.project_id = p.id
    WHERE 1 = 1
  `;
  const params = {};

  if (filters.status) {
    sql += " AND p.status = :status";
    params.status = filters.status;
  }

  if (filters.keyword) {
    sql += " AND (p.project_code LIKE :keyword OR p.name LIKE :keyword OR p.customer_name LIKE :keyword)";
    params.keyword = `%${filters.keyword}%`;
  }

  sql += " GROUP BY p.id ORDER BY p.updated_at DESC";
  const [rows] = await db.query(sql, params);
  return rows;
}

async function getProjectById(id) {
  const [[project]] = await db.query("SELECT * FROM projects WHERE id = ?", [id]);
  if (!project) return null;

  const [documents] = await db.query(
    "SELECT id, doc_type, file_name, uploaded_by, uploaded_at, is_required FROM project_documents WHERE project_id = ? ORDER BY uploaded_at DESC",
    [id]
  );
  const [contracts] = await db.query(
    "SELECT id, contract_code, contract_type, contract_name, amount, status FROM contracts WHERE project_id = ? ORDER BY id DESC",
    [id]
  );

  return { ...project, documents, contracts };
}

async function getProjectDetailById(id) {
  const [[project]] = await db.query(
    `SELECT p.*,
        COALESCE(SUM(CASE WHEN f.transaction_type = 'COLLECTION' THEN f.amount END), 0) AS total_collections
     FROM projects p
     LEFT JOIN finance_transactions f ON f.project_id = p.id
     WHERE p.id = ?
     GROUP BY p.id`,
    [id]
  );

  if (!project) return null;

  const [documents] = await db.query(
    `SELECT id, doc_type, file_name, uploaded_by, uploaded_at, is_required
     FROM project_documents
     WHERE project_id = ?
     ORDER BY uploaded_at DESC`,
    [id]
  );

  const [contracts] = await db.query(
    `SELECT id, contract_code, contract_type, contract_name, counterparty_name, amount, tax_rate, payment_terms, signed_date, status
     FROM contracts
     WHERE project_id = ?
     ORDER BY signed_date DESC, id DESC`,
    [id]
  );

  const [costComparison] = await db.query(
    `SELECT
      cost_category,
      SUM(CASE WHEN version_type = 'SIGNED' THEN amount ELSE 0 END) AS signed_cost,
      SUM(CASE WHEN version_type = 'BUDGET' THEN amount ELSE 0 END) AS budget_cost,
      SUM(CASE WHEN version_type = 'ACTUAL' THEN amount ELSE 0 END) AS actual_cost
     FROM cost_entries
     WHERE project_id = ?
     GROUP BY cost_category
     ORDER BY cost_category`,
    [id]
  );

  const [costEntries] = await db.query(
    `SELECT
      id,
      project_id,
      contract_id,
      version_type,
      cost_category,
      amount,
      entry_date,
      source_ref,
      notes
     FROM cost_entries
     WHERE project_id = ?
     ORDER BY entry_date DESC, id DESC`,
    [id]
  );

  const [[costTotals]] = await db.query(
    `SELECT
      COALESCE(SUM(CASE WHEN version_type = 'SIGNED' THEN amount END), 0) AS signed_total,
      COALESCE(SUM(CASE WHEN version_type = 'BUDGET' THEN amount END), 0) AS budget_total,
      COALESCE(SUM(CASE WHEN version_type = 'ACTUAL' THEN amount END), 0) AS actual_total
     FROM cost_entries
     WHERE project_id = ?`,
    [id]
  );

  const [remainingMaterials] = await db.query(
    `SELECT id, material_name, specification, quantity, unit, estimated_value, status, disposal_notes, updated_at
     FROM remaining_materials
     WHERE project_id = ?
     ORDER BY updated_at DESC`,
    [id]
  );

  const [financeTransactions] = await db.query(
    `SELECT id, contract_id, transaction_type, direction, amount, due_date, transaction_date, status, vendor_name, applicant, notes
     FROM finance_transactions
     WHERE project_id = ?
     ORDER BY COALESCE(due_date, transaction_date) DESC, id DESC`,
    [id]
  );

  const [[financeSummary]] = await db.query(
    `SELECT
      COALESCE(SUM(CASE WHEN transaction_type = 'COLLECTION_PLAN' THEN amount END), 0) AS collection_plan_total,
      COALESCE(SUM(CASE WHEN transaction_type = 'COLLECTION' THEN amount END), 0) AS collection_total,
      COALESCE(SUM(CASE WHEN transaction_type = 'PAYMENT_PLAN' THEN amount END), 0) AS payment_plan_total,
      COALESCE(SUM(CASE WHEN direction = 'EXPENSE' AND status IN ('PENDING', 'APPROVED') THEN amount END), 0) AS pending_expense_total,
      COALESCE(SUM(CASE WHEN direction = 'EXPENSE' AND status = 'PAID' THEN amount END), 0) AS paid_expense_total,
      COALESCE(SUM(CASE WHEN transaction_type = 'PREPAYMENT' AND status IN ('APPROVED', 'PAID') THEN amount END), 0) AS prepayment_total
     FROM finance_transactions
     WHERE project_id = ?`,
    [id]
  );

  const [siteRecords] = await db.query(
    `SELECT id, record_type, title, vendor_or_team, status, planned_date, actual_date, amount, quantity, unit, details, updated_at
     FROM site_records
     WHERE project_id = ?
     ORDER BY updated_at DESC`,
    [id]
  );

  const [[siteSummary]] = await db.query(
    `SELECT
      SUM(CASE WHEN record_type = 'PROCUREMENT' THEN 1 ELSE 0 END) AS procurement_count,
      SUM(CASE WHEN record_type = 'SHIPPING' THEN 1 ELSE 0 END) AS shipping_count,
      SUM(CASE WHEN record_type = 'LABOR' THEN 1 ELSE 0 END) AS labor_count,
      SUM(CASE WHEN record_type = 'SAFETY' THEN 1 ELSE 0 END) AS safety_count,
      SUM(CASE WHEN record_type = 'ACCEPTANCE' THEN 1 ELSE 0 END) AS acceptance_count
     FROM site_records
     WHERE project_id = ?`,
    [id]
  );

  const documentValidation = await validateRequiredDocuments(id);

  return {
    project,
    contracts,
    documents,
    documentValidation,
    costSummary: {
      totals: {
        ...costTotals,
        variance_total: Number(costTotals.actual_total || 0) - Number(costTotals.budget_total || 0)
      },
      comparison: costComparison,
      entries: costEntries
    },
    financeSummary: {
      totals: {
        ...financeSummary,
        risk_gap: Number(project.shipped_amount || 0) - Number(project.collected_amount || 0)
      },
      transactions: financeTransactions
    },
    remainingMaterials,
    siteSummary: {
      totals: siteSummary,
      records: siteRecords
    }
  };
}

async function createProject(payload) {
  const [result] = await db.query(
    `INSERT INTO projects
      (project_code, name, contract_no, project_type, business_type, customer_name, division_name, project_manager, status, start_date, planned_end_date, shipped_amount, collected_amount, contract_amount, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.project_code,
      payload.name,
      payload.contract_no || null,
      payload.project_type,
      payload.business_type || "EPC",
      payload.customer_name,
      payload.division_name,
      payload.project_manager,
      payload.status || "PLANNING",
      payload.start_date || null,
      payload.planned_end_date || null,
      payload.shipped_amount || 0,
      payload.collected_amount || 0,
      payload.contract_amount || 0,
      payload.description || null
    ]
  );

  return getProjectById(result.insertId);
}

async function updateProject(id, payload) {
  await db.query(
    `UPDATE projects SET
      project_code = ?, name = ?, contract_no = ?, project_type = ?, business_type = ?, customer_name = ?,
      division_name = ?, project_manager = ?, status = ?, start_date = ?, planned_end_date = ?,
      shipped_amount = ?, collected_amount = ?, contract_amount = ?, description = ?
     WHERE id = ?`,
    [
      payload.project_code,
      payload.name,
      payload.contract_no || null,
      payload.project_type,
      payload.business_type || "EPC",
      payload.customer_name,
      payload.division_name,
      payload.project_manager,
      payload.status || "PLANNING",
      payload.start_date || null,
      payload.planned_end_date || null,
      payload.shipped_amount || 0,
      payload.collected_amount || 0,
      payload.contract_amount || 0,
      payload.description || null,
      id
    ]
  );

  return getProjectById(id);
}

async function deleteProject(id) {
  const [result] = await db.query("DELETE FROM projects WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function getDashboardSummary(threshold) {
  const [[projectStats]] = await db.query(
    `SELECT
      COUNT(*) AS totalProjects,
      SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS inProgressProjects,
      SUM(CASE WHEN status = 'DELAYED' THEN 1 ELSE 0 END) AS delayedProjects,
      SUM(contract_amount) AS totalContractAmount,
      SUM(shipped_amount) AS totalShippedAmount,
      SUM(collected_amount) AS totalCollectedAmount
     FROM projects`
  );

  const [costComparison] = await db.query(
    `SELECT
      project_id,
      SUM(CASE WHEN version_type = 'SIGNED' THEN amount ELSE 0 END) AS signed_cost,
      SUM(CASE WHEN version_type = 'BUDGET' THEN amount ELSE 0 END) AS budget_cost,
      SUM(CASE WHEN version_type = 'ACTUAL' THEN amount ELSE 0 END) AS actual_cost
     FROM cost_entries
     GROUP BY project_id`
  );

  const [paymentAlerts] = await db.query(
    `SELECT
      p.id AS project_id,
      p.project_code,
      p.name,
      p.shipped_amount,
      p.collected_amount,
      (p.shipped_amount - p.collected_amount) AS gap_amount,
      CASE
        WHEN (p.shipped_amount - p.collected_amount) > ? THEN 'RED'
        WHEN (p.shipped_amount - p.collected_amount) > (? / 2) THEN 'AMBER'
        ELSE 'GREEN'
      END AS alert_level
     FROM projects p
     ORDER BY gap_amount DESC`,
    [threshold, threshold]
  );

  return {
    projectStats,
    costComparison,
    paymentAlerts
  };
}

async function validateRequiredDocuments(projectId) {
  const requiredTypes = ["CONTRACT", "SAFETY_DISCLOSURE", "ACCEPTANCE_FORM"];
  const [rows] = await db.query(
    "SELECT doc_type FROM project_documents WHERE project_id = ?",
    [projectId]
  );
  const uploaded = rows.map((item) => item.doc_type);
  const missing = requiredTypes.filter((type) => !uploaded.includes(type));

  return {
    project_id: Number(projectId),
    required: requiredTypes,
    uploaded,
    missing,
    ready: missing.length === 0
  };
}

module.exports = {
  getAllProjects,
  getProjectById,
  getProjectDetailById,
  createProject,
  updateProject,
  deleteProject,
  getDashboardSummary,
  validateRequiredDocuments
};
