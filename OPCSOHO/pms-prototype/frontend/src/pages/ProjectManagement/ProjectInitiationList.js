import React, { useContext, useEffect, useMemo, useState } from "react";
import DataTable from "../../components/Common/DataTable";
import ActionButton from "../../components/Common/ActionButton";
import StatusBadge from "../../components/Common/StatusBadge";
import ProjectForm from "./ProjectForm";
import { fetchContracts } from "../../api/contractAPI";
import { createProject, fetchProjects } from "../../api/projectAPI";
import { AppContext } from "../../context/AppContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { getErrorMessage } from "../../utils/errors";
import { budgetTemplate, taskTemplate } from "../../utils/projectTemplates";

const eligibleStatuses = new Set(["APPROVED", "EXECUTING", "COMPLETED"]);

const contractStatusLabelMap = {
  DRAFT: "草稿",
  APPROVED: "已签约",
  EXECUTING: "执行中",
  COMPLETED: "已完成",
  CANCELLED: "已取消"
};

function buildProjectDraft(contract) {
  const templateTaskSummary = taskTemplate.map((item, index) => `${index + 1}. ${item.task_name}`).join("；");
  return {
    contract_no: contract.contract_code || "",
    name: contract.project_name ? `${contract.project_name}项目` : "",
    customer_name: contract.counterparty_name || "",
    contract_amount: contract.amount || "",
    description: [
      contract.contract_name ? `来源销售合同：${contract.contract_name}` : "来源销售合同：待补充",
      "触发规则：销售合同签约后发起项目立项",
      `默认任务模板：${templateTaskSummary}`
    ].join("\n"),
    status: "PLANNING"
  };
}

function buildBudgetPayloads(amount) {
  const contractAmount = Number(amount || 0);
  const today = new Date().toISOString().slice(0, 10);

  return budgetTemplate.map((item) => ({
    version_type: "BUDGET",
    cost_category: item.cost_category,
    amount: Math.round(contractAmount * item.ratio),
    entry_date: today,
    source_ref: "PROJECT_INIT_TEMPLATE",
    notes: "项目立项时按默认预算模板自动初始化"
  }));
}

function buildTaskPayloads() {
  return taskTemplate.map((item) => ({
    phase: item.phase,
    task_name: item.task_name,
    assignee_role: item.assignee_role,
    status: "PENDING",
    source_ref: "PROJECT_INIT_TEMPLATE",
    description: "项目立项时按默认任务模板自动初始化"
  }));
}

