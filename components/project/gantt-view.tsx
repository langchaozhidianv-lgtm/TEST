"use client";

import { FormEvent, useState } from "react";

import { useLanguage } from "@/components/language-provider";
import { formatDate } from "@/lib/format";
import type { Project, Task, TaskDependency } from "@/lib/types";

interface GanttViewProps {
  projectId: string;
  project: Project;
  tasks: Task[];
  dependencies: TaskDependency[];
  onChanged?: () => Promise<void> | void;
}

function daysBetween(start: Date, end: Date) {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

export function GanttView({ projectId, project, tasks, dependencies, onChanged }: GanttViewProps) {
  const { locale } = useLanguage();
  const [showDependencyForm, setShowDependencyForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const projectStart = new Date(project.startDate ?? Date.now());
  const projectEnd = new Date(project.endDate ?? Date.now());
  const totalDays = daysBetween(projectStart, projectEnd);

  async function createDependency(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await fetch(`/api/projects/${projectId}/task-dependencies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        predecessorTaskId: String(formData.get("predecessorTaskId") ?? ""),
        successorTaskId: String(formData.get("successorTaskId") ?? ""),
        dependencyType: String(formData.get("dependencyType") ?? "FS"),
        lagDays: Number(formData.get("lagDays") ?? 0)
      })
    });
    setShowDependencyForm(false);
    await onChanged?.();
  }

  async function updateSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await fetch(`/api/projects/${projectId}/tasks/batch-schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: [
          {
            taskId: String(formData.get("taskId") ?? ""),
            startAt: formData.get("startAt") ? new Date(String(formData.get("startAt"))).toISOString() : null,
            endAt: formData.get("endAt") ? new Date(String(formData.get("endAt"))).toISOString() : null
          }
        ]
      })
    });
    setShowScheduleForm(false);
    await onChanged?.();
  }

  async function deleteDependency(dependencyId: string) {
    await fetch(`/api/projects/${projectId}/task-dependencies/${dependencyId}`, {
      method: "DELETE"
    });
    await onChanged?.();
  }

  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">{locale === "zh" ? "甘特图" : "Gantt"}</p>
          <h2>{locale === "zh" ? "任务排期与依赖关系" : "Scheduling and dependencies"}</h2>
        </div>
        <div className="toolbar-actions">
          <p className="muted">
            {locale === "zh"
              ? "当前支持依赖关系增删，排期通过表单编辑并实时同步。"
              : "Dependency creation and deletion are live. Schedule updates sync immediately."}
          </p>
          <button className="action-button" onClick={() => setShowDependencyForm((value) => !value)} type="button">
            {showDependencyForm ? (locale === "zh" ? "关闭" : "Close") : locale === "zh" ? "新增依赖" : "Add Dependency"}
          </button>
          <button className="action-button secondary-button" onClick={() => setShowScheduleForm((value) => !value)} type="button">
            {showScheduleForm ? (locale === "zh" ? "关闭排期" : "Close Schedule") : locale === "zh" ? "编辑排期" : "Edit Schedule"}
          </button>
        </div>
      </div>

      {showDependencyForm ? (
        <form className="inline-form" onSubmit={createDependency}>
          <select defaultValue={tasks[0]?.id} name="predecessorTaskId">
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
          <select defaultValue={tasks[1]?.id ?? tasks[0]?.id} name="successorTaskId">
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
          <select defaultValue="FS" name="dependencyType">
            <option value="FS">FS</option>
            <option value="SS">SS</option>
            <option value="FF">FF</option>
            <option value="SF">SF</option>
          </select>
          <input defaultValue={0} min={0} name="lagDays" type="number" />
          <button className="action-button" type="submit">
            {locale === "zh" ? "创建依赖" : "Create Dependency"}
          </button>
        </form>
      ) : null}
      {showScheduleForm ? (
        <form className="inline-form compact-form" onSubmit={updateSchedule}>
          <select defaultValue={tasks[0]?.id} name="taskId">
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
          <input name="startAt" type="date" />
          <input name="endAt" type="date" />
          <button className="action-button" type="submit">
            {locale === "zh" ? "保存排期" : "Save Schedule"}
          </button>
        </form>
      ) : null}

      <div className="gantt-grid">
        {tasks.map((task) => {
          const start = new Date(task.startAt ?? projectStart);
          const end = new Date(task.endAt ?? start);
          const offset = daysBetween(projectStart, start) - 1;
          const span = daysBetween(start, end);
          const left = (offset / totalDays) * 100;
          const width = (span / totalDays) * 100;

          return (
            <div className="gantt-row" key={task.id}>
              <div className="gantt-label">
                <strong>{task.title}</strong>
                <span>
                  {formatDate(task.startAt)} - {formatDate(task.endAt)}
                </span>
              </div>
              <div className="gantt-track">
                <div
                  className={`gantt-bar gantt-${task.status.toLowerCase()}`}
                  style={{ left: `${left}%`, width: `${Math.max(width, 6)}%` }}
                >
                  <span>{task.progressPercent}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dependency-panel">
        <h3>{locale === "zh" ? "依赖关系" : "Dependencies"}</h3>
        <div className="dependency-list">
          {dependencies.map((dependency) => (
            <article className="dependency-card" key={dependency.id}>
              <strong>
                {dependency.predecessorTaskId} -&gt; {dependency.successorTaskId}
              </strong>
              <span>
                {dependency.dependencyType} / Lag {dependency.lagDays} {locale === "zh" ? "天" : "days"}
              </span>
              <button className="text-button danger-button" onClick={() => deleteDependency(dependency.id)} type="button">
                {locale === "zh" ? "删除" : "Delete"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
