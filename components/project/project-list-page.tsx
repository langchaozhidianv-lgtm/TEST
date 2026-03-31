"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/components/language-provider";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectFilterBar } from "@/components/project/project-filter-bar";
import { percentage } from "@/lib/format";
import { userOptions } from "@/lib/user-options";
import type { Project, TeamStats } from "@/lib/types";

interface ProjectListPageProps {
  projects: Project[];
  teamStats: TeamStats;
  filters?: {
    keyword?: string;
    status?: string;
    ownerId?: string;
    sortBy?: "updatedAt" | "createdAt" | "endDate" | "name";
    sortOrder?: "asc" | "desc";
  };
}

export function ProjectListPage({ projects, teamStats, filters }: ProjectListPageProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        ownerId: String(formData.get("ownerId") ?? "user_1"),
        visibilityScope: String(formData.get("visibilityScope") ?? "TEAM"),
        startDate: formData.get("startDate") ? new Date(String(formData.get("startDate"))).toISOString() : undefined,
        endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))).toISOString() : undefined,
        tags: String(formData.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      })
    });

    if (!response.ok) {
      setError(locale === "zh" ? "创建项目失败。" : "Failed to create project.");
      return;
    }

    setShowCreateForm(false);
    startTransition(() => {
      router.refresh();
    });
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      const text = String(value).trim();
      if (text) {
        params.set(key, text);
      }
    }

    window.location.href = `/projects${params.toString() ? `?${params.toString()}` : ""}`;
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Project Management MVP</p>
          <h1>
            {locale === "zh"
              ? "项目列表、看板、甘特图和动态流已经连接到统一的数据底座。"
              : "Project list, board, gantt, and activity now share one real data backbone."}
          </h1>
          <p className="hero-copy">
            {locale === "zh"
              ? "你可以直接在页面里创建项目，数据会通过 Prisma 持久化到 MySQL。"
              : "This page now supports creating projects directly from the UI and persists data to MySQL through Prisma."}
          </p>
        </div>
        <div className="stats-grid">
          <article className="stat-card">
            <span>{locale === "zh" ? "项目总数" : "Total Projects"}</span>
            <strong>{teamStats.totalProjects}</strong>
          </article>
          <article className="stat-card">
            <span>{locale === "zh" ? "进行中项目" : "Active Projects"}</span>
            <strong>{teamStats.activeProjects}</strong>
          </article>
          <article className="stat-card">
            <span>{locale === "zh" ? "已关闭项目" : "Closed Projects"}</span>
            <strong>{teamStats.closedProjects}</strong>
          </article>
          <article className="stat-card">
            <span>{locale === "zh" ? "团队完成率" : "Team Completion"}</span>
            <strong>{percentage(teamStats.teamCompletionRate)}</strong>
          </article>
        </div>
        <div className="hero-actions">
          <button className="action-button" onClick={() => setShowCreateForm((value) => !value)} type="button">
            {showCreateForm ? (locale === "zh" ? "取消" : "Cancel") : locale === "zh" ? "新建项目" : "New Project"}
          </button>
        </div>
        {showCreateForm ? (
          <form className="inline-form" onSubmit={handleCreateProject}>
            <input name="name" placeholder={locale === "zh" ? "项目名称" : "Project name"} required />
            <input name="description" placeholder={locale === "zh" ? "项目描述" : "Description"} />
            <select defaultValue="user_1" name="ownerId">
              {userOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <select defaultValue="TEAM" name="visibilityScope">
              <option value="PRIVATE">{locale === "zh" ? "私有" : "Private"}</option>
              <option value="TEAM">{locale === "zh" ? "团队" : "Team"}</option>
              <option value="SPECIFIC">{locale === "zh" ? "指定成员" : "Specific"}</option>
              <option value="PUBLIC">{locale === "zh" ? "公开" : "Public"}</option>
            </select>
            <input name="startDate" type="date" />
            <input name="endDate" type="date" />
            <input name="tags" placeholder={locale === "zh" ? "标签，逗号分隔" : "tags,comma,separated"} />
            <button className="action-button" disabled={isPending} type="submit">
              {isPending ? (locale === "zh" ? "保存中..." : "Saving...") : locale === "zh" ? "创建" : "Create"}
            </button>
            {error ? <p className="form-error">{error}</p> : null}
          </form>
        ) : null}
      </section>

      <ProjectFilterBar />

      <section className="section-block">
        <div className="section-title">
          <div>
            <p className="eyebrow">{locale === "zh" ? "搜索与筛选" : "Search & Filter"}</p>
            <h2>{locale === "zh" ? "按关键词、状态、负责人和排序查看项目" : "Browse by keyword, status, owner, and sorting"}</h2>
          </div>
        </div>
        <form className="inline-form" onSubmit={applyFilters}>
          <input defaultValue={filters?.keyword} name="keyword" placeholder={locale === "zh" ? "项目名称关键词" : "Project keyword"} />
          <select defaultValue={filters?.status ?? ""} name="status">
            <option value="">{locale === "zh" ? "全部状态" : "All statuses"}</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CLOSED">CLOSED</option>
            <option value="DRAFT">DRAFT</option>
          </select>
          <select defaultValue={filters?.ownerId ?? ""} name="ownerId">
            <option value="">{locale === "zh" ? "全部负责人" : "All owners"}</option>
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <select defaultValue={filters?.sortBy ?? "updatedAt"} name="sortBy">
            <option value="updatedAt">{locale === "zh" ? "按更新时间" : "Updated At"}</option>
            <option value="createdAt">{locale === "zh" ? "按创建时间" : "Created At"}</option>
            <option value="endDate">{locale === "zh" ? "按结束时间" : "End Date"}</option>
            <option value="name">{locale === "zh" ? "按名称" : "Name"}</option>
          </select>
          <select defaultValue={filters?.sortOrder ?? "desc"} name="sortOrder">
            <option value="desc">{locale === "zh" ? "降序" : "Desc"}</option>
            <option value="asc">{locale === "zh" ? "升序" : "Asc"}</option>
          </select>
          <button className="action-button" type="submit">
            {locale === "zh" ? "应用" : "Apply"}
          </button>
        </form>
      </section>

      <section className="section-block">
        <div className="section-title">
          <div>
            <p className="eyebrow">{locale === "zh" ? "项目池" : "Project Pool"}</p>
            <h2>{locale === "zh" ? "当前项目" : "Current projects"}</h2>
          </div>
          <p className="muted">
            {locale === "zh"
              ? "你现在可以在这个页面直接创建记录，并在刷新后立即看到结果。"
              : "You can now create new records from the page and see them immediately after refresh."}
          </p>
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
