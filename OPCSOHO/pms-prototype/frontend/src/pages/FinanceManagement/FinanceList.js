import React, { useContext, useEffect, useMemo, useState } from "react";
import DataTable from "../../components/Common/DataTable";
import ActionButton from "../../components/Common/ActionButton";
import StatusBadge from "../../components/Common/StatusBadge";
import FinanceForm from "./FinanceForm";
import {
  createFinanceTransaction,
  deleteFinanceTransaction,
  fetchFinanceTransactions,
  fetchPaymentRiskAlerts,
  updateFinanceTransaction
} from "../../api/financeAPI";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { AppContext } from "../../context/AppContext";
import { getErrorMessage } from "../../utils/errors";

const transactionTypeLabels = {
  COLLECTION_PLAN: "收款计划",
  COLLECTION: "收款记录",
  PAYMENT_PLAN: "付款计划",
  PAYMENT_REQUEST: "付款申请",
  REIMBURSEMENT: "报销",
  WAGE_DISBURSEMENT: "工资发放",
  PREPAYMENT: "预付款"
};

const financeViewMeta = {
  COLLECTIONS: {
    title: "收款管理",
    subtitle: "查看收款计划与收款记录，跟踪项目回款节奏。",
    button: "新建收款事项",
    types: ["COLLECTION_PLAN", "COLLECTION"],
    defaultType: "COLLECTION",
    showRisk: false
  },
  PAYMENTS: {
    title: "付款管理",
    subtitle: "统一管理付款计划、付款申请和预付款事项。",
    button: "新建付款事项",
    types: ["PAYMENT_PLAN", "PAYMENT_REQUEST", "PREPAYMENT"],
    defaultType: "PAYMENT_REQUEST",
    showRisk: true
  },
  REIMBURSEMENTS: {
    title: "报销管理",
    subtitle: "单独管理报销申请和费用支出记录。",
    button: "新建报销事项",
    types: ["REIMBURSEMENT"],
    defaultType: "REIMBURSEMENT",
    showRisk: false
  },
  WAGES: {
    title: "劳务人员工资发放记录",
    subtitle: "集中管理项目经理上传的劳务工资发放记录、财务复核与到账状态。",
    button: "新建劳务人员工资发放记录",
    types: ["WAGE_DISBURSEMENT"],
    defaultType: "WAGE_DISBURSEMENT",
    showRisk: false
  },
  RISKS: {
    title: "风险预警",
    subtitle: "聚焦发运回款缺口和付款风险，不强调录入动作。",
    button: null,
    types: [],
    defaultType: "PAYMENT_REQUEST",
    showRisk: true
  }
};

const wageStatusLabels = {
  PENDING: "待财务复核",
  APPROVED: "待发放",
  PAID: "已发放",
  COMPLETED: "已归档",
  BLOCKED: "资料退回"
};

function formatMonthValue(value) {
  if (!value) {
    return "-";
  }

  return String(value).slice(0, 7);
}

