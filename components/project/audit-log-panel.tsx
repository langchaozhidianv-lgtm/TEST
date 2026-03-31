"use client";

import { useLanguage } from "@/components/language-provider";
import { formatDateTime } from "@/lib/format";
import { getUser } from "@/lib/mock-data";
import type { ProjectAuditLog, ProjectReadLog } from "@/lib/types";

interface AuditLogPanelProps {
  auditLogs: ProjectAuditLog[];
  readLogs: ProjectReadLog[];
}

export function AuditLogPanel({ auditLogs, readLogs }: AuditLogPanelProps) {
  const { locale } = useLanguage();

  return (
    <section className="section-block two-column-section">
      <div>
        <div className="section-title">
          <div>
            <p className="eyebrow">{locale === "zh" ? "查阅记录" : "Read Logs"}</p>
            <h2>{locale === "zh" ? "谁看过项目" : "Who viewed the project"}</h2>
          </div>
        </div>
        <div className="list-panel">
          {readLogs.map((log) => (
            <article className="list-row" key={log.id}>
              <strong>{getUser(log.userId)?.name ?? log.userId}</strong>
              <span>{log.clientType}</span>
              <span className="muted">{formatDateTime(log.readAt)}</span>
            </article>
          ))}
        </div>
      </div>

      <div>
        <div className="section-title">
          <div>
            <p className="eyebrow">{locale === "zh" ? "操作日志" : "Audit Logs"}</p>
            <h2>{locale === "zh" ? "审计追踪" : "Audit trail"}</h2>
          </div>
        </div>
        <div className="list-panel">
          {auditLogs.map((log) => (
            <article className="list-row" key={log.id}>
              <strong>
                {log.moduleName} / {log.actionName}
              </strong>
              <span>{getUser(log.userId)?.name ?? log.userId}</span>
              <span className="muted">{formatDateTime(log.createdAt)}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
