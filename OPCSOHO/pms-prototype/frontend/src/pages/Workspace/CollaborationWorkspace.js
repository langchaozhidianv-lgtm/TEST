import React, { useEffect, useState } from "react";
import ActionButton from "../../components/Common/ActionButton";
import DataTable from "../../components/Common/DataTable";
import StatusBadge from "../../components/Common/StatusBadge";

const storageKey = "jx-pms-collaboration-board";

const emptyItem = {
  id: "",
  team: "",
  topic: "",
  assignee: "",
  due_date: "",
  status: "PENDING"
};

export default function CollaborationWorkspace() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(emptyItem);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const saveItem = () => {
    if (!editing.team || !editing.topic) {
      return;
    }

    setItems((prev) => {
      if (editing.id) {
        return prev.map((item) => (item.id === editing.id ? editing : item));
      }
      return [{ ...editing, id: `collab-${Date.now()}` }, ...prev];
    });
    setEditing(emptyItem);
  };

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">组织协同</h1>
          <p className="page-subtitle">
            将跨团队协同做成真正的工作台，支持事项台账、责任人、截止时间与状态维护。
          </p>
        </div>
        <div className="hero-actions">
          <ActionButton variant="primary" onClick={saveItem}>保存协同事项</ActionButton>
        </div>
      </section>

      <section className="workspace-grid">
        <article className="panel-card">
          <div className="section-heading">
            <h2>协同事项编辑区</h2>
            <span>适用于组织协同、跨部门配合和项目专题会事项</span>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>协同团队</span>
              <input value={editing.team} onChange={(event) => setEditing((prev) => ({ ...prev, team: event.target.value }))} />
            </label>
            <label className="form-field">
              <span>责任人</span>
              <input value={editing.assignee} onChange={(event) => setEditing((prev) => ({ ...prev, assignee: event.target.value }))} />
            </label>
            <label className="form-field full">
              <span>协同主题</span>
              <input value={editing.topic} onChange={(event) => setEditing((prev) => ({ ...prev, topic: event.target.value }))} />
            </label>
            <label className="form-field">
              <span>截止日期</span>
              <input type="date" value={editing.due_date || ""} onChange={(event) => setEditing((prev) => ({ ...prev, due_date: event.target.value }))} />
            </label>
            <label className="form-field">
              <span>状态</span>
              <select value={editing.status} onChange={(event) => setEditing((prev) => ({ ...prev, status: event.target.value }))}>
                <option value="PENDING">待处理</option>
                <option value="IN_PROGRESS">执行中</option>
                <option value="COMPLETED">已完成</option>
                <option value="DELAYED">已延期</option>
              </select>
            </label>
          </div>
          <div className="form-actions">
            <ActionButton variant="primary" onClick={saveItem}>
              {editing.id ? "更新事项" : "新增事项"}
            </ActionButton>
            <ActionButton onClick={() => setEditing(emptyItem)}>清空</ActionButton>
          </div>
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <h2>协同事项台账</h2>
            <span>所有修改保存在浏览器本地，方便演示协同流程</span>
          </div>
          <DataTable
            rowKey="id"
            columns={[
              { key: "team", title: "协同团队" },
              { key: "topic", title: "协同主题" },
              { key: "assignee", title: "责任人" },
              { key: "due_date", title: "截止日期" },
              { key: "status", title: "状态", render: (value) => <StatusBadge value={value} /> }
            ]}
            rows={items}
            actions={(row) => (
              <div className="btn-row">
                <ActionButton onClick={() => setEditing(row)}>编辑</ActionButton>
                <ActionButton variant="danger" onClick={() => setItems((prev) => prev.filter((item) => item.id !== row.id))}>
                  删除
                </ActionButton>
              </div>
            )}
          />
        </article>
      </section>
    </div>
  );
}
