import React, { useContext, useEffect, useMemo, useState } from "react";
import ActionButton from "../../components/Common/ActionButton";
import DataTable from "../../components/Common/DataTable";
import StatusBadge from "../../components/Common/StatusBadge";
import { AppContext } from "../../context/AppContext";
import { fetchProjectDetail, fetchProjects, validateProjectDocuments } from "../../api/projectAPI";
import { formatCurrency } from "../../utils/formatters";

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
        showError("报表页数据加载失败", error);
      }
    };

    loadData();
  }, [showError]);

  const filteredProjects = useMemo(
    () => projects.filter((item) => {
      const statusMatched = statusFilter === "ALL" || item.status === statusFilter;
      const timeMatched = isInTimeRange(item, timeRange);
      const projectMatched = selectedProjectId === "ALL" || String(item.id) === String(selectedProjectId);
      return statusMatched && timeMatched && projectMatched;
    }),
    [projects, selectedProjectId, timeRange, statusFilter]
  );

  const filteredProjectIds = useMemo(
    () => new Set(filteredProjects.map((item) => String(item.id))),
    [filteredProjects]
  );

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
        { label: "在管项目数", value: `${filteredProjects.length}` },
        { label: "延期项目数", value: `${filteredProjects.filter((item) => item.status === "DELAYED").length}` },
        { label: "合同总金额", value: formatCurrency(totalContractAmount) },
        { label: "文件完备率", value: `${readyRate}%` }
      ],
      totalShippedAmount,
      totalCollectedAmount
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
    () => filteredProjects
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

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">报表中心</h1>
          <p className="page-subtitle">
            面向项目经营、成本执行、发运回款风险和文件完备率的综合报表视图。
          </p>
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
              <option key={item.id} value={item.id}>{item.name}</option>
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
            <option value="WARRANTY">质保期</option>
            <option value="CLOSED">已完结</option>
          </select>
        </div>
      </section>

      <section className="grid four">
        {overviewCards.cards.map((item) => (
          <div className="panel-card" key={item.label}>
            <span className="card-subtitle">{item.label}</span>
            <div className="metric-value">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="detail-section-grid">
        <article className="panel-card">
          <div className="section-heading">
            <h2>项目经营总览</h2>
            <span>基于当前筛选结果汇总经营指标</span>
          </div>
          <div className="list-stack">
            <div className="list-item">
              <strong>累计发运金额</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{formatCurrency(overviewCards.totalShippedAmount)}</div>
            </div>
            <div className="list-item">
              <strong>累计回款金额</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{formatCurrency(overviewCards.totalCollectedAmount)}</div>
            </div>
            <div className="list-item">
              <strong>当前成本对比范围</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{selectedProjectId === "ALL" ? "全部筛选项目" : selectedDetail?.project?.name || "未选择项目"}</div>
            </div>
          </div>
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <h2>三版本成本对比</h2>
            <span>{selectedProjectId === "ALL" ? "当前筛选项目汇总" : "当前项目成本汇总"}</span>
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
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <h2>发运回款风险</h2>
          <span>按风险缺口排序的筛选结果</span>
        </div>
        <DataTable
          columns={[
            { key: "project_code", title: "项目编号" },
            { key: "name", title: "项目名称" },
            { key: "shipped_amount", title: "发运金额", render: (value) => formatCurrency(value) },
            { key: "collected_amount", title: "回款金额", render: (value) => formatCurrency(value) },
            { key: "gap_amount", title: "风险缺口", render: (value) => formatCurrency(value) },
            { key: "alert_level", title: "预警等级", render: (value) => <StatusBadge value={value} /> }
          ]}
          rows={riskRows}
        />
      </section>
    </div>
  );
}
