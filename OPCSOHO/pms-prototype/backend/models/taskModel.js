const db = require("../config/db");

async function getTasks(filters = {}) {
  let sql = `
    SELECT
      t.*,
      p.project_code,
      p.name AS project_name
    FROM project_tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE 1 = 1
  `;
  const params = {};

  if (filters.project_id) {
    sql += " AND t.project_id = :project_id";
    params.project_id = filters.project_id;
  }

  sql += " ORDER BY t.updated_at DESC, t.id DESC";
  const [rows] = await db.query(sql, params);
  return rows;
}

async function createTask(payload) {
  const [result] = await db.query(
    `INSERT INTO project_tasks
      (project_id, phase, task_name, assignee_role, status, source_ref, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.project_id,
      payload.phase,
      payload.task_name,
      payload.assignee_role || null,
      payload.status || "PENDING",
      payload.source_ref || null,
      payload.description || null
    ]
  );

  const [[row]] = await db.query("SELECT * FROM project_tasks WHERE id = ?", [result.insertId]);
  return row;
}

module.exports = {
  getTasks,
  createTask
};
