import { formatDate } from "@/lib/format";
import type { Project, Task, TaskDependency } from "@/lib/types";

interface GanttViewProps {
  project: Project;
  tasks: Task[];
  dependencies: TaskDependency[];
}

function daysBetween(start: Date, end: Date) {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

export function GanttView({ project, tasks, dependencies }: GanttViewProps) {
  const projectStart = new Date(project.startDate ?? Date.now());
  const projectEnd = new Date(project.endDate ?? Date.now());
  const totalDays = daysBetween(projectStart, projectEnd);

  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">甘特图</p>
          <h2>任务排期与依赖关系</h2>
        </div>
        <p className="muted">当前展示日视图逻辑，后续可扩展周/月粒度、拖拽和关键路径分析。</p>
      </div>

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
        <h3>依赖关系</h3>
        <div className="dependency-list">
          {dependencies.map((dependency) => (
            <article className="dependency-card" key={dependency.id}>
              <strong>
                {dependency.predecessorTaskId} → {dependency.successorTaskId}
              </strong>
              <span>
                {dependency.dependencyType} / Lag {dependency.lagDays} 天
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
