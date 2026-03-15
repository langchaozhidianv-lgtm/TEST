import type { Project, ProjectStats, Task, TeamStats } from "@/lib/types";

const activeTaskStatuses = new Set(["READY", "IN_PROGRESS", "BLOCKED"]);

export function calculateProjectStats(tasks: Task[]): ProjectStats {
  const now = Date.now();
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((task) => task.status === "DONE").length;
  const inProgressTasks = tasks.filter((task) => activeTaskStatuses.has(task.status)).length;
  const overdueTasks = tasks.filter((task) => {
    if (!task.endAt) {
      return false;
    }

    return new Date(task.endAt).getTime() < now && !["DONE", "CANCELED"].includes(task.status);
  }).length;

  return {
    totalTasks,
    doneTasks,
    inProgressTasks,
    overdueTasks,
    completionRate: totalTasks === 0 ? 0 : doneTasks / totalTasks
  };
}

export function calculateTeamStats(projects: Project[], tasks: Task[]): TeamStats {
  const activeProjects = projects.filter((project) => project.status === "ACTIVE").length;
  const closedProjects = projects.filter((project) => project.status === "CLOSED").length;
  const completionStats = calculateProjectStats(tasks);
  const overdueTasks = tasks.filter((task) => {
    if (!task.endAt) {
      return false;
    }

    return new Date(task.endAt).getTime() < Date.now() && !["DONE", "CANCELED"].includes(task.status);
  }).length;

  return {
    totalProjects: projects.length,
    activeProjects,
    closedProjects,
    teamCompletionRate: completionStats.completionRate,
    overdueTasks,
    departmentBreakdown: [],
    memberRanking: []
  };
}
