"use client";

import { DragEvent, FormEvent, useState } from "react";

import { useLanguage } from "@/components/language-provider";
import { formatDate } from "@/lib/format";
import { getUser } from "@/lib/mock-data";
import { userOptions } from "@/lib/user-options";
import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  onDelete?: (taskId: string) => Promise<void>;
  onUpdate?: (taskId: string, payload: Record<string, unknown>) => Promise<void>;
}

export function TaskCard({ task, onDelete, onUpdate }: TaskCardProps) {
  const { locale } = useLanguage();
  const assignee = getUser(task.assigneeId);
  const [showEditForm, setShowEditForm] = useState(false);

  function handleDragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.setData("text/task-id", task.id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onUpdate) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    await onUpdate(task.id, {
      title: String(formData.get("title") ?? task.title),
      description: String(formData.get("description") ?? ""),
      assigneeId: String(formData.get("assigneeId") ?? ""),
      status: String(formData.get("status") ?? task.status),
      priority: String(formData.get("priority") ?? task.priority),
      progressPercent: Number(formData.get("progressPercent") ?? task.progressPercent),
      startAt: formData.get("startAt") ? new Date(String(formData.get("startAt"))).toISOString() : null,
      endAt: formData.get("endAt") ? new Date(String(formData.get("endAt"))).toISOString() : null
    });
    setShowEditForm(false);
  }

  return (
    <article className="task-card" draggable onDragStart={handleDragStart}>
      <div className="card-topline">
        <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
        <span className="muted">{task.status}</span>
      </div>
      <div className="card-actions">
        <button className="text-button" onClick={() => setShowEditForm((value) => !value)} type="button">
          {showEditForm ? (locale === "zh" ? "关闭" : "Close") : locale === "zh" ? "编辑" : "Edit"}
        </button>
        {onDelete ? (
          <button className="text-button danger-button" onClick={() => onDelete(task.id)} type="button">
            {locale === "zh" ? "删除" : "Delete"}
          </button>
        ) : null}
      </div>
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <div className="task-progress">
        <div className="task-progress-bar" style={{ width: `${task.progressPercent}%` }} />
      </div>
      <div className="meta-grid compact">
        <span>{locale === "zh" ? "负责人" : "Assignee"}</span>
        <strong>{assignee?.name ?? "--"}</strong>
        <span>{locale === "zh" ? "开始" : "Start"}</span>
        <strong>{formatDate(task.startAt)}</strong>
        <span>{locale === "zh" ? "结束" : "End"}</span>
        <strong>{formatDate(task.endAt)}</strong>
      </div>
      {showEditForm ? (
        <form className="inline-form compact-form" onSubmit={handleSubmit}>
          <input defaultValue={task.title} name="title" required />
          <input defaultValue={task.description} name="description" placeholder={locale === "zh" ? "任务描述" : "Description"} />
          <select defaultValue={task.assigneeId ?? "user_1"} name="assigneeId">
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <select defaultValue={task.status} name="status">
            <option value="TODO">TODO</option>
            <option value="READY">READY</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="DONE">DONE</option>
            <option value="CANCELED">CANCELED</option>
          </select>
          <select defaultValue={task.priority} name="priority">
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
          <input defaultValue={task.progressPercent} max={100} min={0} name="progressPercent" type="number" />
          <input defaultValue={task.startAt?.slice(0, 10)} name="startAt" type="date" />
          <input defaultValue={task.endAt?.slice(0, 10)} name="endAt" type="date" />
          <button className="action-button" type="submit">
            {locale === "zh" ? "保存任务" : "Save Task"}
          </button>
        </form>
      ) : null}
    </article>
  );
}
