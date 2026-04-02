import React, { useContext, useEffect, useMemo, useState } from "react";
import ActionButton from "../../components/Common/ActionButton";
import DataTable from "../../components/Common/DataTable";
import StatusBadge from "../../components/Common/StatusBadge";
import { AppContext } from "../../context/AppContext";
import { fetchProjectDetail, fetchProjects, validateProjectDocuments } from "../../api/projectAPI";
import { formatCurrency } from "../../utils/formatters";

const statusLabelMap = {
  PLANNING: "计划中",
  IN_PROGRESS: "执行中",
  DELAYED: "已延期",
  ACCEPTANCE: "验收中",
  WARRANTY: "质保中",
  CLOSED: "已完结"
};

const statusToneMap = {
  PLANNING: "slate",
  IN_PROGRESS: "blue",
  DELAYED: "red",
  ACCEPTANCE: "amber",
  WARRANTY: "teal",
  CLOSED: "green"
};

function isInTimeRange(project, range) {
  if (range === "ALL") return true;
  const baseDate = new Date(project.start_date || project.created_at || Date.now());
  const now = new Date();

  if (range === "MONTH") {
    return baseDate.getFullYear() === now.getFullYear() && baseDate.getMonth() === now.getMonth();
  }

  if (range === "QUARTER") {
    const quarter = Math.floor(now.getMonth() / 3);
    return baseDate.getFullYear() === now.getFullYear() && Math.floor(baseDate.getMonth() / 3) === quarter;
  }

  return true;
}

function DonutChart({ segments, total }) {
  const gradient = segments.length
    ? `conic-gradient(${segments
      .map((segment) => `${segment.color} ${segment.start}deg ${segment.end}deg`)
      .join(", ")})`
    : "conic-gradient(#dfe9f7 0deg 360deg)";

  return (
    <div className="cockpit-donut-wrap">
      <div className="cockpit-donut" style={{ background: gradient }}>
        <div className="cockpit-donut__inner">
          <strong>{total}</strong>
          <span>项目总数</span>
        </div>
      </div>
    </div>
  );
}

