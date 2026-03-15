import { formatDateTime } from "@/lib/format";
import { getUser } from "@/lib/mock-data";
import type { ProjectAuditLog, ProjectReadLog } from "@/lib/types";

interface AuditLogPanelProps {
  auditLogs: ProjectAuditLog[];
  readLogs: ProjectReadLog[];
}

export function AuditLogPanel({ auditLogs, readLogs }: AuditLogPanelProps) {
  return (
    <section className="section-block two-column-section">
      <div>
        <div className="section-title">
          <div>
            <p className="eyebrow">查阅记录</p>
            <h2>谁看过项目</h2>
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
            <p className="eyebrow">操作日志</p>
            <h2>审计追踪</h2>
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
