import { formatDateTime } from "@/lib/format";
import { getUser } from "@/lib/mock-data";
import type { ProjectActivity } from "@/lib/types";

interface ActivityFeedProps {
  activities: ProjectActivity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">动态流</p>
          <h2>关键操作时间线</h2>
        </div>
      </div>
      <div className="timeline">
        {activities.map((activity) => (
          <article className="timeline-item" key={activity.id}>
            <div className="timeline-dot" />
            <div>
              <strong>{getUser(activity.actorId)?.name ?? "未知用户"}</strong>
              <p>{activity.contentSummary}</p>
              <span className="muted">{formatDateTime(activity.createdAt)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
