import { TaskCard } from "@/components/project/task-card";
import type { Task, TaskGroup } from "@/lib/types";

interface TaskGroupColumnProps {
  group: TaskGroup;
  tasks: Task[];
}

export function TaskGroupColumn({ group, tasks }: TaskGroupColumnProps) {
  return (
    <section className="task-column">
      <div className="task-column-header">
        <h3>{group.name}</h3>
        <span>{tasks.length}</span>
      </div>
      <div className="task-column-list">
        {tasks.length === 0 ? <p className="empty-state">当前分组暂无任务</p> : null}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}
