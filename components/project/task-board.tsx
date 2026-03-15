import { TaskGroupColumn } from "@/components/project/task-group-column";
import type { Task, TaskGroup } from "@/lib/types";

interface TaskBoardProps {
  groups: TaskGroup[];
  tasks: Task[];
}

export function TaskBoard({ groups, tasks }: TaskBoardProps) {
  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">任务看板</p>
          <h2>分组 + 拖拽模型的基础骨架</h2>
        </div>
        <p className="muted">当前版本先完成结构与字段展示，后续直接接入拖拽排序和跨分组移动。</p>
      </div>

      <div className="task-board">
        {groups.map((group) => (
          <TaskGroupColumn
            group={group}
            key={group.id}
            tasks={tasks.filter((task) => task.groupId === group.id)}
          />
        ))}
      </div>
    </section>
  );
}
