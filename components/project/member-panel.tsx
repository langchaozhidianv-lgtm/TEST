import { formatDateTime } from "@/lib/format";
import type { ProjectMemberRecord, User } from "@/lib/types";

interface DecoratedMember extends ProjectMemberRecord {
  user?: User;
}

interface MemberPanelProps {
  participants: DecoratedMember[];
  viewers: DecoratedMember[];
}

export function MemberPanel({ participants, viewers }: MemberPanelProps) {
  return (
    <section className="section-block two-column-section">
      <div>
        <div className="section-title">
          <div>
            <p className="eyebrow">参与人</p>
            <h2>执行成员</h2>
          </div>
        </div>
        <div className="list-panel">
          {participants.map((member) => (
            <article className="list-row" key={member.id}>
              <strong>{member.user?.name ?? member.userId}</strong>
              <span>{member.roleType}</span>
              <span className="muted">{formatDateTime(member.joinedAt)}</span>
            </article>
          ))}
        </div>
      </div>
      <div>
        <div className="section-title">
          <div>
            <p className="eyebrow">共享人</p>
            <h2>只读与关注成员</h2>
          </div>
        </div>
        <div className="list-panel">
          {viewers.map((member) => (
            <article className="list-row" key={member.id}>
              <strong>{member.user?.name ?? member.userId}</strong>
              <span>{member.roleType}</span>
              <span className="muted">{formatDateTime(member.joinedAt)}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
