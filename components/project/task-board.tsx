"use client";

import { FormEvent, useState } from "react";

import { useLanguage } from "@/components/language-provider";
import { TaskGroupColumn } from "@/components/project/task-group-column";
import { userOptions } from "@/lib/user-options";
import type { Task, TaskGroup } from "@/lib/types";

interface TaskBoardProps {
  projectId: string;
  groups: TaskGroup[];
  tasks: Task[];
  onChanged?: () => void | Promise<void>;
}

export function TaskBoard({ projectId, groups, tasks, onChanged }: TaskBoardProps) {
  const { locale } = useLanguage();
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        assigneeId: String(formData.get("assigneeId") ?? ""),
        groupId: String(formData.get("groupId") ?? ""),
        startAt: formData.get("startAt") ? new Date(String(formData.get("startAt"))).toISOString() : undefined,
        endAt: formData.get("endAt") ? new Date(String(formData.get("endAt"))).toISOString() : undefined,
        priority: String(formData.get("priority") ?? "MEDIUM"),
        status: String(formData.get("status") ?? "TODO")
      })
    });
    setShowCreateTaskForm(false);
    await onChanged?.();
  }

  async function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await fetch(`/api/projects/${projectId}/task-groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? "")
      })
    });
    setShowCreateGroupForm(false);
    await onChanged?.();
  }

  async function renameGroup(groupId: string, name: string) {
    await fetch(`/api/task-groups/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    await onChanged?.();
  }

  async function deleteGroup(groupId: string) {
    await fetch(`/api/task-groups/${groupId}`, {
      method: "DELETE"
    });
    await onChanged?.();
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    await onChanged?.();
  }

  async function updateTask(taskId: string, payload: Record<string, unknown>) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    await onChanged?.();
  }

  async function moveTask(taskId: string, targetGroupId: string) {
    await fetch(`/api/tasks/${taskId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetGroupId
      })
    });
    await onChanged?.();
  }

  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">{locale === "zh" ? "任务看板" : "Task Board"}</p>
          <h2>{locale === "zh" ? "任务与分组管理" : "Task and group management"}</h2>
        </div>
        <div className="toolbar-actions">
          <button className="action-button" onClick={() => setShowCreateTaskForm((value) => !value)} type="button">
            {showCreateTaskForm ? (locale === "zh" ? "关闭任务表单" : "Close Task Form") : locale === "zh" ? "新建任务" : "New Task"}
          </button>
          <button className="action-button secondary-button" onClick={() => setShowCreateGroupForm((value) => !value)} type="button">
            {showCreateGroupForm ? (locale === "zh" ? "关闭分组表单" : "Close Group Form") : locale === "zh" ? "新建分组" : "New Group"}
          </button>
        </div>
      </div>
      {showCreateTaskForm ? (
        <form className="inline-form" onSubmit={createTask}>
          <input name="title" placeholder={locale === "zh" ? "任务标题" : "Task title"} required />
          <input name="description" placeholder={locale === "zh" ? "任务描述" : "Description"} />
          <select defaultValue={groups[0]?.id} name="groupId">
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <select defaultValue="user_1" name="assigneeId">
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <select defaultValue="MEDIUM" name="priority">
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
          <select defaultValue="TODO" name="status">
            <option value="TODO">TODO</option>
            <option value="READY">READY</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="DONE">DONE</option>
          </select>
          <input name="startAt" type="date" />
          <input name="endAt" type="date" />
          <button className="action-button" type="submit">
            {locale === "zh" ? "创建任务" : "Create Task"}
          </button>
        </form>
      ) : null}
      {showCreateGroupForm ? (
        <form className="inline-form compact-form" onSubmit={createGroup}>
          <input name="name" placeholder={locale === "zh" ? "分组名称" : "Group name"} required />
          <button className="action-button" type="submit">
            {locale === "zh" ? "创建分组" : "Create Group"}
          </button>
        </form>
      ) : null}
      <div className="task-board">
        {groups.map((group) => (
          <TaskGroupColumn
            group={group}
            key={group.id}
            onDeleteGroup={deleteGroup}
            onDeleteTask={deleteTask}
            onMoveTask={moveTask}
            onRenameGroup={renameGroup}
            onUpdateTask={updateTask}
            tasks={tasks.filter((task) => task.groupId === group.id)}
          />
        ))}
      </div>
    </section>
  );
}
