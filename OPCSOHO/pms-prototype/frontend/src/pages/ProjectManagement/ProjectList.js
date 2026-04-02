import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/Common/DataTable";
import ActionButton from "../../components/Common/ActionButton";
import StatusBadge from "../../components/Common/StatusBadge";
import ProjectForm from "./ProjectForm";
import {
  createProject,
  deleteProject,
  fetchProjectDetail,
  fetchProjects,
  updateProject,
  validateProjectDocuments
} from "../../api/projectAPI";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { AppContext } from "../../context/AppContext";
import { getErrorMessage } from "../../utils/errors";

const fieldLabelMap = {
  project_code: "项目编号",
  name: "项目名称",
  project_type: "项目类型",
  customer_name: "客户",
  division_name: "事业部",
  project_manager: "项目经理"
};

const projectTypeLabelMap = {
  COLD_STORAGE: "冷库工程",
  BUILDING: "工业建筑",
  DOOR: "工业门系统",
  MATERIAL: "材料供应"
};

const projectStatusLabelMap = {
  PLANNING: "计划中",
  IN_PROGRESS: "执行中",
  DELAYED: "已延期",
  ACCEPTANCE: "验收中",
  WARRANTY: "质保中",
  CLOSED: "已完结"
};

const documentLabelMap = {
  CONTRACT: "合同",
  SAFETY_DISCLOSURE: "安全交底",
  ACCEPTANCE_FORM: "验收表单"
};

const siteTypeMap = {
  PROCUREMENT: "采购",
  SHIPPING: "发运",
  MATERIAL: "材料动态",
  LABOR: "劳务",
  SAFETY: "安全",
  ACCEPTANCE: "验收"
};

function ProjectEntryLink({ children, projectId }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="table-entry-link"
      onClick={() => navigate(`/projects/${projectId}/detail`)}
    >
      {children}
    </button>
  );
}

function getProjectScore(project) {
  const contractAmount = Number(project.contract_amount || 0);
  const shippedAmount = Number(project.shipped_amount || 0);
  const collectedAmount = Number(project.collected_amount || 0);
  const statusScore =
    project.status === "IN_PROGRESS"
      ? 300000
      : project.status === "ACCEPTANCE"
        ? 200000
        : project.status === "WARRANTY"
          ? 120000
          : project.status === "DELAYED"
            ? 80000
            : 0;

  return contractAmount + shippedAmount + collectedAmount + statusScore;
}

function getPreferredProjectId(projects, currentId) {
  if (!projects.length) return null;

  const currentExists = projects.some((item) => String(item.id) === String(currentId));
  if (currentExists) return currentId;

  return [...projects].sort((a, b) => getProjectScore(b) - getProjectScore(a))[0]?.id || projects[0]?.id || null;
}

