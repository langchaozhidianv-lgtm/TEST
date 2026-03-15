import { notFound } from "next/navigation";

import { ProjectDetailPage } from "@/components/project/project-detail-page";
import {
  getActivitiesByProject,
  getAuditLogsByProject,
  getDependenciesByProject,
  getProjectForwards,
  getProjectById,
  getProjectParticipants,
  getProjectStats,
  getProjectUrges,
  getReadLogsByProject,
  getRelationsByProject,
  getTaskGroupsByProject,
  getTasksByProject,
  getProjectViewers,
  createShareLink
} from "@/lib/mock-data";

interface ProjectDetailRouteProps {
  params: {
    projectId: string;
  };
}

export default function ProjectDetailRoute({ params }: ProjectDetailRouteProps) {
  const project = getProjectById(params.projectId);

  if (!project) {
    notFound();
  }

  return (
    <ProjectDetailPage
      activities={getActivitiesByProject(project.id)}
      auditLogs={getAuditLogsByProject(project.id)}
      dependencies={getDependenciesByProject(project.id)}
      groups={getTaskGroupsByProject(project.id)}
      project={project}
      participants={getProjectParticipants(project.id)}
      readLogs={getReadLogsByProject(project.id)}
      relations={getRelationsByProject(project.id)}
      shareLink={createShareLink(project.id)}
      stats={getProjectStats(project.id)}
      tasks={getTasksByProject(project.id)}
      viewers={getProjectViewers(project.id)}
      urges={getProjectUrges(project.id)}
      forwards={getProjectForwards(project.id)}
    />
  );
}