export default function FinanceList({ view = "PAYMENTS" }) {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState(null);
  const { showError } = useContext(AppContext);

  const meta = financeViewMeta[view] || financeViewMeta.PAYMENTS;
  const isWageView = view === "WAGES";

  const loadData = async () => {
    try {
      const [transactions, riskAlerts] = await Promise.all([
        fetchFinanceTransactions(),
        fetchPaymentRiskAlerts()
      ]);
      setItems(transactions);
      setAlerts(riskAlerts);
    } catch (error) {
      setItems([]);
      setAlerts([]);
      showError("财务数据加载失败", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [view]);

  const filteredItems = useMemo(() => {
    if (view === "RISKS") {
      return [];
    }
    return items.filter((item) => meta.types.includes(item.transaction_type));
  }, [items, meta.types, view]);

  const handleSubmit = async (payload) => {
    try {
      const nextPayload = {
        ...payload,
        transaction_type: payload.transaction_type || meta.defaultType
      };
      const result = editing?.id
        ? await updateFinanceTransaction(editing.id, nextPayload)
        : await createFinanceTransaction(nextPayload);

      setNotice(
        result.warning
          ? { type: "warning", text: result.warning }
          : { type: "success", text: isWageView ? "工资发放记录保存成功" : "财务事项保存成功" }
      );
      setEditing(null);
      loadData();
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error, "提交失败") });
    }
  };

  const handleDelete = async (row) => {
    try {
      await deleteFinanceTransaction(row.id);
      loadData();
    } catch (error) {
      showError(isWageView ? "工资发放记录删除失败" : "财务记录删除失败", error);
    }
  };

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">{meta.title}</h1>
          <p className="page-subtitle">{meta.subtitle}</p>
        </div>
        {meta.button ? (
          <ActionButton variant="primary" onClick={() => setEditing({ transaction_type: meta.defaultType })}>
            {meta.button}
          </ActionButton>
        ) : null}
      </section>

      {notice ? <div className={`notice ${notice.type}`}>{notice.text}</div> : null}

      {meta.showRisk ? (
        <section className="panel-card">
          <div className="section-heading">
            <h2>发运回款风险</h2>
            <span>重点项目的发运与回款缺口预警。</span>
          </div>
          <div className="list-stack">
            {alerts.slice(0, 4).map((item) => (
              <div
                key={item.project_id}
                className="list-item"
                style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
              >
                <div>
                  <strong>{item.project_code} / {item.project_name || item.name}</strong>
                  <div style={{ marginTop: 8, color: "#6e87a5" }}>发运金额: {formatCurrency(item.shipped_amount)}</div>
                  <div style={{ marginTop: 6, color: "#6e87a5" }}>回款金额: {formatCurrency(item.collected_amount)}</div>
                  <div style={{ marginTop: 6, color: "#6e87a5" }}>风险缺口: {formatCurrency(item.gap_amount)}</div>
                </div>
                <StatusBadge value={item.alert_level} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {editing !== null ? (
        <FinanceForm
          view={view}
          defaultTransactionType={meta.defaultType}
          initialValues={editing.id ? editing : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      {view !== "RISKS" ? (
        <section className="panel-card">
          <div className="section-heading">
            <h2>{meta.title}台账</h2>
            <span>{isWageView ? "按项目经理上传记录展示工资发放批次与财务处理状态。" : "当前列表仅展示与当前二级菜单对应的财务类型。"}</span>
          </div>
          <DataTable
            columns={isWageView ? [
              { key: "project_name", title: "项目名称" },
              { key: "vendor_name", title: "劳务班组/劳务单位" },
              { key: "amount", title: "发放总金额", render: (value) => formatCurrency(value) },
              { key: "due_date", title: "工资所属月份", render: (value) => formatMonthValue(value) },
              { key: "transaction_date", title: "上传日期", render: (value) => formatDate(value) },
              { key: "applicant", title: "上传项目经理" },
              { key: "status", title: "发放状态", render: (value) => <StatusBadge value={value} labelMapOverride={wageStatusLabels} /> }
            ] : [
              { key: "project_name", title: "项目名称" },
              { key: "transaction_type", title: "交易类型", render: (value) => transactionTypeLabels[value] || value },
              { key: "direction", title: "收支方向" },
              { key: "amount", title: "金额", render: (value) => formatCurrency(value) },
              { key: "due_date", title: "到期日期", render: (value) => formatDate(value) },
              { key: "vendor_name", title: "往来单位" },
              { key: "status", title: "状态", render: (value) => <StatusBadge value={value} /> }
            ]}
            rows={filteredItems}
            actions={(row) => (
              <div className="btn-row">
                <ActionButton onClick={() => setEditing(row)}>编辑</ActionButton>
                <ActionButton variant="danger" onClick={() => handleDelete(row)}>删除</ActionButton>
              </div>
            )}
          />
        </section>
      ) : (
        <section className="panel-card">
          <div className="section-heading">
            <h2>风险项目台账</h2>
            <span>按发运回款缺口展示高风险项目。</span>
          </div>
          <DataTable
            columns={[
              { key: "project_code", title: "项目编号" },
              { key: "project_name", title: "项目名称" },
              { key: "shipped_amount", title: "发运金额", render: (value) => formatCurrency(value) },
              { key: "collected_amount", title: "回款金额", render: (value) => formatCurrency(value) },
              { key: "gap_amount", title: "风险缺口", render: (value) => formatCurrency(value) },
              { key: "alert_level", title: "预警等级", render: (value) => <StatusBadge value={value} /> }
            ]}
            rows={alerts}
          />
        </section>
      )}
    </div>
  );
}