function isProjectOverdue(project) {
  if (!project?.planned_end_date) return false;
  if (["CLOSED", "WARRANTY"].includes(project.status)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const plannedEndDate = new Date(project.planned_end_date);
  plannedEndDate.setHours(0, 0, 0, 0);
  return plannedEndDate < today;
}

function formatDocumentNames(list = []) {
  return list.map((item) => documentLabelMap[item] || item).join("、");
}

function toProjectError(error) {
  const missing = error?.response?.data?.missing;
  if (Array.isArray(missing) && missing.length) {
    const labels = missing.map((item) => fieldLabelMap[item] || item).join("、");
    return `请补全必填项：${labels}`;
  }
  return getErrorMessage(error, "项目保存失败，请稍后重试。");
}

export default function ProjectList() {
  const navigate = useNavigate();
  const { showError } = useContext(AppContext);

  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [docCheck, setDocCheck] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const loadData = async () => {
    try {
      const data = await fetchProjects(keyword ? { keyword } : {});
      setProjects(data);
      setSelectedProjectId((current) => getPreferredProjectId(data, current));
    } catch (error) {
      setProjects([]);
      showError("项目数据加载失败", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setDocCheck(null);
      setSelectedProjectDetail(null);
      return;
    }

    const loadSelectedProjectData = async () => {
      setDetailLoading(true);
      try {
        const [docResult, detailResult] = await Promise.all([
          validateProjectDocuments(selectedProjectId),
          fetchProjectDetail(selectedProjectId)
        ]);
        setDocCheck(docResult);
        setSelectedProjectDetail(detailResult);
      } catch (error) {
        setDocCheck(null);
        setSelectedProjectDetail(null);
      } finally {
        setDetailLoading(false);
      }
    };

    loadSelectedProjectData();
  }, [selectedProjectId]);

  const handleSubmit = async (payload) => {
    try {
      if (editing?.id) {
        await updateProject(editing.id, payload);
        setNotice({ type: "success", text: "项目更新成功。" });
      } else {
        await createProject(payload);
        setNotice({ type: "success", text: "项目新建成功。" });
      }
      setEditing(null);
      await loadData();
    } catch (error) {
      setNotice({ type: "error", text: toProjectError(error) });
    }
  };

  const handleDelete = async (row) => {
    try {
      await deleteProject(row.id);
      setNotice({ type: "success", text: "项目已删除。" });
      await loadData();
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

  const selectedProject =
    projects.find((project) => String(project.id) === String(selectedProjectId)) || projects[0] || null;

  const projectMetrics = useMemo(() => {
    if (!selectedProject) return [];

    const contractAmount = Number(selectedProject.contract_amount || 0);
    const shippedAmount = Number(selectedProject.shipped_amount || 0);
    const collectedAmount = Number(selectedProject.collected_amount || 0);
    const actualCostAmount = Number(selectedProject.actual_cost_amount || 0);

    return [
      { label: "合同金额", value: formatCurrency(contractAmount) },
      { label: "项目回款金额", value: formatCurrency(collectedAmount) },
      { label: "项目成本金额", value: formatCurrency(actualCostAmount) },
      { label: "预算目标", value: formatCurrency(contractAmount * 0.92) },
      { label: "已发运金额", value: formatCurrency(shippedAmount) },
      { label: "发运回款缺口", value: formatCurrency(shippedAmount - collectedAmount) },
      { label: "计划完工", value: formatDate(selectedProject.planned_end_date) }
    ];
  }, [selectedProject]);

  const warningStats = useMemo(() => {
    if (!selectedProject) return [];

    const hasPaybackRisk = Number(selectedProject.shipped_amount || 0) > Number(selectedProject.collected_amount || 0);
    const overduePlan = isProjectOverdue(selectedProject);
    const missingFiles = docCheck && !docCheck.ready ? docCheck.missing.length : 0;

    return [
      {
        label: "当前状态",
        value: projectStatusLabelMap[selectedProject.status] || selectedProject.status || "-",
        alert: selectedProject.status === "DELAYED"
      },
      { label: "计划超期", value: overduePlan ? "1" : "0", alert: overduePlan },
      { label: "验收阶段", value: selectedProject.status === "ACCEPTANCE" ? "1" : "0", alert: false },
      { label: "质保阶段", value: selectedProject.status === "WARRANTY" ? "1" : "0", alert: false },
      { label: "回款风险", value: hasPaybackRisk ? "1" : "0", alert: hasPaybackRisk },
      { label: "文件缺失", value: missingFiles, alert: missingFiles > 0 }
    ];
  }, [selectedProject, docCheck]);

  const selectedProgressStats = useMemo(() => {
    if (!selectedProject) {
      return { normal: 0, acceptance: 0, delayed: 0 };
    }

    return {
      normal: ["PLANNING", "IN_PROGRESS", "WARRANTY", "CLOSED"].includes(selectedProject.status) ? 1 : 0,
      acceptance: selectedProject.status === "ACCEPTANCE" ? 1 : 0,
      delayed: selectedProject.status === "DELAYED" ? 1 : 0
    };
  }, [selectedProject]);

  const stageItems = [
    { label: "准备", active: true },
    { label: "执行", active: selectedProject?.status !== "PLANNING" },
    { label: "调试", active: ["ACCEPTANCE", "WARRANTY", "CLOSED"].includes(selectedProject?.status) },
    { label: "验收", active: ["ACCEPTANCE", "WARRANTY", "CLOSED"].includes(selectedProject?.status) },
    { label: "完结", active: selectedProject?.status === "CLOSED" }
  ];

  const selectedProjectTasks = useMemo(() => {
    const records = selectedProjectDetail?.siteSummary?.records || [];
    return records.slice(0, 5).map((item) => ({
      id: item.id,
      title: item.title,
      type: siteTypeMap[item.record_type] || item.record_type || "-",
      status: item.status,
      plannedDate: item.planned_date
    }));
  }, [selectedProjectDetail]);

  return (
    <div className="project-page">
      <section className="project-hero">
        <article className="panel-card project-hero-card">
          <div className="project-hero-head">
            <div className="project-switch project-switch--selector">
              <span>项目空间</span>
              <select
                value={selectedProjectId || ""}
                onChange={(event) => {
                  setSelectedProjectId(event.target.value);
                  setNotice(null);
                }}
              >
                {projects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="project-health">健康</div>
          </div>
          <h1 className="project-name">
            {selectedProject ? `${selectedProject.name}（${selectedProject.project_code}）` : "项目空间"}
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
            <span>结算和下一个流程前必检</span>
          </div>
          <div className="project-video-box">
            {docCheck
              ? docCheck.ready
                ? "合同、安全交底和验收表单已齐全"
                : `缺少：${formatDocumentNames(docCheck.missing)}`
              : "请在项目台账中点击“文件校验”查看结果"}
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
          <span>围绕当前选中项目联动展示状态、回款和文件风险</span>
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

      {notice ? <div className={`notice ${notice.type}`}>{notice.text}</div> : null}

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
            <h2>当前项目进度信号</h2>
            <span>当前项目在执行、验收和延期维度上的状态判断</span>
          </div>
          <div className="risk-ring">
            <div className="risk-counts">
              <div className="risk-count">
                <span>正常推进</span>
                <strong>{selectedProgressStats.normal}</strong>
              </div>
              <div className="risk-count">
                <span>验收阶段</span>
                <strong>{selectedProgressStats.acceptance}</strong>
              </div>
              <div className="risk-count">
                <span>延期风险</span>
                <strong>{selectedProgressStats.delayed}</strong>
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
            <ActionButton
              variant="primary"
              onClick={() => {
                setEditing({});
                setNotice(null);
              }}
            >
              新建项目
            </ActionButton>
          </div>

          <div className="toolbar">
            <div className="filters">
              <input
                placeholder="按项目名称或客户搜索"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
              <ActionButton variant="secondary" onClick={loadData}>
                查询
              </ActionButton>
            </div>
          </div>

          {editing !== null ? (
            <ProjectForm
              initialValues={editing.id ? editing : null}
              onSubmit={handleSubmit}
              onCancel={() => {
                setEditing(null);
                setNotice(null);
              }}
            />
          ) : null}

          <DataTable
            columns={[
              {
                key: "project_code",
                title: "项目编号",
                width: "150px",
                minWidth: "150px",
                cellClassName: "cell-nowrap",
                render: (value, row) => <ProjectEntryLink projectId={row.id}>{value}</ProjectEntryLink>
              },
              {
                key: "name",
                title: "项目名称",
                width: "240px",
                minWidth: "240px",
                cellClassName: "cell-multiline",
                render: (value, row) => <ProjectEntryLink projectId={row.id}>{value}</ProjectEntryLink>
              },
              {
                key: "customer_name",
                title: "客户",
                width: "220px",
                minWidth: "220px",
                cellClassName: "cell-multiline"
              },
              {
                key: "project_type",
                title: "项目类型",
                width: "130px",
                minWidth: "130px",
                cellClassName: "cell-nowrap",
                render: (value) => projectTypeLabelMap[value] || value
              },
              {
                key: "status",
                title: "项目状态",
                width: "120px",
                minWidth: "120px",
                cellClassName: "cell-nowrap",
                render: (value) => <StatusBadge value={value} />
              },
              {
                key: "contract_amount",
                title: "合同金额",
                width: "160px",
                minWidth: "160px",
                cellClassName: "cell-nowrap",
                render: (value) => formatCurrency(value)
              },
              {
                key: "collected_amount",
                title: "项目回款",
                width: "160px",
                minWidth: "160px",
                cellClassName: "cell-nowrap",
                render: (value) => formatCurrency(value)
              },
              {
                key: "actual_cost_amount",
                title: "项目成本",
                width: "160px",
                minWidth: "160px",
                cellClassName: "cell-nowrap",
                render: (value) => formatCurrency(value)
              },
              {
                key: "project_manager",
                title: "项目经理",
                width: "120px",
                minWidth: "120px",
                cellClassName: "cell-nowrap"
              }
            ]}
            rows={projects}
            actions={(row) => (
              <div className="btn-row">
                <ActionButton
                  variant={String(selectedProjectId) === String(row.id) ? "primary" : "secondary"}
                  onClick={() => {
                    setSelectedProjectId(row.id);
                    setNotice({ type: "success", text: `已切换到项目空间：${row.name}` });
                  }}
                >
                  切换到看板
                </ActionButton>
                <ActionButton onClick={() => navigate(`/projects/${row.id}/detail`)}>查看详情</ActionButton>
                <ActionButton onClick={() => handleValidateDocs(row)}>文件校验</ActionButton>
                <ActionButton
                  onClick={() => {
                    setEditing(row);
                    setSelectedProjectId(row.id);
                    setNotice(null);
                  }}
                >
                  编辑
                </ActionButton>
                <ActionButton variant="danger" onClick={() => handleDelete(row)}>
                  删除
                </ActionButton>
              </div>
            )}
          />
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <h2>当前项目任务完成情况</h2>
            <span>切换项目后，联动展示该项目自己的任务/现场记录</span>
          </div>
          <div className="list-stack">
            {detailLoading ? <div className="list-item">正在加载当前项目任务...</div> : null}
            {!detailLoading && selectedProject && !selectedProjectTasks.length ? (
              <div className="list-item">当前项目暂无任务或现场记录数据。</div>
            ) : null}
            {!detailLoading &&
              selectedProjectTasks.map((item, index) => (
                <div className="list-item" key={item.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <strong>{index + 1}. {item.title}</strong>
                    <StatusBadge value={item.status} />
                  </div>
                  <div style={{ marginTop: 8, color: "#6e87a5" }}>任务类型：{item.type}</div>
                  <div style={{ marginTop: 6, color: "#6e87a5" }}>计划日期：{formatDate(item.plannedDate)}</div>
                </div>
              ))}
          </div>
        </article>
      </section>
    </div>
  );
}
