import React, { useContext, useEffect, useState } from "react";
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

export default function FinanceList() {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState(null);
  const { showError } = useContext(AppContext);

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
  }, []);

  const handleSubmit = async (payload) => {
    try {
      const result = editing?.id
        ? await updateFinanceTransaction(editing.id, payload)
        : await createFinanceTransaction(payload);

      setNotice(
        result.warning
          ? { type: "warning", text: result.warning }
          : { type: "success", text: "财务事项保存成功" }
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
      showError("财务记录删除失败", error);
    }
  };

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">财务管理</h1>
          <p className="page-subtitle">
            管理收款计划、付款申请、报销、工资代发和到期提醒，并联动预算与预付款校验规则。
          </p>
        </div>
        <ActionButton variant="primary" onClick={() => setEditing({})}>新建财务事项</ActionButton>
      </section>

      {notice ? <div className={`notice ${notice.type}`}>{notice.text}</div> : null}

      <section className="panel-card">
        <div className="section-heading">
          <h2>发运回款风险</h2>
          <span>重点项目的发运与回款缺口预警</span>
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
                <div style={{ marginTop: 8, color: "#6e87a5" }}>发运金额：{formatCurrency(item.shipped_amount)}</div>
                <div style={{ marginTop: 6, color: "#6e87a5" }}>回款金额：{formatCurrency(item.collected_amount)}</div>
                <div style={{ marginTop: 6, color: "#6e87a5" }}>风险缺口：{formatCurrency(item.gap_amount)}</div>
              </div>
              <StatusBadge value={item.alert_level} />
            </div>
          ))}
        </div>
      </section>

      {editing !== null ? (
        <FinanceForm
          initialValues={editing.id ? editing : null}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <section className="panel-card">
        <div className="section-heading">
          <h2>收付款台账</h2>
          <span>所有财务记录均与项目和合同保持关联</span>
        </div>
        <DataTable
          columns={[
            { key: "project_name", title: "项目" },
            { key: "transaction_type", title: "交易类型" },
            { key: "direction", title: "收支方向" },
            { key: "amount", title: "金额", render: (value) => formatCurrency(value) },
            { key: "due_date", title: "到期日期", render: (value) => formatDate(value) },
            { key: "vendor_name", title: "往来单位" },
            { key: "status", title: "状态", render: (value) => <StatusBadge value={value} /> }
          ]}
          rows={items}
          actions={(row) => (
            <div className="btn-row">
              <ActionButton onClick={() => setEditing(row)}>编辑</ActionButton>
              <ActionButton variant="danger" onClick={() => handleDelete(row)}>删除</ActionButton>
            </div>
          )}
        />
      </section>
    </div>
  );
}