export default function ReportsDashboard() {
  const { showError } = useContext(AppContext);
  const [projects, setProjects] = useState([]);
  const [details, setDetails] = useState([]);
  const [validations, setValidations] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [timeRange, setTimeRange] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const loadData = async () => {
      try {
        const projectRows = await fetchProjects();
        const [detailRows, validationRows] = await Promise.all([
          Promise.all(projectRows.map((item) => fetchProjectDetail(item.id))),
          Promise.all(projectRows.map((item) => validateProjectDocuments(item.id)))
        ]);
        setProjects(projectRows);
        setDetails(detailRows);
        setValidations(validationRows);
      } catch (error) {
        showError("报表数据加载失败", error);
      }
    };

    loadData();
  }, [showError]);

  const filteredProjects = useMemo(
    () =>
      projects.filter((item) => {
        const statusMatched = statusFilter === "ALL" || item.status === statusFilter;
        const timeMatched = isInTimeRange(item, timeRange);
        const projectMatched = selectedProjectId === "ALL" || String(item.id) === String(selectedProjectId);
        return statusMatched && timeMatched && projectMatched;
      }),
    [projects, selectedProjectId, timeRange, statusFilter]
  );

  const filteredProjectIds = useMemo(() => new Set(filteredProjects.map((item) => String(item.id))), [filteredProjects]);

  const filteredDetails = useMemo(
    () => details.filter((item) => filteredProjectIds.has(String(item.project.id))),
    [details, filteredProjectIds]
  );

  const selectedDetail = useMemo(() => {
    if (selectedProjectId !== "ALL") {
      return filteredDetails.find((item) => String(item.project.id) === String(selectedProjectId)) || null;
    }
    return filteredDetails[0] || null;
  }, [filteredDetails, selectedProjectId]);

  const filteredValidations = useMemo(
    () => validations.filter((item) => filteredProjectIds.has(String(item.project_id))),
    [validations, filteredProjectIds]
  );

  const overviewCards = useMemo(() => {
    const totalContractAmount = filteredProjects.reduce((sum, item) => sum + Number(item.contract_amount || 0), 0);
    const totalShippedAmount = filteredProjects.reduce((sum, item) => sum + Number(item.shipped_amount || 0), 0);
    const totalCollectedAmount = filteredProjects.reduce((sum, item) => sum + Number(item.collected_amount || 0), 0);
    const readyRate = filteredValidations.length
      ? Math.round((filteredValidations.filter((item) => item.ready).length / filteredValidations.length) * 100)
      : 0;

    return {
      cards: [
        { label: "在管项目数", value: `${filteredProjects.length}`, note: "当前筛选范围" },
        { label: "延期项目数", value: `${filteredProjects.filter((item) => item.status === "DELAYED").length}`, note: "需优先关注" },
        { label: "合同总金额", value: formatCurrency(totalContractAmount), note: "经营口径汇总" },
        { label: "文件完备率", value: `${readyRate}%`, note: "合同/安全/验收" }
      ],
      totalShippedAmount,
      totalCollectedAmount,
      readyRate
    };
  }, [filteredProjects, filteredValidations]);

  const costComparison = useMemo(() => {
    const sourceDetails = selectedProjectId === "ALL" ? filteredDetails : selectedDetail ? [selectedDetail] : [];
    const rows = sourceDetails.flatMap((item) => item.costSummary.entries || []);
    const signed = rows.filter((item) => item.version_type === "SIGNED").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const budget = rows.filter((item) => item.version_type === "BUDGET").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const actual = rows.filter((item) => item.version_type === "ACTUAL").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { signed, budget, actual };
  }, [filteredDetails, selectedDetail, selectedProjectId]);

  const riskRows = useMemo(
    () =>
      filteredProjects
        .map((item) => ({
          ...item,
          gap_amount: Number(item.shipped_amount || 0) - Number(item.collected_amount || 0),
          alert_level:
            Number(item.shipped_amount || 0) - Number(item.collected_amount || 0) > 1000000
              ? "RED"
              : Number(item.shipped_amount || 0) - Number(item.collected_amount || 0) > 500000
                ? "AMBER"
                : "GREEN"
        }))
        .sort((a, b) => b.gap_amount - a.gap_amount),
    [filteredProjects]
  );

  const summaryText = selectedProjectId === "ALL" ? "当前展示筛选范围内的项目汇总" : selectedDetail?.project?.name || "未选择项目";

  const statusDistribution = useMemo(() => {
    const definitions = [
      { key: "PLANNING", color: "#8fa4bd" },
      { key: "IN_PROGRESS", color: "#2f8cff" },
      { key: "DELAYED", color: "#f05f6d" },
      { key: "ACCEPTANCE", color: "#f5ab2f" },
      { key: "WARRANTY", color: "#32c49a" },
      { key: "CLOSED", color: "#18a36f" }
    ];

    const total = filteredProjects.length || 1;
    let cursor = 0;
    const items = definitions
      .map((definition) => {
        const count = filteredProjects.filter((item) => item.status === definition.key).length;
        const degrees = (count / total) * 360;
        const segment = {
          key: definition.key,
          label: statusLabelMap[definition.key] || definition.key,
          count,
          color: definition.color,
          start: cursor,
          end: cursor + degrees
        };
        cursor += degrees;
        return segment;
      })
      .filter((segment) => segment.count > 0);

    return { total: filteredProjects.length, items };
  }, [filteredProjects]);

  const cashflowBars = useMemo(() => {
    const rows = [
      { label: "合同金额", value: filteredProjects.reduce((sum, item) => sum + Number(item.contract_amount || 0), 0), tone: "blue" },
      { label: "累计发运", value: overviewCards.totalShippedAmount, tone: "teal" },
      { label: "累计回款", value: overviewCards.totalCollectedAmount, tone: "green" },
      { label: "预算成本", value: costComparison.budget, tone: "amber" },
      { label: "实际成本", value: costComparison.actual, tone: "red" }
    ];
    const max = Math.max(...rows.map((item) => item.value), 1);

    return rows.map((item) => ({
      ...item,
      percent: Math.max((item.value / max) * 100, item.value > 0 ? 8 : 0)
    }));
  }, [filteredProjects, overviewCards, costComparison]);

  const trendSeries = useMemo(() => {
    const source = filteredProjects.slice(0, 6);
    const max = Math.max(
      ...source.map((item) => Math.max(Number(item.shipped_amount || 0), Number(item.collected_amount || 0))),
      1
    );

    return source.map((item) => ({
      id: item.id,
      label: item.project_code || item.name,
      shippedHeight: (Number(item.shipped_amount || 0) / max) * 100,
      collectedHeight: (Number(item.collected_amount || 0) / max) * 100
    }));
  }, [filteredProjects]);

  const fileHealthRows = useMemo(
    () =>
      filteredValidations.map((item) => {
        const project = projects.find((entry) => String(entry.id) === String(item.project_id));
        const missingCount = Array.isArray(item.missing) ? item.missing.length : 0;
        const completeness = item.ready ? 100 : Math.max(0, 100 - missingCount * 34);
        return {
          ...item,
          projectName: project?.name || `项目 ${item.project_id}`,
          completeness,
          missingCount
        };
      }),
    [filteredValidations, projects]
  );

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">报表中心</h1>
          <p className="page-subtitle">面向项目经营、成本、回款和文件健康度的综合驾驶舱，支持按项目范围快速切换观察口径。</p>
        </div>
        <div className="hero-actions">
          <ActionButton variant="primary">生成演示报表</ActionButton>
        </div>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <h2>报表筛选</h2>
          <span>按项目、时间范围和项目状态组合筛选</span>
        </div>
        <div className="filters">
          <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
            <option value="ALL">全部项目</option>
            {projects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select value={timeRange} onChange={(event) => setTimeRange(event.target.value)}>
            <option value="ALL">全部时间</option>
            <option value="MONTH">本月</option>
            <option value="QUARTER">本季度</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">全部状态</option>
            <option value="PLANNING">计划中</option>
            <option value="IN_PROGRESS">执行中</option>
            <option value="DELAYED">已延期</option>
            <option value="ACCEPTANCE">验收中</option>
            <option value="WARRANTY">质保中</option>
            <option value="CLOSED">已完结</option>
          </select>
        </div>
      </section>

      <section className="grid four">
        {overviewCards.cards.map((item) => (
          <div className="panel-card cockpit-metric-card" key={item.label}>
            <span className="card-subtitle">{item.label}</span>
            <div className="metric-value">{item.value}</div>
            <div className="cockpit-metric-note">{item.note}</div>
          </div>
        ))}
      </section>

      <section className="reports-cockpit-grid">
        <article className="panel-card cockpit-panel cockpit-panel--status">
          <div className="section-heading">
            <h2>项目状态分布</h2>
            <span>{summaryText}</span>
          </div>
          <div className="cockpit-status-layout">
            <DonutChart segments={statusDistribution.items} total={statusDistribution.total} />
            <div className="cockpit-status-legend">
              {statusDistribution.items.length ? statusDistribution.items.map((item) => (
                <div className="cockpit-legend-item" key={item.key}>
                  <span className="cockpit-legend-dot" style={{ background: item.color }} />
                  <div>
                    <strong>{item.label}</strong>
                    <div>{item.count} 个项目</div>
                  </div>
                </div>
              )) : (
                <div className="project-video-box">当前筛选条件下暂无项目</div>
              )}
            </div>
          </div>
        </article>

        <article className="panel-card cockpit-panel">
          <div className="section-heading">
            <h2>经营口径对比</h2>
            <span>合同、发运、回款与成本同屏对照</span>
          </div>
          <div className="cockpit-bar-list">
            {cashflowBars.map((item) => (
              <div className="cockpit-bar-row" key={item.label}>
                <div className="cockpit-bar-meta">
                  <strong>{item.label}</strong>
                  <span>{formatCurrency(item.value)}</span>
                </div>
                <div className="cockpit-bar-track">
                  <div className={`cockpit-bar-fill ${item.tone}`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card cockpit-panel">
          <div className="section-heading">
            <h2>文件健康度</h2>
            <span>越高代表进入下游流程的阻力越小</span>
          </div>
          <div className="cockpit-health-list">
            {fileHealthRows.length ? fileHealthRows.map((item) => (
              <div className="cockpit-health-row" key={item.project_id}>
                <div className="cockpit-health-meta">
                  <strong>{item.projectName}</strong>
                  <span>{item.ready ? "资料完整" : `缺 ${item.missingCount} 项`}</span>
                </div>
                <div className="cockpit-health-track">
                  <div
                    className={`cockpit-health-fill ${item.ready ? "good" : "warn"}`}
                    style={{ width: `${item.completeness}%` }}
                  />
                </div>
                <strong className="cockpit-health-score">{item.completeness}%</strong>
              </div>
            )) : (
              <div className="project-video-box">当前筛选条件下暂无文件校验记录</div>
            )}
          </div>
        </article>

        <article className="panel-card cockpit-panel">
          <div className="section-heading">
            <h2>发运回款节奏</h2>
            <span>抽取当前范围内前 6 个项目做对比</span>
          </div>
          {trendSeries.length ? (
            <div className="cockpit-column-chart">
              {trendSeries.map((item) => (
                <div className="cockpit-column-group" key={item.id}>
                  <div className="cockpit-column-bars">
                    <div className="cockpit-column shipped" style={{ height: `${item.shippedHeight}%` }} />
                    <div className="cockpit-column collected" style={{ height: `${item.collectedHeight}%` }} />
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="project-video-box">当前筛选条件下暂无节奏数据</div>
          )}
        </article>
      </section>

      <section className="detail-section-grid">
        <article className="panel-card">
          <div className="section-heading">
            <h2>三版本成本摘要</h2>
            <span>{selectedProjectId === "ALL" ? "当前筛选项目汇总" : "当前项目成本摘要"}</span>
          </div>
          <div className="grid three">
            <div className="list-item">
              <strong>签约成本</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{formatCurrency(costComparison.signed)}</div>
            </div>
            <div className="list-item">
              <strong>预算成本</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{formatCurrency(costComparison.budget)}</div>
            </div>
            <div className="list-item">
              <strong>实际成本</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{formatCurrency(costComparison.actual)}</div>
            </div>
          </div>
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <h2>风险焦点</h2>
            <span>优先处理风险缺口最大的项目</span>
          </div>
          <div className="cockpit-focus-list">
            {riskRows.slice(0, 4).map((item) => (
              <div className={`cockpit-focus-item ${statusToneMap[item.status] || "slate"}`} key={item.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{item.name}</strong>
                  <StatusBadge value={item.alert_level} />
                </div>
                <div className="cockpit-focus-meta">项目编号：{item.project_code}</div>
                <div className="cockpit-focus-meta">风险缺口：{formatCurrency(item.gap_amount)}</div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <h2>发运回款风险台账</h2>
          <span>按风险缺口排序，图表上方用于总览，这里保留明细台账</span>
        </div>
        {riskRows.length ? (
          <DataTable
            columns={[
              { key: "project_code", title: "项目编号", width: "140px", minWidth: "140px", cellClassName: "cell-nowrap" },
              { key: "name", title: "项目名称", width: "220px", minWidth: "220px", cellClassName: "cell-multiline" },
              { key: "shipped_amount", title: "发运金额", width: "150px", minWidth: "150px", cellClassName: "cell-nowrap", render: (value) => formatCurrency(value) },
              { key: "collected_amount", title: "回款金额", width: "150px", minWidth: "150px", cellClassName: "cell-nowrap", render: (value) => formatCurrency(value) },
              { key: "gap_amount", title: "风险缺口", width: "150px", minWidth: "150px", cellClassName: "cell-nowrap", render: (value) => formatCurrency(value) },
              { key: "alert_level", title: "预警等级", width: "120px", minWidth: "120px", cellClassName: "cell-nowrap", render: (value) => <StatusBadge value={value} /> }
            ]}
            rows={riskRows}
          />
        ) : (
          <div className="project-video-box">当前筛选条件下暂无风险数据</div>
        )}
      </section>
    </div>
  );
}
