import type { ProjectRelation } from "@/lib/types";

interface RelationPanelProps {
  relations: ProjectRelation[];
}

export function RelationPanel({ relations }: RelationPanelProps) {
  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">关联对象</p>
          <h2>统一关系模型</h2>
        </div>
      </div>
      <div className="relation-list">
        {relations.map((relation) => (
          <article className="relation-card" key={relation.id}>
            <span className="tag-pill">{relation.relationType}</span>
            <strong>{relation.targetTitle}</strong>
            <p className="muted">
              {relation.targetId}
              {relation.sourceType ? ` · ${relation.sourceType}` : ""}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
