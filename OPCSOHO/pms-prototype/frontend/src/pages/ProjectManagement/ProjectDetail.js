import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ActionButton from "../../components/Common/ActionButton";
import DataTable from "../../components/Common/DataTable";
import StatusBadge from "../../components/Common/StatusBadge";
import { AppContext } from "../../context/AppContext";
import { fetchProjectDetail } from "../../api/projectAPI";
import { formatCurrency, formatDate } from "../../utils/formatters";

const costCategoryMap = {
  MAIN_MATERIAL: "主材",
  AUX_MATERIAL: "辅材",
  LABOR: "劳务",
  EXPENSE: "费用",
  SHIPPING: "运输",
  OTHER: "其他"
};

const siteTypeMap = {
  PROCUREMENT: "采购",
  SHIPPING: "发运",
  MATERIAL: "材料动态",
  LABOR: "劳务",
  SAFETY: "安全",
  ACCEPTANCE: "验收"
};

function sumBy(entries, predicate) {
  return entries.reduce((total, item) => (predicate(item) ? total + Number(item.amount || 0) : total), 0);
}

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showError } = useContext(AppContext);
  const [detail, setDetail] = useState(null);
  const [selectedContractId, setSelectedContractId] = useState("");

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setDetail(await fetchProjectDetail(id));
      } catch (error) {
        showError("项目详情加载失败", error);
      }
    };

    loadDetail();
  }, [id, showError]);

  const project = detail?.project;
  const contracts = detail?.contracts || [];
  const costEntries = detail?.costSummary?.entries || [];
  const financeTransactions = detail?.financeSummary?.transactions || [];
  const siteRecords = detail?.siteSummary?.records || [];
  const selectedContract = contracts.find((item) => String(item.id) === String(selectedContractId)) || null;

  const contractScopedCosts = useMemo(
    () => (selectedContract ? costEntries.filter((item) => String(item.contract_id) === String(selectedContract.id)) : costEntries),
    [costEntries, selectedContract]
  );

  const contractCostSummary = useMemo(() => {
    const groups = Object.values(
      contractScopedCosts.reduce((acc, item) => {
        if (!acc[item.cost_category]) {
          acc[item.cost_category] = {
            cost_category: item.cost_category,
            signed_cost: 0,
            budget_cost: 0,
            actual_cost: 0
          };
        }
        if (item.version_type === "SIGNED") acc[item.cost_category].signed_cost += Number(item.amount || 0);
        if (item.version_type === "BUDGET") acc[item.cost_category].budget_cost += Number(item.amount || 0);
        if (item.version_type === "ACTUAL") acc[item.cost_category].actual_cost += Number(item.amount || 0);
        return acc;
      }, {})
    );

    return {
      rows: groups,
      totals: {
        signed_total: sumBy(contractScopedCosts, (item) => item.version_type === "SIGNED"),
        budget_total: sumBy(contractScopedCosts, (item) => item.version_type === "BUDGET"),
        actual_total: sumBy(contractScopedCosts, (item) => item.version_type === "ACTUAL")
      }
    };
  }, [contractScopedCosts]);

  const contractScopedFinance = useMemo(
    () => (selectedContract ? financeTransactions.filter((item) => String(item.contract_id) === String(selectedContract.id)) : financeTransactions),
    [financeTransactions, selectedContract]
  );

  const financeSummary = useMemo(() => ({
    collection_plan_total: sumBy(contractScopedFinance, (item) => item.transaction_type === "COLLECTION_PLAN"),
    collection_total: sumBy(contractScopedFinance, (item) => item.transaction_type === "COLLECTION"),
    payment_plan_total: sumBy(contractScopedFinance, (item) => item.transaction_type === "PAYMENT_PLAN"),
    pending_expense_total: sumBy(contractScopedFinance, (item) => item.direction === "EXPENSE" && ["PENDING", "APPROVED"].includes(item.status)),
    paid_expense_total: sumBy(contractScopedFinance, (item) => item.direction === "EXPENSE" && item.status === "PAID"),
    prepayment_total: sumBy(contractScopedFinance, (item) => item.transaction_type === "PREPAYMENT" && ["APPROVED", "PAID"].includes(item.status))
  }), [contractScopedFinance]);

  const headlineMetrics = useMemo(() => {
    if (!project) return [];

    return [
      { label: "合同金额", value: formatCurrency(selectedContract?.amount || project.contract_amount) },
      { label: "预算成本", value: formatCurrency(selectedContract ? contractCostSummary.totals.budget_total : detail?.costSummary?.totals?.budget_total || 0) },
      { label: "实际成本", value: formatCurrency(selectedContract ? contractCostSummary.totals.actual_total : detail?.costSummary?.totals?.actual_total || 0) },
      { label: "项目风险缺口", value: formatCurrency(detail?.financeSummary?.totals?.risk_gap || 0) }
    ];
  }, [project, selectedContract, contractCostSummary, detail]);

  if (!detail) {
    return (
      <div className="grid">
        <section className="hero-band">
          <div>
            <h1 className="page-title">项目详情</h1>
            <p className="page-subtitle">正在加载项目详情数据...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid">
      <section className="project-hero">
        <article className="panel-card project-hero-card">
          <div className="project-hero-head">
            <div className="project-switch">{selectedContract ? "合同维度" : "项目总览"}</div>
            <div className="project-health">
              <StatusBadge value={project.status} />
            </div>
          </div>
          <h1 className="project-name">{project.name}</h1>
          <div className="project-meta-grid">
            <div className="project-meta">
              <span>项目编号</span>
              <strong>{project.project_code}</strong>
            </div>
            <div className="project-meta">
              <span>客户</span>
              <strong>{project.customer_name}</strong>
            </div>
            <div className="project-meta">
              <span>事业部</span>
              <strong>{project.division_name}</strong>
            </div>
            <div className="project-meta">
              <span>项目经理</span>
              <strong>{project.project_manager}</strong>
            </div>
          </div>
        </article>

        <article className="panel-card project-side-card">
          <div className="section-heading">
            <h2>当前视角</h2>
            <span>{selectedContract ? `合同：${selectedContract.contract_name}` : "未选择具体合同"}</span>
          </div>
          <div className="detail-actions">
            <ActionButton variant="primary" onClick={() => navigate(`/projects/${id}/files`)}>查看文件校验</ActionButton>
            <ActionButton onClick={() => setSelectedContractId("")}>返回项目总览</ActionButton>
            <ActionButton onClick={() => navigate("/reports")}>进入报表中心</ActionButton>
            <ActionButton onClick={() => navigate("/projects")}>返回项目台账</ActionButton>
          </div>
        </article>
      </section>

      <section className="grid four">
        {headlineMetrics.map((item) => (
          <div className="panel-card" key={item.label}>
            <span className="card-subtitle">{item.label}</span>
            <div className="metric-value">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="detail-section-grid">
        <article className="panel-card">
          <div className="section-heading">
            <h2>合同摘要</h2>
            <span>点击“切换视角”驱动成本和财务联动</span>
          </div>
          <DataTable
            columns={[
              { key: "contract_code", title: "合同编号" },
              { key: "contract_type", title: "类型" },
              { key: "contract_name", title: "合同名称" },
              { key: "amount", title: "金额", render: (value) => formatCurrency(value) },
              { key: "status", title: "状态", render: (value) => <StatusBadge value={value} /> }
            ]}
            rows={contracts}
            actions={(row) => (
              <div className="btn-row">
                <ActionButton variant={String(selectedContractId) === String(row.id) ? "primary" : "secondary"} onClick={() => setSelectedContractId(String(row.id))}>
                  切换视角
                </ActionButton>
              </div>
            )}
          />
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <h2>成本摘要</h2>
            <span>{selectedContract ? "当前合同的三版本成本" : "项目级三版本成本摘要"}</span>
          </div>
          {contractCostSummary.rows.length ? (
            <div className="list-stack">
              {contractCostSummary.rows.map((item) => (
                <div className="list-item" key={item.cost_category}>
                  <strong>{costCategoryMap[item.cost_category] || item.cost_category}</strong>
                  <div style={{ marginTop: 8, color: "#6e87a5" }}>签约成本：{formatCurrency(item.signed_cost)}</div>
                  <div style={{ marginTop: 6, color: "#6e87a5" }}>预算成本：{formatCurrency(item.budget_cost)}</div>
                  <div style={{ marginTop: 6, color: "#6e87a5" }}>实际成本：{formatCurrency(item.actual_cost)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="project-video-box">当前合同下暂无成本记录</div>
          )}
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <h2>收付款与风险</h2>
            <span>{selectedContract ? "当前合同收付款视角" : "项目级财务执行情况"}</span>
          </div>
          <div className="grid two">
            <div className="list-item">
              <strong>收款计划</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{formatCurrency(financeSummary.collection_plan_total)}</div>
            </div>
            <div className="list-item">
              <strong>已回款</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{formatCurrency(financeSummary.collection_total)}</div>
            </div>
            <div className="list-item">
              <strong>待付款</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{formatCurrency(financeSummary.pending_expense_total)}</div>
            </div>
            <div className="list-item">
              <strong>历史预付款</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{formatCurrency(financeSummary.prepayment_total)}</div>
            </div>
          </div>
          <div className="notice warning" style={{ marginTop: 16, marginBottom: 0 }}>
            项目级风险缺口：{formatCurrency(detail.financeSummary.totals.risk_gap || 0)}
          </div>
        </article>

        <article className="panel-card">
          <div className="section-heading">
            <h2>采购与现场动态</h2>
            <span>保持项目级展示，不跟随合同切换</span>
          </div>
          <div className="grid two">
            <div className="list-item">
              <strong>采购记录</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{detail.siteSummary.totals.procurement_count || 0} 条</div>
            </div>
            <div className="list-item">
              <strong>发运记录</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{detail.siteSummary.totals.shipping_count || 0} 条</div>
            </div>
            <div className="list-item">
              <strong>劳务记录</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{detail.siteSummary.totals.labor_count || 0} 条</div>
            </div>
            <div className="list-item">
              <strong>安全/验收</strong>
              <div style={{ marginTop: 8, color: "#6e87a5" }}>{(detail.siteSummary.totals.safety_count || 0) + (detail.siteSummary.totals.acceptance_count || 0)} 条</div>
            </div>
          </div>
          <div className="list-stack" style={{ marginTop: 16 }}>
            {siteRecords.slice(0, 4).map((item) => (
              <div className="list-item" key={item.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{item.title}</strong>
                  <StatusBadge value={item.status} />
                </div>
                <div style={{ marginTop: 8, color: "#6e87a5" }}>类型：{siteTypeMap[item.record_type] || item.record_type}</div>
                <div style={{ marginTop: 6, color: "#6e87a5" }}>计划日期：{formatDate(item.planned_date)}</div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <h2>剩余材料</h2>
          <span>剩余材料价值与处置建议</span>
        </div>
        <DataTable
          columns={[
            { key: "material_name", title: "材料名称" },
            { key: "specification", title: "规格" },
            { key: "quantity", title: "数量" },
            { key: "unit", title: "单位" },
            { key: "estimated_value", title: "估值", render: (value) => formatCurrency(value) },
            { key: "status", title: "状态", render: (value) => <StatusBadge value={value} /> }
          ]}
          rows={detail.remainingMaterials}
        />
      </section>
    </div>
  );
}
