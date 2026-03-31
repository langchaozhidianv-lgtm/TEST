import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/Common/DataTable";
import ActionButton from "../../components/Common/ActionButton";
import StatusBadge from "../../components/Common/StatusBadge";
import ProjectForm from "./ProjectForm";
import {
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
  validateProjectDocuments
} from "../../api/projectAPI";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { AppContext } from "../../context/AppContext";

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [docCheck, setDocCheck] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { showError } = useContext(AppContext);

  const loadData = async () => {
    try {
      const data = await fetchProjects(keyword ? { keyword } : {});
      setProjects(data);
      setSelectedProjectId((current) => current || data[0]?.id || null);
    } catch (error) {
      setProjects([]);
      showError("项目数据加载失败", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (payload) => {
    try {
      if (editing?.id) {
        await updateProject(editing.id, payload);
      } else {
        await createProject(payload);
      }
      setEditing(null);
      loadData();
    } catch (error) {
      showError("项目保存失败", error);
    }
  };

  const handleDelete = async (row) => {
    try {
      await deleteProject(row.id);
      loadData();
    } catch (error) {
      showError("项目删除失败", error);
    }
  };

  const handleValidateDocs = async (row) => {
    try {
      const result = await validateProjectDocuments(row.id);
      setDocCheck(result);
      setSelectedProjectId(row.id);
      navigate(`/projects/${row.id}/files`);
    } catch (error) {
      showError("文件校验失败", error);
    }
  };

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || projects[0];

  const projectMetrics = useMemo(() => {
    if (!selectedProject) return [];

    const contractAmount = Number(selectedProject.contract_amount || 0);
    const shippedAmount = Number(selectedProject.shipped_amount || 0);
    const collectedAmount = Number(selectedProject.collected_amount || 0);

    return [
      { label: "合同金额", value: formatCurrency(contractAmount) },
      { label: "预算目标", value: formatCurrency(contractAmount * 0.92) },
      { label: "已发运金额", value: formatCurrency(shippedAmount) },
      { label: "已回款金额", value: formatCurrency(collectedAmount) },
      { label: "发运回款缺口", value: formatCurrency(shippedAmount - collectedAmount) },
      { label: "计划完工", value: formatDate(selectedProject.planned_end_date) }
    ];
  }, [selectedProject]);

  const warningStats = useMemo(() => {
    const delayedCount = projects.filter((item) => item.status === "DELAYED").length;
    const acceptanceCount = projects.filter((item) => item.status === "ACCEPTANCE").length;
    const warrantyCount = projects.filter((item) => item.status === "WARRANTY").length;
    const paybackRiskCount = projects.filter(
      (item) => Number(item.shipped_amount || 0) > Number(item.collected_amount || 0)
    ).length;

    return [
      { label: "延期项目", value: delayedCount, alert: delayedCount > 0 },
      { label: "验收阶段", value: acceptanceCount, alert: false },
      { label: "质保阶段", value: warrantyCount, alert: false },
      { label: "回款风险", value: paybackRiskCount, alert: paybackRiskCount > 0 },
      { label: "项目总数", value: projects.length, alert: false },
      {
        label: "文件缺失",
        value: docCheck && !docCheck.ready ? docCheck.missing.length : 0,
        alert: !!(docCheck && !docCheck.ready)
      }
    ];
  }, [projects, docCheck]);

  const stageItems = [
    { label: "准备", active: true },
    { label: "执行", active: selectedProject?.status !== "PLANNING" },
    { label: "调试", active: ["ACCEPTANCE", "WARRANTY", "CLOSED"].includes(selectedProject?.status) },
    { label: "验收", active: ["ACCEPTANCE", "WARRANTY", "CLOSED"].includes(selectedProject?.status) },
    { label: "完结", active: selectedProject?.status === "CLOSED" }
  ];

  const topRiskProjects = [...projects]
    .sort(
      (a, b) =>
        Number(b.shipped_amount || 0) -
        Number(b.collected_amount || 0) -
        (Number(a.shipped_amount || 0) - Number(a.collected_amount || 0))
    )
    .slice(0, 5);

  return (
    <div className="project-page">
      <section className="project-hero">
        <article className="panel-card project-hero-card">
          <div className="project-hero-head">
            <div className="project-switch">切换项目空间</div>
            <div className="project-health">健康</div>
          </div>
          <h1 className="project-name">
            {selectedProject ? `${selectedProject.name}（${selectedProject.project_code}）` : "项目空间首页"}
          </h1>
          <div className="project-meta-grid">
            <div className="project-meta">
              <span>客户</span>
              <strong>{selectedProject?.customer_name || "-"}</strong>
            </div>
            <div className="project-meta">
              <span>事业部</span>
              <strong>{selectedProject?.division_name || "-"}</strong>
            </div>
            <div className="project-meta">
              <span>计划开工</span>
              <strong>{formatDate(selectedProject?.start_date)}</strong>
            </div>
            <div className="project-meta">
              <span>项目经理</span>
              <strong>{selectedProject?.project_manager || "-"}</strong>
            </div>
          </div>
        </article>

        <article className="panel-card project-side-card">
          <div className="section-heading">
            <h2>前置文件校验</h2>
            <span>结算和下一流程前必检</span>
          </div>
          <div className="project-video-box">
            {docCheck
              ? docCheck.ready
                ? "合同、安全交底和验收表单已齐备"
                : `缺少：${docCheck.missing.join("、")}`
              : "请在项目台账中点击“文件校验”"}
          </div>
        </article>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <h2>项目概况</h2>
          <span>按项目编号汇总合同、发运、回款和计划节点</span>
        </div>
        <div className="overview-strip">
          {projectMetrics.map((metric) => (
            <div className="overview-pill" key={metric.label}>
              <div className="overview-pill__icon" />
              <div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <h2>项目预警</h2>
          <span>延期、验收、文件和回款状态总览</span>
        </div>
        <div className="warning-summary">
          {warningStats.map((item) => (
            <div className={`warning-stat ${item.alert ? "alert" : ""}`} key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      {docCheck ? (
        <div className={`notice ${docCheck.ready ? "success" : "warning"}`}>
          文件校验：{docCheck.ready ? "当前项目已满足前置条件" : `缺少 ${docCheck.missing.join("、")}`}
        </div>
      ) : null}

      <section className="project-lower-grid">
        <article className="panel-card">
          <div className="section-heading">
            <h2>阶段推进</h2>
            <span>从准备到完结的项目阶段进展</span>
          </div>
          <div className="stage-progress">
            {stageItems.map((item) => (
              <div className={`stage-step ${item.active ? "active" : ""}`} key={item.label}>
                {item.label}
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <h2>进度分布</h2>
            <span>所有项目当前执行状态分布</span>
          </div>
          <div className="risk-ring">
            <div className="risk-counts">
              <div className="risk-count">
                <span>正常推进</span>
                <strong>{projects.filter((item) => item.status === "IN_PROGRESS").length}</strong>
              </div>
              <div className="risk-count">
                <span>验收阶段</span>
                <strong>{projects.filter((item) => item.status === "ACCEPTANCE").length}</strong>
              </div>
              <div className="risk-count">
                <span>延期项目</span>
                <strong>{projects.filter((item) => item.status === "DELAYED").length}</strong>
              </div>
            </div>
            <div className="risk-chart" />
          </div>
        </article>
      </section>

      <section className="project-section-grid">
        <article className="panel-card">
          <div className="page-header">
            <div>
              <h2 className="card-title">项目台账</h2>
              <p className="card-subtitle">按项目编号、客户、项目经理和状态维护项目主数据。</p>
            </div>
            <ActionButton variant="primary" onClick={() => setEditing({})}>新建项目</ActionButton>
          </div>

          <div className="toolbar">
            <div className="filters">
              <input
                placeholder="按项目名称或客户搜索"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
              <ActionButton variant="secondary" onClick={loadData}>查询</ActionButton>
            </div>
          </div>

          {editing !== null ? (
            <ProjectForm
              initialValues={editing.id ? editing : null}
              onSubmit={handleSubmit}
              onCancel={() => setEditing(null)}
            />
          ) : null}

          <DataTable
            columns={[
              { key: "project_code", title: "项目编号" },
              { key: "name", title: "项目名称" },
              { key: "customer_name", title: "客户" },
              { key: "project_type", title: "项目类型" },
              { key: "status", title: "项目状态", render: (value) => <StatusBadge value={value} /> },
              { key: "contract_amount", title: "合同金额", render: (value) => formatCurrency(value) },
              { key: "project_manager", title: "项目经理" }
            ]}
            rows={projects}
            actions={(row) => (
              <div className="btn-row">
                <ActionButton onClick={() => navigate(`/projects/${row.id}/detail`)}>查看详情</ActionButton>
                <ActionButton onClick={() => handleValidateDocs(row)}>文件校验</ActionButton>
                <ActionButton onClick={() => { setEditing(row); setSelectedProjectId(row.id); }}>编辑</ActionButton>
                <ActionButton variant="danger" onClick={() => handleDelete(row)}>删除</ActionButton>
              </div>
            )}
          />
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <h2>高风险项目 Top5</h2>
            <span>按发运与回款缺口排序</span>
          </div>
          <div className="list-stack">
            {topRiskProjects.map((item, index) => (
              <div className="list-item" key={item.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{index + 1}. {item.name}</strong>
                  <StatusBadge value={item.status} />
                </div>
                <div style={{ marginTop: 8, color: "#6e87a5" }}>项目编号：{item.project_code}</div>
                <div style={{ marginTop: 6, color: "#6e87a5" }}>
                  风险缺口：{formatCurrency(Number(item.shipped_amount || 0) - Number(item.collected_amount || 0))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
