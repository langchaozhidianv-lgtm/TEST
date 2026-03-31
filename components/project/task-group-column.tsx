"use client";

import { DragEvent, FormEvent, useState } from "react";

import { useLanguage } from "@/components/language-provider";
import { TaskCard } from "@/components/project/task-card";
import type { Task, TaskGroup } from "@/lib/types";

interface TaskGroupColumnProps {
  group: TaskGroup;
  tasks: Task[];
  onDeleteTask?: (taskId: string) => Promise<void>;
  onUpdateTask?: (taskId: string, payload: Record<string, unknown>) => Promise<void>;
  onRenameGroup?: (groupId: string, name: string) => Promise<void>;
  onDeleteGroup?: (groupId: string) => Promise<void>;
  onMoveTask?: (taskId: string, targetGroupId: string) => Promise<void>;
}

export function TaskGroupColumn({
  group,
  tasks,
  onDeleteTask,
  onUpdateTask,
  onRenameGroup,
  onDeleteGroup,
  onMoveTask
}: TaskGroupColumnProps) {
  const { locale } = useLanguage();
  const [editingName, setEditingName] = useState(false);

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onRenameGroup) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    await onRenameGroup(group.id, String(formData.get("name") ?? group.name));
    setEditingName(false);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
  }

  async function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/task-id");
    if (taskId && onMoveTask) {
      await onMoveTask(taskId, group.id);
    }
  }

  return (
    <section className="task-column" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="task-column-header">
        <div>
          <h3>{group.name}</h3>
          <span>{tasks.length}</span>
        </div>
        <div className="card-actions">
          <button className="text-button" onClick={() => setEditingName((value) => !value)} type="button">
            {editingName ? (locale === "zh" ? "关闭" : "Close") : locale === "zh" ? "重命名" : "Rename"}
          </button>
          {!group.isDefault && onDeleteGroup ? (
            <button className="text-button danger-button" onClick={() => onDeleteGroup(group.id)} type="button">
              {locale === "zh" ? "删除分组" : "Delete Group"}
            </button>
          ) : null}
        </div>
      </div>
      {editingName ? (
        <form className="inline-form compact-form" onSubmit={handleRename}>
          <input defaultValue={group.name} name="name" required />
          <button className="action-button" type="submit">
            {locale === "zh" ? "保存分组" : "Save Group"}
          </button>
        </form>
      ) : null}
      <div className="task-column-list">
        {tasks.length === 0 ? <p className="empty-state">{locale === "zh" ? "当前分组暂无任务" : "No tasks yet"}</p> : null}
        {tasks.map((task) => (
          <TaskCard key={task.id} onDelete={onDeleteTask} onUpdate={onUpdateTask} task={task} />
        ))}
      </div>
    </section>
  );
}
