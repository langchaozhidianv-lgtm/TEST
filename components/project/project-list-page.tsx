import { ProjectCard } from "@/components/project/project-card";
import { ProjectFilterBar } from "@/components/project/project-filter-bar";
import { percentage } from "@/lib/format";
import type { Project, TeamStats } from "@/lib/types";

interface ProjectListPageProps {
  projects: Project[];
  teamStats: TeamStats;
}

export function ProjectListPage({ projects, teamStats }: ProjectListPageProps) {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Project Management MVP</p>
          <h1>项目列表、看板、甘特图与动态流共用一套主数据。</h1>
          <p className="hero-copy">
            这个最小版本先把项目、任务、依赖关系和统计口径串起来，方便后续直接接 Prisma
            与真实权限体系。
          </p>
        </div>
        <div className="stats-grid">
          <article className="stat-card">
            <span>项目总数</span>
            <strong>{teamStats.totalProjects}</strong>
          </article>
          <article className="stat-card">
            <span>进行中项目</span>
            <strong>{teamStats.activeProjects}</strong>
          </article>
          <article className="stat-card">
            <span>已关闭项目</span>
            <strong>{teamStats.closedProjects}</strong>
          </article>
          <article className="stat-card">
            <span>团队完成率</span>
            <strong>{percentage(teamStats.teamCompletionRate)}</strong>
          </article>
        </div>
      </section>

      <ProjectFilterBar />

      <section className="section-block">
        <div className="section-title">
          <div>
            <p className="eyebrow">项目池</p>
            <h2>当前样例项目</h2>
          </div>
          <p className="muted">支持后续接入搜索、筛选、排序与快速新建项目。</p>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </main>
  );
}
