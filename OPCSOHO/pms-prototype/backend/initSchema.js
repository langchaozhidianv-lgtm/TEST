const db = require("./config/db");

async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS project_tasks (
      id INT PRIMARY KEY AUTO_INCREMENT,
      project_id INT NOT NULL,
      phase VARCHAR(100) NOT NULL,
      task_name VARCHAR(255) NOT NULL,
      assignee_role VARCHAR(100),
      status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED') NOT NULL DEFAULT 'PENDING',
      source_ref VARCHAR(100),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS collaboration_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      project_id INT NOT NULL,
      task_id INT NULL,
      team VARCHAR(100) NOT NULL,
      topic VARCHAR(255) NOT NULL,
      assignee VARCHAR(100),
      due_date DATE NULL,
      status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED') NOT NULL DEFAULT 'PENDING',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE SET NULL
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS collaboration_attachments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      collaboration_item_id INT NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      mime_type VARCHAR(120),
      file_size INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collaboration_item_id) REFERENCES collaboration_items(id) ON DELETE CASCADE
    )
  `);
}

module.exports = {
  ensureSchema
};
