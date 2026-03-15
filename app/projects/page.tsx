import { ProjectListPage } from "@/components/project/project-list-page";
import { getProjects, getTeamStats } from "@/lib/mock-data";

export default function ProjectsPage() {
  return <ProjectListPage projects={getProjects()} teamStats={getTeamStats()} />;
}