export default function ProjectInitiationList() {
  const [contracts, setContracts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [notice, setNotice] = useState(null);
  const { showError } = useContext(AppContext);

  const loadData = async () => {
    try {
      const [allContracts, allProjects] = await Promise.all([fetchContracts(), fetchProjects()]);
      setContracts(
        allContracts.filter(
          (item) => item.contract_type === "SALES" && eligibleStatuses.has(String(item.status || "").toUpperCase())
        )
      );
      setProjects(allProjects);
    } catch (error) {
      setContracts([]);
      setProjects([]);
      showError("项目立项数据加载失败", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const contractNameMap = useMemo(() => {
    const map = new Map();
    contracts.forEach((item) => {
      if (item.contract_code) {
        map.set(String(item.contract_code).trim(), item.contract_name || "-");
      }
    });
    return map;
  }, [contracts]);

  const initiatedContractNos = useMemo(
    () => new Set(projects.map((item) => String(item.contract_no || "").trim()).filter(Boolean)),
    [projects]
  );

  const pendingContracts = useMemo(
    () =>
      contracts.filter((item) => {
        const contractNo = String(item.contract_code || "").trim();
        return contractNo && !initiatedContractNos.has(contractNo);
      }),
    [contracts, initiatedContractNos]
  );

  const initiatedProjects = useMemo(
    () =>
      projects.filter((item) => {
        const contractNo = String(item.contract_no || "").trim();
        return contractNo && initiatedContractNos.has(contractNo);
      }),
    [projects, initiatedContractNos]
  );

  const summary = useMemo(
    () => [
      { label: "可触发销售合同", value: contracts.length },
      { label: "待立项合同", value: pendingContracts.length },
      { label: "已完成立项", value: initiatedProjects.length },
      {
        label: "待转化合同额",
        value: formatCurrency(pendingContracts.reduce((sum, item) => sum + Number(item.amount || 0), 0))
      }
    ],
    [contracts, pendingContracts, initiatedProjects]
  );

  const handleCreate = async (payload) => {
    try {
      const budgetPayloads = buildBudgetPayloads(payload.contract_amount);
      const taskPayloads = buildTaskPayloads();

      await createProject({
        ...payload,
        template_tasks: taskPayloads,
        template_budgets: budgetPayloads
      });

      setEditing(null);
      setSelectedContract(null);
      setNotice({
        type: "success",
        text: `项目立项已创建，并已初始化 ${taskPayloads.length} 条任务模板和 ${budgetPayloads.length} 条预算模板。`
      });
      await loadData();
    } catch (error) {
      setNotice({
        type: "error",
        text: getErrorMessage(error, "项目立项保存失败，请稍后重试。")
      });
    }
  };

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">项目立项</h1>
          <p className="page-subtitle">
            正常情况下，项目立项由销售合同签约后触发。这里按销售合同识别待立项项目，并完成转化建档、任务初始化和预算初始化。
          </p>
        </div>
      </section>

      <section className="grid four">
        {summary.map((item) => (
          <div className="panel-card" key={item.label}>
            <span className="card-subtitle">{item.label}</span>
            <div className="metric-value">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <h2>立项规则</h2>
          <span>将销售合同履约状态、默认任务模板和预算模板与项目主数据建档串起来。</span>
        </div>
        <div className="overview-strip">
          <div className="overview-pill">
            <div className="overview-pill__icon" />
            <div>
              <span>触发条件</span>
              <strong>销售合同已签约后发起</strong>
            </div>
          </div>
          <div className="overview-pill">
            <div className="overview-pill__icon" />
            <div>
              <span>来源字段</span>
              <strong>销售合同编号 + 销售合同名称</strong>
            </div>
          </div>
          <div className="overview-pill">
            <div className="overview-pill__icon" />
            <div>
              <span>初始化动作</span>
              <strong>默认任务模板 + 预算模板</strong>
            </div>
          </div>
        </div>
      </section>

      {selectedContract ? (
        <section className="panel-card">
          <div className="section-heading">
            <h2>当前立项来源</h2>
            <span>立项前确认来源销售合同和初始化模板。</span>
          </div>
          <div className="grid two">
            <div className="list-item">
              <strong>销售合同名称</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{selectedContract.contract_name || "-"}</div>
              <div style={{ marginTop: 6, color: "#6e87a5" }}>合同编号：{selectedContract.contract_code || "-"}</div>
            </div>
            <div className="list-item">
              <strong>客户与金额</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{selectedContract.counterparty_name || "-"}</div>
              <div style={{ marginTop: 6, color: "#6e87a5" }}>合同金额：{formatCurrency(selectedContract.amount || 0)}</div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid two">
        <article className="panel-card">
          <div className="section-heading">
            <h2>默认任务模板</h2>
            <span>立项后默认加载，作为项目执行任务的初始化清单。</span>
          </div>
          <div className="list-stack">
            {taskTemplate.map((item, index) => (
              <div className="list-item" key={`${item.phase}-${item.task_name}`}>
                <strong>{index + 1}. {item.task_name}</strong>
                <div style={{ marginTop: 8, color: "#6e87a5" }}>阶段：{item.phase}</div>
                <div style={{ marginTop: 6, color: "#6e87a5" }}>默认责任人：{item.assignee_role}</div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <h2>默认预算模板</h2>
            <span>立项成功后自动写入预算版本成本，供后续预算与实际对比。</span>
          </div>
          <div className="list-stack">
            {budgetTemplate.map((item) => (
              <div className="list-item" key={item.cost_category}>
                <strong>{item.label}</strong>
                <div style={{ marginTop: 8, color: "#6e87a5" }}>预算占比：{Math.round(item.ratio * 100)}%</div>
                {selectedContract ? (
                  <div style={{ marginTop: 6, color: "#6e87a5" }}>
                    初始化金额：{formatCurrency(Number(selectedContract.amount || 0) * item.ratio)}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      </section>

      {notice ? <div className={`notice ${notice.type}`}>{notice.text}</div> : null}

      {editing ? (
        <ProjectForm
          initialValues={editing}
          onSubmit={handleCreate}
          onCancel={() => {
            setEditing(null);
            setSelectedContract(null);
            setNotice(null);
          }}
        />
      ) : null}

      <section className="panel-card">
        <div className="section-heading">
          <h2>待立项销售合同</h2>
          <span>仅展示已签约并且尚未形成项目台账的销售合同。</span>
        </div>
        <DataTable
          rowKey="id"
          columns={[
            { key: "contract_code", title: "销售合同编号" },
            { key: "contract_name", title: "销售合同名称" },
            { key: "project_name", title: "合同对应项目" },
            { key: "counterparty_name", title: "客户名称" },
            { key: "signed_date", title: "签约日期", render: (value) => formatDate(value) },
            { key: "amount", title: "合同金额", render: (value) => formatCurrency(value) },
            {
              key: "status",
              title: "合同状态",
              render: (value) => contractStatusLabelMap[value] || <StatusBadge value={value} />
            }
          ]}
          rows={pendingContracts}
          actions={(row) => (
            <div className="btn-row">
              <ActionButton
                variant="primary"
                onClick={() => {
                  setSelectedContract(row);
                  setEditing(buildProjectDraft(row));
                  setNotice(null);
                }}
              >
                发起立项
              </ActionButton>
            </div>
          )}
        />
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <h2>已完成立项项目</h2>
          <span>已由销售合同转化完成的项目，可继续在项目空间、成本和财务模块中执行。</span>
        </div>
        <DataTable
          columns={[
            { key: "project_code", title: "项目编号" },
            { key: "name", title: "项目名称" },
            { key: "contract_no", title: "关联合同编号" },
            {
              key: "contract_name",
              title: "销售合同名称",
              render: (_, row) => contractNameMap.get(String(row.contract_no || "").trim()) || "-"
            },
            { key: "customer_name", title: "客户名称" },
            { key: "project_manager", title: "项目经理" },
            { key: "contract_amount", title: "合同金额", render: (value) => formatCurrency(value) },
            { key: "status", title: "项目状态", render: (value) => <StatusBadge value={value} /> }
          ]}
          rows={initiatedProjects}
        />
      </section>
    </div>
  );
}
