import { ProjectListPage } from "@/components/project/project-list-page";
import { getTeamStatsData, listProjectsData } from "@/lib/server-data";
import type { ProjectStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProjectsPageProps {
  searchParams?: {
    keyword?: string;
    status?: ProjectStatus;
    ownerId?: string;
    sortBy?: "updatedAt" | "createdAt" | "endDate" | "name";
    sortOrder?: "asc" | "desc";
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const [projects, teamStats] = await Promise.all([
    listProjectsData(searchParams),
    getTeamStatsData()
  ]);

  return <ProjectListPage filters={searchParams} projects={projects} teamStats={teamStats} />;
}
