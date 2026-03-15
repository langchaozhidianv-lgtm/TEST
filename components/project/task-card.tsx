import { formatDate } from "@/lib/format";
import { getUser } from "@/lib/mock-data";
import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const assignee = getUser(task.assigneeId);

  return (
    <article className="task-card">
      <div className="card-topline">
        <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
        <span className="muted">{task.status}</span>
      </div>
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <div className="task-progress">
        <div className="task-progress-bar" style={{ width: `${task.progressPercent}%` }} />
      </div>
      <div className="meta-grid compact">
        <span>负责人</span>
        <strong>{assignee?.name ?? "--"}</strong>
        <span>开始</span>
        <strong>{formatDate(task.startAt)}</strong>
        <span>结束</span>
        <strong>{formatDate(task.endAt)}</strong>
      </div>
    </article>
  );
}
