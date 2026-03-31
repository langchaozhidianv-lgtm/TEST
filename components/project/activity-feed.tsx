"use client";

import { useLanguage } from "@/components/language-provider";
import { formatDateTime } from "@/lib/format";
import { getUser } from "@/lib/mock-data";
import type { ProjectActivity } from "@/lib/types";

interface ActivityFeedProps {
  activities: ProjectActivity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const { locale } = useLanguage();

  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">{locale === "zh" ? "动态流" : "Activity Feed"}</p>
          <h2>{locale === "zh" ? "关键操作时间线" : "Timeline of key actions"}</h2>
        </div>
      </div>
      <div className="timeline">
        {activities.map((activity) => (
          <article className="timeline-item" key={activity.id}>
            <div className="timeline-dot" />
            <div>
              <strong>{getUser(activity.actorId)?.name ?? (locale === "zh" ? "未知用户" : "Unknown user")}</strong>
              <p>{activity.contentSummary}</p>
              <span className="muted">{formatDateTime(activity.createdAt)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
