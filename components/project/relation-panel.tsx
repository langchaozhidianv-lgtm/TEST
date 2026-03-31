"use client";

import { FormEvent, useState } from "react";

import { useLanguage } from "@/components/language-provider";
import type { ProjectRelation } from "@/lib/types";

interface RelationPanelProps {
  projectId: string;
  relations: ProjectRelation[];
  onChanged?: () => Promise<void> | void;
}

export function RelationPanel({ projectId, relations, onChanged }: RelationPanelProps) {
  const { locale } = useLanguage();
  const [showForm, setShowForm] = useState(false);

  async function createRelation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await fetch(`/api/projects/${projectId}/relations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        relationType: String(formData.get("relationType") ?? "DOCUMENT"),
        targetId: String(formData.get("targetId") ?? ""),
        targetTitle: String(formData.get("targetTitle") ?? ""),
        sourceType: String(formData.get("sourceType") ?? "")
      })
    });
    setShowForm(false);
    await onChanged?.();
  }

  async function deleteRelation(relationId: string) {
    await fetch(`/api/projects/${projectId}/relations/${relationId}`, {
      method: "DELETE"
    });
    await onChanged?.();
  }

  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">{locale === "zh" ? "关联对象" : "Related Records"}</p>
          <h2>{locale === "zh" ? "统一关联模型" : "Unified relation model"}</h2>
        </div>
        <button className="action-button" onClick={() => setShowForm((value) => !value)} type="button">
          {showForm ? (locale === "zh" ? "关闭表单" : "Close Form") : locale === "zh" ? "新增关联" : "Add Relation"}
        </button>
      </div>
      {showForm ? (
        <form className="inline-form compact-form" onSubmit={createRelation}>
          <select defaultValue="DOCUMENT" name="relationType">
            <option value="DOCUMENT">DOCUMENT</option>
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="OPPORTUNITY">OPPORTUNITY</option>
            <option value="APPROVAL">APPROVAL</option>
            <option value="SCHEDULE">SCHEDULE</option>
            <option value="DATA">DATA</option>
            <option value="PROJECT">PROJECT</option>
            <option value="OTHER">OTHER</option>
          </select>
          <input name="targetId" placeholder={locale === "zh" ? "目标 ID" : "Target ID"} required />
          <input name="targetTitle" placeholder={locale === "zh" ? "目标标题" : "Target title"} required />
          <input name="sourceType" placeholder={locale === "zh" ? "来源类型" : "Source type"} />
          <button className="action-button" type="submit">
            {locale === "zh" ? "创建关联" : "Create Relation"}
          </button>
        </form>
      ) : null}
      <div className="relation-list">
        {relations.map((relation) => (
          <article className="relation-card" key={relation.id}>
            <span className="tag-pill">{relation.relationType}</span>
            <strong>{relation.targetTitle}</strong>
            <p className="muted">
              {relation.targetId}
              {relation.sourceType ? ` / ${relation.sourceType}` : ""}
            </p>
            <button className="text-button danger-button" onClick={() => deleteRelation(relation.id)} type="button">
              {locale === "zh" ? "删除" : "Delete"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
