const fs = require("fs");
const path = require("path");
const db = require("../config/db");

function mapAttachment(row) {
  return {
    id: row.id,
    file_name: row.file_name,
    file_path: row.file_path,
    file_size: row.file_size,
    mime_type: row.mime_type,
    url: `/uploads/${row.file_path.replace(/\\/g, "/")}`
  };
}

async function getItems() {
  const [items] = await db.query(
    `SELECT
      ci.*,
      p.project_code,
      p.name AS project_name,
      pt.task_name,
      pt.phase AS task_phase
     FROM collaboration_items ci
     JOIN projects p ON p.id = ci.project_id
     LEFT JOIN project_tasks pt ON pt.id = ci.task_id
     ORDER BY ci.updated_at DESC, ci.id DESC`
  );

  const [attachments] = await db.query(
    `SELECT id, collaboration_item_id, file_name, file_path, file_size, mime_type
     FROM collaboration_attachments
     ORDER BY id DESC`
  );

  const attachmentsByItem = attachments.reduce((acc, row) => {
    if (!acc[row.collaboration_item_id]) acc[row.collaboration_item_id] = [];
    acc[row.collaboration_item_id].push(mapAttachment(row));
    return acc;
  }, {});

  return items.map((item) => ({
    ...item,
    attachments: attachmentsByItem[item.id] || []
  }));
}

async function createItem(payload, files = []) {
  const [result] = await db.query(
    `INSERT INTO collaboration_items
      (project_id, task_id, team, topic, assignee, due_date, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.project_id,
      payload.task_id || null,
      payload.team,
      payload.topic,
      payload.assignee || null,
      payload.due_date || null,
      payload.status || "PENDING",
      payload.notes || null
    ]
  );

  if (files.length) {
    await db.query(
      `INSERT INTO collaboration_attachments
        (collaboration_item_id, file_name, file_path, mime_type, file_size)
       VALUES ?`,
      [
        files.map((file) => [
          result.insertId,
          file.originalname,
          path.relative(path.join(__dirname, "..", "uploads"), file.path),
          file.mimetype || null,
          file.size || 0
        ])
      ]
    );
  }

  return result.insertId;
}

async function updateItem(id, payload, files = []) {
  await db.query(
    `UPDATE collaboration_items SET
      project_id = ?, task_id = ?, team = ?, topic = ?, assignee = ?, due_date = ?, status = ?, notes = ?
     WHERE id = ?`,
    [
      payload.project_id,
      payload.task_id || null,
      payload.team,
      payload.topic,
      payload.assignee || null,
      payload.due_date || null,
      payload.status || "PENDING",
      payload.notes || null,
      id
    ]
  );

  if (files.length) {
    await db.query(
      `INSERT INTO collaboration_attachments
        (collaboration_item_id, file_name, file_path, mime_type, file_size)
       VALUES ?`,
      [
        files.map((file) => [
          id,
          file.originalname,
          path.relative(path.join(__dirname, "..", "uploads"), file.path),
          file.mimetype || null,
          file.size || 0
        ])
      ]
    );
  }

  return id;
}

async function deleteItem(id) {
  const [attachments] = await db.query(
    "SELECT file_path FROM collaboration_attachments WHERE collaboration_item_id = ?",
    [id]
  );
  const [result] = await db.query("DELETE FROM collaboration_items WHERE id = ?", [id]);

  attachments.forEach((item) => {
    const fullPath = path.join(__dirname, "..", "uploads", item.file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  });

  return result.affectedRows > 0;
}

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem
};
