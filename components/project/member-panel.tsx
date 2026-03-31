"use client";

import { FormEvent, useState } from "react";

import { useLanguage } from "@/components/language-provider";
import { formatDateTime } from "@/lib/format";
import { userOptions } from "@/lib/user-options";
import type { ProjectMemberRecord, User } from "@/lib/types";

interface DecoratedMember extends ProjectMemberRecord {
  user?: User;
}

interface MemberPanelProps {
  projectId: string;
  participants: DecoratedMember[];
  viewers: DecoratedMember[];
  onChanged?: () => Promise<void> | void;
}

export function MemberPanel({ projectId, participants, viewers, onChanged }: MemberPanelProps) {
  const { locale } = useLanguage();
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [showViewerForm, setShowViewerForm] = useState(false);

  async function addMember(event: FormEvent<HTMLFormElement>, roleType: "PARTICIPANT" | "VIEWER") {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userId = String(formData.get("userId") ?? "");
    const endpoint = roleType === "VIEWER" ? "shares" : "members";
    await fetch(`/api/projects/${projectId}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userIds: [userId],
        roleType
      })
    });
    setShowParticipantForm(false);
    setShowViewerForm(false);
    await onChanged?.();
  }

  async function removeMember(userId: string, isViewer: boolean) {
    await fetch(`/api/projects/${projectId}/${isViewer ? "shares" : "members"}/${userId}`, {
      method: "DELETE"
    });
    await onChanged?.();
  }

  return (
    <section className="section-block two-column-section">
      <div>
        <div className="section-title">
          <div>
            <p className="eyebrow">{locale === "zh" ? "参与人" : "Participants"}</p>
            <h2>{locale === "zh" ? "执行成员" : "Execution members"}</h2>
          </div>
          <button className="text-button" onClick={() => setShowParticipantForm((value) => !value)} type="button">
            {showParticipantForm ? (locale === "zh" ? "关闭" : "Close") : locale === "zh" ? "新增参与人" : "Add member"}
          </button>
        </div>
        {showParticipantForm ? (
          <form className="inline-form compact-form" onSubmit={(event) => addMember(event, "PARTICIPANT")}>
            <select defaultValue="user_2" name="userId">
              {userOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button className="action-button" type="submit">
              {locale === "zh" ? "添加" : "Add"}
            </button>
          </form>
        ) : null}
        <div className="list-panel">
          {participants.map((member) => (
            <article className="list-row" key={member.id}>
              <strong>{member.user?.name ?? member.userId}</strong>
              <span>{member.roleType}</span>
              <span className="muted">{formatDateTime(member.joinedAt)}</span>
              {member.roleType !== "OWNER" ? (
                <button className="text-button danger-button" onClick={() => removeMember(member.userId, false)} type="button">
                  {locale === "zh" ? "移除" : "Remove"}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </div>
      <div>
        <div className="section-title">
          <div>
            <p className="eyebrow">{locale === "zh" ? "共享人" : "Viewers"}</p>
            <h2>{locale === "zh" ? "只读与关注成员" : "Read-only members"}</h2>
          </div>
          <button className="text-button" onClick={() => setShowViewerForm((value) => !value)} type="button">
            {showViewerForm ? (locale === "zh" ? "关闭" : "Close") : locale === "zh" ? "新增共享人" : "Add viewer"}
          </button>
        </div>
        {showViewerForm ? (
          <form className="inline-form compact-form" onSubmit={(event) => addMember(event, "VIEWER")}>
            <select defaultValue="user_4" name="userId">
              {userOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button className="action-button" type="submit">
              {locale === "zh" ? "添加" : "Add"}
            </button>
          </form>
        ) : null}
        <div className="list-panel">
          {viewers.map((member) => (
            <article className="list-row" key={member.id}>
              <strong>{member.user?.name ?? member.userId}</strong>
              <span>{member.roleType}</span>
              <span className="muted">{formatDateTime(member.joinedAt)}</span>
              <button className="text-button danger-button" onClick={() => removeMember(member.userId, true)} type="button">
                {locale === "zh" ? "移除" : "Remove"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
