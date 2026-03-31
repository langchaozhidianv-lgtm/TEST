import React, { useContext, useEffect, useMemo, useState } from "react";
import ActionButton from "../../components/Common/ActionButton";
import DataTable from "../../components/Common/DataTable";
import StatusBadge from "../../components/Common/StatusBadge";
import { AppContext } from "../../context/AppContext";
import { fetchProjects } from "../../api/projectAPI";
import { fetchFinanceTransactions } from "../../api/financeAPI";
import { formatCurrency } from "../../utils/formatters";

const storageKey = "jx-pms-operations-focus";

const emptyFocus = {
  id: "",
  project_name: "",
  owner: "",
  topic: "",
  next_action: "",
  status: "IN_PROGRESS"
};

export default function OperationsOverview() {
  const { dashboard, loadDashboard, loading } = useContext(AppContext);
  const [projects, setProjects] = useState([]);
  const [financeItems, setFinanceItems] = useState([]);
  const [focusItems, setFocusItems] = useState([]);
  const [editing, setEditing] = useState(emptyFocus);
  const [weeklyMemo, setWeeklyMemo] = useState("");

  useEffect(() => {
    loadDashboard();
    fetchProjects().then(setProjects).catch(() => setProjects([]));
    fetchFinanceTransactions().then(setFinanceItems).catch(() => setFinanceItems([]));
  }, [loadDashboard]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFocusItems(parsed.items || []);
        setWeeklyMemo(parsed.weeklyMemo || "");
      }
    } catch {
      setFocusItems([]);
      setWeeklyMemo("");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ items: focusItems, weeklyMemo }));
  }, [focusItems, weeklyMemo]);

  const metrics = dashboard?.projectStats || {};
  const summaryCards = [
    { label: "在管项目数", value: `${metrics.totalProjects || 0}` },
    { label: "延期项目数", value: `${metrics.delayedProjects || 0}` },
    { label: "合同总金额", value: formatCurrency(metrics.totalContractAmount || 0) },
    { label: "累计回款金额", value: formatCurrency(metrics.totalCollectedAmount || 0) }
  ];

  const paymentRequests = useMemo(
    () =>
      financeItems
        .filter((item) => ["PAYMENT_REQUEST", "PAYMENT_PLAN"].includes(item.transaction_type))
        .slice(0, 5),
    [financeItems]
  );

  const saveFocus = () => {
    if (!editing.project_name || !editing.topic) {
      return;
    }

    setFocusItems((prev) => {
      if (editing.id) {
        return prev.map((item) => (item.id === editing.id ? editing : item));
      }
      return [{ ...editing, id: `focus-${Date.now()}` }, ...prev];
    });
    setEditing(emptyFocus);
  };

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">经营总览</h1>
          <p className="page-subtitle">
            在同一页维护经营重点事项、经营周记和待跟进款项，让顶部工作区真正可编辑。
          </p>
        </div>
        <div className="hero-actions">
          <ActionButton variant="primary" onClick={saveFocus}>保存经营事项</ActionButton>
        </div>
      </section>

      <section className="grid four">
        {summaryCards.map((card) => (
          <div className="panel-card" key={card.label}>
            <span className="card-subtitle">{card.label}</span>
            <div className="metric-value">{loading ? "..." : card.value}</div>
          </div>
        ))}
      </section>

      <section className="workspace-grid">
        <article className="panel-card">
          <div className="section-heading">
            <h2>经营重点事项</h2>
            <span>新增、编辑、删除和状态切换都会保存在当前浏览器</span>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>关联项目</span>
              <select
                value={editing.project_name}
                onChange={(event) => setEditing((prev) => ({ ...prev, project_name: event.target.value }))}
              >
                <option value="">请选择项目</option>
                {projects.map((item) => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>责任人</span>
              <input
                value={editing.owner}
                onChange={(event) => setEditing((prev) => ({ ...prev, owner: event.target.value }))}
              />
            </label>
            <label className="form-field">
              <span>当前状态</span>
              <select
                value={editing.status}
                onChange={(event) => setEditing((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="PENDING">待处理</option>
                <option value="IN_PROGRESS">执行中</option>
                <option value="COMPLETED">已完成</option>
                <option value="DELAYED">已延期</option>
              </select>
            </label>
            <label className="form-field full">
              <span>关注主题</span>
              <input
                value={editing.topic}
                onChange={(event) => setEditing((prev) => ({ ...prev, topic: event.target.value }))}
              />
            </label>
            <label className="form-field full">
              <span>下一步动作</span>
              <textarea
                rows="3"
                value={editing.next_action}
                onChange={(event) => setEditing((prev) => ({ ...prev, next_action: event.target.value }))}
              />
            </label>
          </div>
          <div className="form-actions">
            <ActionButton variant="primary" onClick={saveFocus}>
              {editing.id ? "更新事项" : "新增事项"}
            </ActionButton>
            <ActionButton onClick={() => setEditing(emptyFocus)}>清空</ActionButton>
          </div>

          <div style={{ marginTop: 16 }}>
            <DataTable
              rowKey="id"
              columns={[
                { key: "project_name", title: "项目" },
                { key: "owner", title: "责任人" },
                { key: "topic", title: "关注主题" },
                { key: "status", title: "状态", render: (value) => <StatusBadge value={value} /> }
              ]}
              rows={focusItems}
              actions={(row) => (
                <div className="btn-row">
                  <ActionButton onClick={() => setEditing(row)}>编辑</ActionButton>
                  <ActionButton
                    variant="danger"
                    onClick={() => setFocusItems((prev) => prev.filter((item) => item.id !== row.id))}
                  >
                    删除
                  </ActionButton>
                </div>
              )}
            />
          </div>
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <h2>经营周记 / 经营备忘</h2>
            <span>输入后自动保存在本地，刷新页面仍会保留</span>
          </div>
          <label className="form-field">
            <span>周记内容</span>
            <textarea rows="12" value={weeklyMemo} onChange={(event) => setWeeklyMemo(event.target.value)} />
          </label>

          <div className="section-heading" style={{ marginTop: 20 }}>
            <h2>财务重点待跟进事项</h2>
            <span>来自财务模块的收付款计划和付款申请参考</span>
          </div>
          <div className="list-stack">
            {paymentRequests.length ? (
              paymentRequests.map((item) => (
                <div className="list-item" key={item.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <strong>{item.project_name}</strong>
                    <StatusBadge value={item.status} />
                  </div>
                  <div style={{ marginTop: 8, color: "#6e87a5" }}>{item.transaction_type}</div>
                  <div style={{ marginTop: 6, color: "#6e87a5" }}>金额：{formatCurrency(item.amount)}</div>
                </div>
              ))
            ) : (
              <div className="list-item">当前没有待跟进的财务事项。</div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
