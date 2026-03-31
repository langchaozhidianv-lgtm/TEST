"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language-provider";
import { percentage } from "@/lib/format";
import { getUser } from "@/lib/mock-data";
import type { TeamStats } from "@/lib/types";

interface TeamStatsPageProps {
  stats: TeamStats;
}

export function TeamStatsPage({ stats }: TeamStatsPageProps) {
  const { locale } = useLanguage();

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">{locale === "zh" ? "团队统计" : "Team Stats"}</p>
          <h1>
            {locale === "zh"
              ? "从项目池进入管理视角，查看跨团队执行情况。"
              : "Switch from project execution to a management view across teams."}
          </h1>
          <p className="hero-copy">
            {locale === "zh"
              ? "这个页面对应团队项目统计报表，支持多维度查看项目进展。"
              : "This page acts as the team reporting hub for multi-dimensional project analysis."}
          </p>
        </div>
        <div className="stats-grid">
          <article className="stat-card">
            <span>{locale === "zh" ? "项目总数" : "Total Projects"}</span>
            <strong>{stats.totalProjects}</strong>
          </article>
          <article className="stat-card">
            <span>{locale === "zh" ? "进行中项目" : "Active Projects"}</span>
            <strong>{stats.activeProjects}</strong>
          </article>
          <article className="stat-card">
            <span>{locale === "zh" ? "关闭项目" : "Closed Projects"}</span>
            <strong>{stats.closedProjects}</strong>
          </article>
          <article className="stat-card">
            <span>{locale === "zh" ? "延期任务" : "Overdue Tasks"}</span>
            <strong>{stats.overdueTasks}</strong>
          </article>
          <article className="stat-card accent-card">
            <span>{locale === "zh" ? "团队完成率" : "Team Completion"}</span>
            <strong>{percentage(stats.teamCompletionRate)}</strong>
          </article>
        </div>
      </section>

      <section className="section-block two-column-section">
        <div>
          <div className="section-title">
            <div>
              <p className="eyebrow">{locale === "zh" ? "部门维度" : "Departments"}</p>
              <h2>{locale === "zh" ? "项目与完成率分布" : "Project and completion distribution"}</h2>
            </div>
          </div>
          <div className="list-panel">
            {stats.departmentBreakdown.map((item) => (
              <article className="list-row" key={item.name}>
                <strong>{item.name}</strong>
                <span>
                  {item.projectCount} {locale === "zh" ? "个项目" : "projects"}
                </span>
                <span className="muted">{percentage(item.completionRate)}</span>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="section-title">
            <div>
              <p className="eyebrow">{locale === "zh" ? "人员排行" : "People Ranking"}</p>
              <h2>{locale === "zh" ? "完成与延期 TOP" : "Completion and overdue leaders"}</h2>
            </div>
          </div>
          <div className="list-panel">
            {stats.memberRanking.map((item) => (
              <article className="list-row" key={item.userId}>
                <strong>{getUser(item.userId)?.name ?? item.userId}</strong>
                <span>
                  {locale === "zh" ? "完成" : "Done"} {item.doneTasks}
                </span>
                <span className="muted">
                  {locale === "zh" ? "延期" : "Overdue"} {item.overdueTasks}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-title">
          <div>
            <p className="eyebrow">{locale === "zh" ? "导航" : "Navigation"}</p>
            <h2>{locale === "zh" ? "回到项目主流程" : "Return to project flows"}</h2>
          </div>
        </div>
        <div className="chip-row">
          <Link className="chip" href="/projects">
            {locale === "zh" ? "项目列表" : "Project List"}
          </Link>
          <Link className="chip" href="/projects/project_1">
            CRM Phase 2
          </Link>
        </div>
      </section>
    </main>
  );
}
