"use client";

import { FormEvent, useState } from "react";

import { useLanguage } from "@/components/language-provider";
import { formatDateTime } from "@/lib/format";
import { getUser } from "@/lib/mock-data";
import { userOptions } from "@/lib/user-options";
import type { ProjectForward, ProjectShareLink, ProjectUrge } from "@/lib/types";

interface CollaborationPanelProps {
  projectId: string;
  urges: ProjectUrge[];
  forwards: ProjectForward[];
  shareLink: ProjectShareLink;
  onChanged?: () => Promise<void> | void;
}

export function CollaborationPanel({ projectId, urges, forwards, shareLink, onChanged }: CollaborationPanelProps) {
  const { locale } = useLanguage();
  const [showUrgeForm, setShowUrgeForm] = useState(false);
  const [showForwardForm, setShowForwardForm] = useState(false);

  async function submitUrge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await fetch(`/api/projects/${projectId}/urge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverIds: [String(formData.get("receiverId") ?? "")],
        content: String(formData.get("content") ?? "")
      })
    });
    setShowUrgeForm(false);
    await onChanged?.();
  }

  async function submitForward(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await fetch(`/api/projects/${projectId}/forward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverIds: [String(formData.get("receiverId") ?? "")],
        message: String(formData.get("message") ?? "")
      })
    });
    setShowForwardForm(false);
    await onChanged?.();
  }

  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">{locale === "zh" ? "协作动作" : "Collaboration"}</p>
          <h2>{locale === "zh" ? "催办、转发与分享链接" : "Urges, forwards, and sharing"}</h2>
        </div>
      </div>

      <div className="toolbar-actions">
        <button className="action-button" onClick={() => setShowUrgeForm((v) => !v)} type="button">
          {showUrgeForm ? (locale === "zh" ? "关闭催办" : "Close Urge") : locale === "zh" ? "发起催办" : "Send Urge"}
        </button>
        <button className="action-button secondary-button" onClick={() => setShowForwardForm((v) => !v)} type="button">
          {showForwardForm ? (locale === "zh" ? "关闭转发" : "Close Forward") : locale === "zh" ? "转发项目" : "Forward Project"}
        </button>
      </div>

      {showUrgeForm ? (
        <form className="inline-form compact-form" onSubmit={submitUrge}>
          <select defaultValue="user_2" name="receiverId">
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <input name="content" placeholder={locale === "zh" ? "催办内容" : "Urge content"} required />
          <button className="action-button" type="submit">
            {locale === "zh" ? "发送催办" : "Send Urge"}
          </button>
        </form>
      ) : null}

      {showForwardForm ? (
        <form className="inline-form compact-form" onSubmit={submitForward}>
          <select defaultValue="user_5" name="receiverId">
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <input name="message" placeholder={locale === "zh" ? "转发说明" : "Forward message"} required />
          <button className="action-button" type="submit">
            {locale === "zh" ? "发送转发" : "Send Forward"}
          </button>
        </form>
      ) : null}

      <div className="three-column-grid">
        <article className="relation-card">
          <span className="tag-pill">{locale === "zh" ? "分享链接" : "Share Link"}</span>
          <strong>{locale === "zh" ? "项目临时访问地址" : "Temporary access URL"}</strong>
          <p className="code-line">{shareLink.url}</p>
          <p className="muted">
            {locale === "zh" ? "过期时间：" : "Expires: "}
            {formatDateTime(shareLink.expireAt)}
          </p>
        </article>
        <article className="relation-card">
          <span className="tag-pill">{locale === "zh" ? "最近催办" : "Recent Urges"}</span>
          {urges.map((urge) => (
            <div key={urge.id}>
              <strong>{getUser(urge.senderId)?.name ?? urge.senderId}</strong>
              <p>{urge.content}</p>
              <p className="muted">{formatDateTime(urge.createdAt)}</p>
            </div>
          ))}
        </article>
        <article className="relation-card">
          <span className="tag-pill">{locale === "zh" ? "最近转发" : "Recent Forwards"}</span>
          {forwards.map((forward) => (
            <div key={forward.id}>
              <strong>{getUser(forward.senderId)?.name ?? forward.senderId}</strong>
              <p>{forward.message ?? (locale === "zh" ? "未填写转发说明" : "No forward note")}</p>
              <p className="muted">{formatDateTime(forward.createdAt)}</p>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}
