const db = require("../config/db");

const COLLECTION_TYPES = ["COLLECTION_PLAN", "COLLECTION"];
const EXPENSE_TYPES = ["PAYMENT_REQUEST", "REIMBURSEMENT", "WAGE_DISBURSEMENT", "PREPAYMENT"];
const EFFECTIVE_EXPENSE_STATUSES = ["PENDING", "APPROVED", "PAID"];
const FINANCE_COST_SOURCE_PREFIX = "FIN-";

function shouldForceIncome(transactionType) {
  return COLLECTION_TYPES.includes(transactionType);
}

function buildInClause(items) {
  return items.map(() => "?").join(", ");
}

function normalizeCollectionTransactionPayload(payload) {
  if (payload.transaction_type === "COLLECTION_PLAN" && payload.status === "PAID") {
    return {
      ...payload,
      transaction_type: "COLLECTION"
    };
  }

  return payload;
}

function shouldSyncExpenseToCostEntry(transaction) {
  return (
    transaction &&
    transaction.direction === "EXPENSE" &&
    EXPENSE_TYPES.includes(transaction.transaction_type) &&
    EFFECTIVE_EXPENSE_STATUSES.includes(transaction.status)
  );
}

function deriveEntryDate(transaction) {
  return transaction.transaction_date || transaction.due_date || new Date().toISOString().slice(0, 10);
}

function buildFinanceCostNotes(transaction, contractType) {
  const parts = ["Auto synced from finance transaction"];

  if (transaction.transaction_type) {
    parts.push(`type=${transaction.transaction_type}`);
  }

  if (contractType) {
    parts.push(`contract=${contractType}`);
  }

  if (transaction.vendor_name) {
    parts.push(`vendor=${transaction.vendor_name}`);
  }

  if (transaction.notes) {
    parts.push(`remark=${transaction.notes}`);
  }

  return parts.join("; ");
}

function inferCostCategory(transactionType, contractType) {
  if (transactionType === "WAGE_DISBURSEMENT") {
    return "LABOR";
  }

  if (transactionType === "REIMBURSEMENT") {
    return "EXPENSE";
  }

  if (contractType === "PROCUREMENT") {
    return "MAIN_MATERIAL";
  }

  if (contractType === "LABOR") {
    return "LABOR";
  }

  return "EXPENSE";
}

async function fetchContractType(contractId) {
  if (!contractId) return null;

  const [[contract]] = await db.query("SELECT contract_type FROM contracts WHERE id = ?", [contractId]);
  return contract?.contract_type || null;
}

async function syncFinanceTransactionCostEntry(transactionId) {
  if (!transactionId) return;

  const [[transaction]] = await db.query("SELECT * FROM finance_transactions WHERE id = ?", [transactionId]);
  const sourceRef = `${FINANCE_COST_SOURCE_PREFIX}${transactionId}`;

  if (!transaction || !shouldSyncExpenseToCostEntry(transaction)) {
    await db.query("DELETE FROM cost_entries WHERE source_ref = ?", [sourceRef]);
    return;
  }

  const contractType = await fetchContractType(transaction.contract_id);
  const payload = {
    project_id: transaction.project_id,
    contract_id: transaction.contract_id || null,
    version_type: "ACTUAL",
    cost_category: inferCostCategory(transaction.transaction_type, contractType),
    amount: transaction.amount,
    entry_date: deriveEntryDate(transaction),
    source_ref: sourceRef,
    notes: buildFinanceCostNotes(transaction, contractType)
  };

  const [[existing]] = await db.query("SELECT id FROM cost_entries WHERE source_ref = ?", [sourceRef]);

  if (existing) {
    await db.query(
      `UPDATE cost_entries SET
        project_id = ?, contract_id = ?, version_type = ?, cost_category = ?, amount = ?,
        entry_date = ?, notes = ?
       WHERE id = ?`,
      [
        payload.project_id,
        payload.contract_id,
        payload.version_type,
        payload.cost_category,
        payload.amount,
        payload.entry_date,
        payload.notes,
        existing.id
      ]
    );
    return;
  }

  await db.query(
    `INSERT INTO cost_entries
      (project_id, contract_id, version_type, cost_category, amount, entry_date, source_ref, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.project_id,
      payload.contract_id,
      payload.version_type,
      payload.cost_category,
      payload.amount,
      payload.entry_date,
      payload.source_ref,
      payload.notes
    ]
  );
}

async function syncContractCollectionAmount(contractId) {
  if (!contractId) return;

  const [[row]] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM finance_transactions
     WHERE contract_id = ?
       AND transaction_type = 'COLLECTION'`,
    [contractId]
  );

  await db.query("UPDATE contracts SET actual_collection_amount = ? WHERE id = ?", [
    Number(row.total || 0),
    contractId
  ]);
}

