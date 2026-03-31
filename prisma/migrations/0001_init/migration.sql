CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NULL,
  `department` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX `users_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `projects` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `owner_id` VARCHAR(50) NOT NULL,
  `creator_id` VARCHAR(50) NOT NULL,
  `start_date` TIMESTAMP NULL,
  `end_date` TIMESTAMP NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  `priority` INT NOT NULL DEFAULT 0,
  `visibility_scope` VARCHAR(30) NOT NULL DEFAULT 'PRIVATE',
  `reminder_config_json` JSON NULL,
  `closed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_projects_owner_id`(`owner_id`),
  INDEX `idx_projects_creator_id`(`creator_id`),
  INDEX `idx_projects_status`(`status`),
  INDEX `idx_projects_updated_at`(`updated_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_projects_owner` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`),
  CONSTRAINT `fk_projects_creator` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `project_members` (
  `id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `role_type` VARCHAR(30) NOT NULL,
  `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_members_project_id`(`project_id`),
  INDEX `idx_project_members_user_id`(`user_id`),
  UNIQUE INDEX `uk_project_member`(`project_id`, `user_id`, `role_type`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_project_members_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_members_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `project_tags` (
  `id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `tag_name` VARCHAR(100) NOT NULL,
  `tag_type` VARCHAR(30) NOT NULL DEFAULT 'PUBLIC',
  `created_by` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_tags_project_id`(`project_id`),
  INDEX `idx_project_tags_tag_name`(`tag_name`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_project_tags_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `task_groups` (
  `id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_task_groups_project_id`(`project_id`),
  INDEX `idx_task_groups_project_sort`(`project_id`, `sort_order`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_task_groups_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `tasks` (
  `id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `group_id` VARCHAR(50) NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `assignee_id` VARCHAR(50) NULL,
  `reporter_id` VARCHAR(50) NULL,
  `priority` VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  `status` VARCHAR(30) NOT NULL DEFAULT 'TODO',
  `progress_percent` INT NOT NULL DEFAULT 0,
  `start_at` TIMESTAMP NULL,
  `end_at` TIMESTAMP NULL,
  `due_at` TIMESTAMP NULL,
  `duration_days` INT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `completed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tasks_project_id`(`project_id`),
  INDEX `idx_tasks_group_id`(`group_id`),
  INDEX `idx_tasks_assignee_id`(`assignee_id`),
  INDEX `idx_tasks_status`(`status`),
  INDEX `idx_tasks_start_at`(`start_at`),
  INDEX `idx_tasks_end_at`(`end_at`),
  INDEX `idx_tasks_project_sort`(`project_id`, `sort_order`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tasks_group` FOREIGN KEY (`group_id`) REFERENCES `task_groups`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tasks_assignee` FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`),
  CONSTRAINT `fk_tasks_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`),
  CONSTRAINT `ck_tasks_progress` CHECK (`progress_percent` >= 0 AND `progress_percent` <= 100),
  CONSTRAINT `ck_tasks_date_range` CHECK (`end_at` IS NULL OR `start_at` IS NULL OR `end_at` >= `start_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `task_dependencies` (
  `id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `predecessor_task_id` VARCHAR(50) NOT NULL,
  `successor_task_id` VARCHAR(50) NOT NULL,
  `dependency_type` VARCHAR(10) NOT NULL DEFAULT 'FS',
  `lag_days` INT NOT NULL DEFAULT 0,
  `created_by` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_task_dependencies_project_id`(`project_id`),
  INDEX `idx_task_dependencies_predecessor`(`predecessor_task_id`),
  INDEX `idx_task_dependencies_successor`(`successor_task_id`),
  UNIQUE INDEX `uk_task_dependencies`(`predecessor_task_id`, `successor_task_id`, `dependency_type`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_task_dependencies_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_dependencies_predecessor` FOREIGN KEY (`predecessor_task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_dependencies_successor` FOREIGN KEY (`successor_task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
  CONSTRAINT `ck_task_dependencies_not_self` CHECK (`predecessor_task_id` <> `successor_task_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `task_comments` (
  `id` VARCHAR(50) NOT NULL,
  `task_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_task_comments_task_id`(`task_id`),
  INDEX `idx_task_comments_user_id`(`user_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_task_comments_task` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `project_relations` (
  `id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `relation_type` VARCHAR(30) NOT NULL,
  `target_id` VARCHAR(100) NOT NULL,
  `target_title` VARCHAR(255) NOT NULL,
  `source_type` VARCHAR(50) NULL,
  `extra_json` JSON NULL,
  `created_by` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_relations_project_id`(`project_id`),
  INDEX `idx_project_relations_type`(`relation_type`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_project_relations_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `project_activities` (
  `id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `actor_id` VARCHAR(50) NOT NULL,
  `activity_type` VARCHAR(50) NOT NULL,
  `target_type` VARCHAR(50) NULL,
  `target_id` VARCHAR(100) NULL,
  `content_summary` TEXT NOT NULL,
  `extra_json` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_activities_project_id`(`project_id`),
  INDEX `idx_project_activities_actor_id`(`actor_id`),
  INDEX `idx_project_activities_created_at`(`created_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_project_activities_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_activities_actor` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `project_read_logs` (
  `id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `client_type` VARCHAR(30) NULL,
  `read_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_read_logs_project_id`(`project_id`),
  INDEX `idx_project_read_logs_user_id`(`user_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_project_read_logs_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_read_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `project_audit_logs` (
  `id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `module_name` VARCHAR(50) NOT NULL,
  `action_name` VARCHAR(50) NOT NULL,
  `before_json` JSON NULL,
  `after_json` JSON NULL,
  `ip` VARCHAR(64) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_audit_logs_project_id`(`project_id`),
  INDEX `idx_project_audit_logs_created_at`(`created_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_project_audit_logs_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `project_urges` (
  `id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `sender_id` VARCHAR(50) NOT NULL,
  `receiver_id` VARCHAR(50) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_urges_project_id`(`project_id`),
  INDEX `idx_project_urges_sender_id`(`sender_id`),
  INDEX `idx_project_urges_receiver_id`(`receiver_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_project_urges_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_urges_sender` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_urges_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `project_forwards` (
  `id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `sender_id` VARCHAR(50) NOT NULL,
  `receiver_ids` JSON NOT NULL,
  `message` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project_forwards_project_id`(`project_id`),
  INDEX `idx_project_forwards_sender_id`(`sender_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_project_forwards_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_forwards_sender` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `attachments` (
  `id` VARCHAR(50) NOT NULL,
  `biz_type` VARCHAR(50) NOT NULL,
  `biz_id` VARCHAR(50) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_url` TEXT NOT NULL,
  `file_size` INT NULL,
  `uploader_id` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_attachments_biz`(`biz_type`, `biz_id`),
  INDEX `idx_attachments_uploader_id`(`uploader_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_attachments_uploader` FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
