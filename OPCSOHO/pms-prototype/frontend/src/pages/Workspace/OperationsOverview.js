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

const statusLabelMap = {
  PLANNING: "计划中",
  IN_PROGRESS: "执行中",
  DELAYED: "已延期",
  ACCEPTANCE: "验收中",
  WARRANTY: "质保中",
  CLOSED: "已完结"
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

  const statusSummary = useMemo(() => {
    const rows = [
      { key: "PLANNING", color: "#8fa4bd" },
      { key: "IN_PROGRESS", color: "#2f8cff" },
      { key: "DELAYED", color: "#f05f6d" },
      { key: "ACCEPTANCE", color: "#f5ab2f" },
      { key: "WARRANTY", color: "#32c49a" },
      { key: "CLOSED", color: "#18a36f" }
    ]
      .map((item) => {
        const count = projects.filter((project) => project.status === item.key).length;
        return {
          ...item,
          label: statusLabelMap[item.key] || item.key,
          count
        };
      })
      .filter((item) => item.count > 0);

    const total = rows.reduce((sum, item) => sum + item.count, 0) || 1;
    return rows.map((item) => ({
      ...item,
      percent: (item.count / total) * 100
    }));
  }, [projects]);

  const operatingBars = useMemo(() => {
    const contract = Number(metrics.totalContractAmount || 0);
    const collected = Number(metrics.totalCollectedAmount || 0);
    const pendingPayment = financeItems
      .filter((item) => ["PAYMENT_REQUEST", "PAYMENT_PLAN"].includes(item.transaction_type))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const activeFocus = focusItems.filter((item) => ["PENDING", "IN_PROGRESS", "DELAYED"].includes(item.status)).length;

    const rows = [
      { label: "合同总额", value: contract, tone: "blue", isCurrency: true },
      { label: "累计回款", value: collected, tone: "green", isCurrency: true },
      { label: "待支付金额", value: pendingPayment, tone: "amber", isCurrency: true },
      { label: "经营重点事项", value: activeFocus, tone: "red", isCurrency: false }
    ];
    const max = Math.max(...rows.map((item) => item.value), 1);

    return rows.map((item) => ({
      ...item,
      percent: Math.max((item.value / max) * 100, item.value > 0 ? 10 : 0)
    }));
  }, [metrics, financeItems, focusItems]);

  const collectionTrend = useMemo(() => {
    const topProjects = [...projects]
      .sort((a, b) => Number(b.contract_amount || 0) - Number(a.contract_amount || 0))
      .slice(0, 5);
    const max = Math.max(
      ...topProjects.map((item) => Math.max(Number(item.contract_amount || 0), Number(item.collected_amount || 0))),
      1
    );

    return topProjects.map((item) => ({
      id: item.id,
      label: item.project_code || item.name,
      contractHeight: (Number(item.contract_amount || 0) / max) * 100,
      collectedHeight: (Number(item.collected_amount || 0) / max) * 100
    }));
  }, [projects]);

  const focusStatusSummary = useMemo(
    () => [
      { label: "待处理", value: focusItems.filter((item) => item.status === "PENDING").length },
      { label: "执行中", value: focusItems.filter((item) => item.status === "IN_PROGRESS").length },
      { label: "已延期", value: focusItems.filter((item) => item.status === "DELAYED").length },
      { label: "已完成", value: focusItems.filter((item) => item.status === "COMPLETED").length }
    ],
    [focusItems]
  );

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

      <section className="operations-cockpit-grid">
        <article className="panel-card operations-cockpit-panel">
          <div className="section-heading">
            <h2>经营状态分布</h2>
            <span>项目执行状态在总览页直接透出</span>
          </div>
          <div className="operations-status-grid">
            {statusSummary.length ? statusSummary.map((item) => (
              <div className="operations-status-row" key={item.key}>
                <div className="operations-status-meta">
                  <div className="operations-status-title">
                    <span className="cockpit-legend-dot" style={{ background: item.color }} />
                    <strong>{item.label}</strong>
                  </div>
                  <span>{item.count} 个项目</span>
                </div>
                <div className="cockpit-bar-track">
                  <div className="operations-status-fill" style={{ width: `${item.percent}%`, background: item.color }} />
                </div>
              </div>
            )) : (
              <div className="project-video-box">暂无项目状态数据</div>
            )}
          </div>
        </article>

        <article className="panel-card operations-cockpit-panel">
          <div className="section-heading">
            <h2>经营驾驶指标</h2>
            <span>把合同、回款、支付和重点事项放到一个口径里</span>
          </div>
          <div className="cockpit-bar-list">
            {operatingBars.map((item) => (
              <div className="cockpit-bar-row" key={item.label}>
                <div className="cockpit-bar-meta">
                  <strong>{item.label}</strong>
                  <span>{item.isCurrency ? formatCurrency(item.value) : `${item.value} 项`}</span>
                </div>
                <div className="cockpit-bar-track">
                  <div className={`cockpit-bar-fill ${item.tone}`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card operations-cockpit-panel">
          <div className="section-heading">
            <h2>合同与回款对照</h2>
            <span>按合同规模前 5 个项目抽样</span>
          </div>
          {collectionTrend.length ? (
            <div className="operations-column-chart">
              {collectionTrend.map((item) => (
                <div className="cockpit-column-group" key={item.id}>
                  <div className="cockpit-column-bars">
                    <div className="cockpit-column shipped" style={{ height: `${item.contractHeight}%` }} />
                    <div className="cockpit-column collected" style={{ height: `${item.collectedHeight}%` }} />
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="project-video-box">暂无合同与回款数据</div>
          )}
        </article>

        <article className="panel-card operations-cockpit-panel">
          <div className="section-heading">
            <h2>重点事项温度</h2>
            <span>经营关注事项先看热度，再看明细</span>
          </div>
          <div className="operations-focus-matrix">
            {focusStatusSummary.map((item) => (
              <div className="operations-focus-chip" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </article>
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