async function syncContractPaymentAmount(contractId) {
  if (!contractId) return;

  const [[row]] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM finance_transactions
     WHERE contract_id = ?
       AND direction = 'EXPENSE'
       AND transaction_type IN (${buildInClause(EXPENSE_TYPES)})
       AND status IN (${buildInClause(EFFECTIVE_EXPENSE_STATUSES)})`,
    [contractId, ...EXPENSE_TYPES, ...EFFECTIVE_EXPENSE_STATUSES]
  );

  await db.query("UPDATE contracts SET actual_payment_amount = ? WHERE id = ?", [
    Number(row.total || 0),
    contractId
  ]);
}

async function syncProjectCollectedAmount(projectId) {
  if (!projectId) return;

  const [[row]] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM finance_transactions
     WHERE project_id = ?
       AND transaction_type = 'COLLECTION'`,
    [projectId]
  );

  await db.query("UPDATE projects SET collected_amount = ? WHERE id = ?", [
    Number(row.total || 0),
    projectId
  ]);
}

async function syncProjectActualCostAmount(projectId) {
  if (!projectId) return;

  const [[row]] = await db.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM finance_transactions
     WHERE project_id = ?
       AND direction = 'EXPENSE'
       AND transaction_type IN (${buildInClause(EXPENSE_TYPES)})
       AND status IN (${buildInClause(EFFECTIVE_EXPENSE_STATUSES)})`,
    [projectId, ...EXPENSE_TYPES, ...EFFECTIVE_EXPENSE_STATUSES]
  );

  await db.query("UPDATE projects SET actual_cost_amount = ? WHERE id = ?", [
    Number(row.total || 0),
    projectId
  ]);
}

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
       AND transaction_type IN (${buildInClause(EXPENSE_TYPES)})
       AND status IN (${buildInClause(EFFECTIVE_EXPENSE_STATUSES)})`,
    [projectId, ...EXPENSE_TYPES, ...EFFECTIVE_EXPENSE_STATUSES]
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
    SELECT ft.*, p.project_code, p.name AS project_name, c.contract_name, c.contract_code
    FROM finance_transactions ft
    JOIN projects p ON p.id = ft.project_id
    LEFT JOIN contracts c ON c.id = ft.contract_id
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
  const nextPayload = normalizeCollectionTransactionPayload({
    ...payload,
    direction: shouldForceIncome(payload.transaction_type) ? "INCOME" : payload.direction
  });

  const budgetAmount = await getBudgetTotal(nextPayload.project_id);
  const committedExpense = await getExpenseCommitted(nextPayload.project_id);
  const historicalPrepayments = await getHistoricalPrepayments(nextPayload.project_id);
  const isExpenseRequest = ["PAYMENT_REQUEST", "REIMBURSEMENT"].includes(nextPayload.transaction_type);

  if (isExpenseRequest && committedExpense + Number(nextPayload.amount) > budgetAmount) {
    const workflowId = await createBudgetAdjustment(
      nextPayload.project_id,
      nextPayload.transaction_type === "PAYMENT_REQUEST" ? "PAYMENT" : "REIMBURSEMENT",
      Number(nextPayload.amount),
      budgetAmount,
      committedExpense
    );

    return {
      blocked: true,
      message: "Request blocked because it exceeds project budget. Budget adjustment workflow created.",
      workflowId,
      budgetAmount,
      committedExpense,
      requestedAmount: Number(nextPayload.amount)
    };
  }

  const status = nextPayload.status || (isExpenseRequest ? "PENDING" : "PLANNED");
  const [result] = await db.query(
    `INSERT INTO finance_transactions
      (project_id, contract_id, transaction_type, direction, collection_stage, amount, due_date, transaction_date, status, vendor_name, applicant, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nextPayload.project_id,
      nextPayload.contract_id || null,
      nextPayload.transaction_type,
      nextPayload.direction,
      nextPayload.collection_stage || null,
      nextPayload.amount,
      nextPayload.due_date || null,
      nextPayload.transaction_date || null,
      status,
      nextPayload.vendor_name || null,
      nextPayload.applicant || null,
      nextPayload.notes || null
    ]
  );

  const [[transaction]] = await db.query("SELECT * FROM finance_transactions WHERE id = ?", [result.insertId]);

  await Promise.all([
    syncFinanceTransactionCostEntry(result.insertId),
    syncContractCollectionAmount(nextPayload.contract_id),
    syncContractPaymentAmount(nextPayload.contract_id),
    syncProjectCollectedAmount(nextPayload.project_id),
    syncProjectActualCostAmount(nextPayload.project_id)
  ]);

  return {
    blocked: false,
    historicalPrepayments,
    warning: historicalPrepayments > 0 && nextPayload.transaction_type === "PAYMENT_REQUEST"
      ? `Historical prepayments detected: ${historicalPrepayments}. Please prioritize clearing prepayments before further payment.`
      : null,
    transaction
  };
}

async function updateTransaction(id, payload) {
  const [[before]] = await db.query("SELECT project_id, contract_id FROM finance_transactions WHERE id = ?", [id]);
  const nextPayload = normalizeCollectionTransactionPayload({
    ...payload,
    direction: shouldForceIncome(payload.transaction_type) ? "INCOME" : payload.direction
  });

  await db.query(
    `UPDATE finance_transactions SET
      project_id = ?, contract_id = ?, transaction_type = ?, direction = ?, collection_stage = ?, amount = ?, due_date = ?,
      transaction_date = ?, status = ?, vendor_name = ?, applicant = ?, notes = ?
     WHERE id = ?`,
    [
      nextPayload.project_id,
      nextPayload.contract_id || null,
      nextPayload.transaction_type,
      nextPayload.direction,
      nextPayload.collection_stage || null,
      nextPayload.amount,
      nextPayload.due_date || null,
      nextPayload.transaction_date || null,
      nextPayload.status,
      nextPayload.vendor_name || null,
      nextPayload.applicant || null,
      nextPayload.notes || null,
      id
    ]
  );

  const [[row]] = await db.query("SELECT * FROM finance_transactions WHERE id = ?", [id]);
  const contractIds = [...new Set([before?.contract_id, row?.contract_id].filter(Boolean))];
  const projectIds = [...new Set([before?.project_id, row?.project_id].filter(Boolean))];

  await Promise.all([
    syncFinanceTransactionCostEntry(id),
    ...contractIds.map((contractId) => syncContractCollectionAmount(contractId)),
    ...contractIds.map((contractId) => syncContractPaymentAmount(contractId)),
    ...projectIds.map((projectId) => syncProjectCollectedAmount(projectId)),
    ...projectIds.map((projectId) => syncProjectActualCostAmount(projectId))
  ]);

  return row || null;
}

async function deleteTransaction(id) {
  const [[before]] = await db.query("SELECT project_id, contract_id FROM finance_transactions WHERE id = ?", [id]);
  const [result] = await db.query("DELETE FROM finance_transactions WHERE id = ?", [id]);

  if (result.affectedRows > 0) {
    await Promise.all([
      syncFinanceTransactionCostEntry(id),
      syncContractCollectionAmount(before?.contract_id),
      syncContractPaymentAmount(before?.contract_id),
      syncProjectCollectedAmount(before?.project_id),
      syncProjectActualCostAmount(before?.project_id)
    ]);
  }

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
