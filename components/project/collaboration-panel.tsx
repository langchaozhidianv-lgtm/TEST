import { formatDateTime } from "@/lib/format";
import { getUser } from "@/lib/mock-data";
import type { ProjectForward, ProjectShareLink, ProjectUrge } from "@/lib/types";

interface CollaborationPanelProps {
  urges: ProjectUrge[];
  forwards: ProjectForward[];
  shareLink: ProjectShareLink;
}

export function CollaborationPanel({ urges, forwards, shareLink }: CollaborationPanelProps) {
  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">协作动作</p>
          <h2>催办、转发与分享链接</h2>
        </div>
        <p className="muted">当前版本先提供可视化面板和对应 API，下一步可接弹窗表单与真实通知。</p>
      </div>

      <div className="three-column-grid">
        <article className="relation-card">
          <span className="tag-pill">分享链接</span>
          <strong>项目临时访问地址</strong>
          <p className="code-line">{shareLink.url}</p>
          <p className="muted">过期时间：{formatDateTime(shareLink.expireAt)}</p>
        </article>
        <article className="relation-card">
          <span className="tag-pill">最近催办</span>
          {urges.map((urge) => (
            <div key={urge.id}>
              <strong>{getUser(urge.senderId)?.name ?? urge.senderId}</strong>
              <p>{urge.content}</p>
              <p className="muted">{formatDateTime(urge.createdAt)}</p>
            </div>
          ))}
        </article>
        <article className="relation-card">
          <span className="tag-pill">最近转发</span>
          {forwards.map((forward) => (
            <div key={forward.id}>
              <strong>{getUser(forward.senderId)?.name ?? forward.senderId}</strong>
              <p>{forward.message ?? "未填写转发说明"}</p>
              <p className="muted">{formatDateTime(forward.createdAt)}</p>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}
