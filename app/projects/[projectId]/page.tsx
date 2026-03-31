import { notFound } from "next/navigation";

import { ProjectDetailPage } from "@/components/project/project-detail-page";
import { getProjectDetailData } from "@/lib/server-data";

interface ProjectDetailRouteProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectDetailRoute({ params }: ProjectDetailRouteProps) {
  const detail = await getProjectDetailData(params.projectId);

  if (!detail) {
    notFound();
  }

  return (
    <ProjectDetailPage
      activities={detail.activities}
      auditLogs={detail.auditLogs}
      dependencies={detail.dependencies}
      forwards={detail.forwards}
      groups={detail.groups}
      participants={detail.participants}
      project={detail.project}
      readLogs={detail.readLogs}
      relations={detail.relations}
      shareLink={detail.shareLink}
      stats={detail.stats}
      tasks={detail.tasks}
      urges={detail.urges}
      viewers={detail.viewers}
    />
  );
}
