const db = require("../config/db");

async function getBudgetTotal(projectId) {
  const [[row]] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM cost_entries
     WHERE project_id = ? AND version_type = 'BUDGET'`,
    [projectId]
  );
  return Number(row.total || 0);
}

async function getExpenseCommitted(projectId) {
  const [[row]] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM finance_transactions
     WHERE project_id = ?
       AND direction = 'EXPENSE'
       AND transaction_type IN ('PAYMENT_REQUEST', 'REIMBURSEMENT', 'WAGE_DISBURSEMENT', 'PREPAYMENT')
       AND status IN ('PENDING', 'APPROVED', 'PAID')`,
    [projectId]
  );
  return Number(row.total || 0);
}

async function getHistoricalPrepayments(projectId) {
  const [[row]] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM finance_transactions
     WHERE project_id = ? AND transaction_type = 'PREPAYMENT' AND status IN ('APPROVED', 'PAID')`,
    [projectId]
  );
  return Number(row.total || 0);
}

async function createBudgetAdjustment(projectId, type, requestedAmount, budgetAmount, actualExpenseAmount) {
  const reason = `Request ${requestedAmount} would exceed budget ${budgetAmount}. Current committed expense is ${actualExpenseAmount}.`;
  const [result] = await db.query(
    `INSERT INTO budget_adjustments
      (project_id, request_type, requested_amount, budget_amount, actual_expense_amount, reason)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [projectId, type, requestedAmount, budgetAmount, actualExpenseAmount, reason]
  );
  return result.insertId;
}

async function getAllTransactions(filters = {}) {
  let sql = `
    SELECT ft.*, p.project_code, p.name AS project_name
    FROM finance_transactions ft
    JOIN projects p ON p.id = ft.project_id
    WHERE 1 = 1
  `;
  const params = {};

  if (filters.project_id) {
    sql += " AND ft.project_id = :project_id";
    params.project_id = filters.project_id;
  }

  if (filters.transaction_type) {
    sql += " AND ft.transaction_type = :transaction_type";
    params.transaction_type = filters.transaction_type;
  }

  sql += " ORDER BY COALESCE(ft.due_date, ft.transaction_date) DESC, ft.id DESC";
  const [rows] = await db.query(sql, params);
  return rows;
}

async function createTransaction(payload) {
  const budgetAmount = await getBudgetTotal(payload.project_id);
  const committedExpense = await getExpenseCommitted(payload.project_id);
  const historicalPrepayments = await getHistoricalPrepayments(payload.project_id);
  const isExpenseRequest = ["PAYMENT_REQUEST", "REIMBURSEMENT"].includes(payload.transaction_type);

  if (isExpenseRequest && committedExpense + Number(payload.amount) > budgetAmount) {
    const workflowId = await createBudgetAdjustment(
      payload.project_id,
      payload.transaction_type === "PAYMENT_REQUEST" ? "PAYMENT" : "REIMBURSEMENT",
      Number(payload.amount),
      budgetAmount,
      committedExpense
    );

    return {
      blocked: true,
      message: "Request blocked because it exceeds project budget. Budget adjustment workflow created.",
      workflowId,
      budgetAmount,
      committedExpense,
      requestedAmount: Number(payload.amount)
    };
  }

  const status = payload.status || (isExpenseRequest ? "PENDING" : "PLANNED");
  const [result] = await db.query(
    `INSERT INTO finance_transactions
      (project_id, contract_id, transaction_type, direction, amount, due_date, transaction_date, status, vendor_name, applicant, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.project_id,
      payload.contract_id || null,
      payload.transaction_type,
      payload.direction,
      payload.amount,
      payload.due_date || null,
      payload.transaction_date || null,
      status,
      payload.vendor_name || null,
      payload.applicant || null,
      payload.notes || null
    ]
  );

  const [[transaction]] = await db.query("SELECT * FROM finance_transactions WHERE id = ?", [result.insertId]);
  return {
    blocked: false,
    historicalPrepayments,
    warning: historicalPrepayments > 0 && payload.transaction_type === "PAYMENT_REQUEST"
      ? `Historical prepayments detected: ${historicalPrepayments}. Please prioritize clearing prepayments before further payment.`
      : null,
    transaction
  };
}

async function updateTransaction(id, payload) {
  await db.query(
    `UPDATE finance_transactions SET
      project_id = ?, contract_id = ?, transaction_type = ?, direction = ?, amount = ?, due_date = ?,
      transaction_date = ?, status = ?, vendor_name = ?, applicant = ?, notes = ?
     WHERE id = ?`,
    [
      payload.project_id,
      payload.contract_id || null,
      payload.transaction_type,
      payload.direction,
      payload.amount,
      payload.due_date || null,
      payload.transaction_date || null,
      payload.status,
      payload.vendor_name || null,
      payload.applicant || null,
      payload.notes || null,
      id
    ]
  );
  const [[row]] = await db.query("SELECT * FROM finance_transactions WHERE id = ?", [id]);
  return row || null;
}

async function deleteTransaction(id) {
  const [result] = await db.query("DELETE FROM finance_transactions WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function getPaymentRiskAlert(threshold) {
  const [rows] = await db.query(
    `SELECT
      id AS project_id,
      project_code,
      name AS project_name,
      shipped_amount,
      collected_amount,
      (shipped_amount - collected_amount) AS gap_amount,
      CASE
        WHEN (shipped_amount - collected_amount) > ? THEN 'RED'
        WHEN (shipped_amount - collected_amount) > (? / 2) THEN 'AMBER'
        ELSE 'GREEN'
      END AS alert_level
     FROM projects
     ORDER BY gap_amount DESC`,
    [threshold, threshold]
  );
  return rows;
}

module.exports = {
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getPaymentRiskAlert
};
