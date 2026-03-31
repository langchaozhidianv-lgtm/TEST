import React, { useContext, useEffect, useMemo, useState } from "react";
import DataTable from "../../components/Common/DataTable";
import ActionButton from "../../components/Common/ActionButton";
import CostForm from "./CostForm";
import {
  createCost,
  createRemainingMaterial,
  deleteCost,
  fetchCostComparison,
  fetchCosts,
  updateCost
} from "../../api/costAPI";
import { formatCurrency } from "../../utils/formatters";
import { AppContext } from "../../context/AppContext";

const categoryMap = {
  MAIN_MATERIAL: "主材",
  AUX_MATERIAL: "辅材",
  LABOR: "劳务",
  EXPENSE: "费用",
  SHIPPING: "运输",
  OTHER: "其他"
};

export default function CostList() {
  const [costs, setCosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [projectId, setProjectId] = useState("1");
  const { showError } = useContext(AppContext);

  const loadData = async () => {
    try {
      const [costRows, comparisonData] = await Promise.all([
        fetchCosts(),
        fetchCostComparison(projectId)
      ]);
      setCosts(costRows);
      setComparison(comparisonData);
    } catch (error) {
      setCosts([]);
      setComparison(null);
      showError("成本数据加载失败", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleSubmit = async (payload) => {
    try {
      if (editing?.id) {
        await updateCost(editing.id, payload);
      } else {
        await createCost(payload);
      }
      setEditing(null);
      loadData();
    } catch (error) {
      showError("成本保存失败", error);
    }
  };

  const quickAddRemaining = async () => {
    try {
      await createRemainingMaterial({
        project_id: projectId,
        material_name: "示例剩余材料",
        specification: "现场余量",
        quantity: 10,
        unit: "件",
        estimated_value: 5000,
        status: "REUSABLE",
        disposal_notes: "用于演示剩余材料回收管理"
      });
      loadData();
    } catch (error) {
      showError("剩余材料新增失败", error);
    }
  };

  const handleDelete = async (row) => {
    try {
      await deleteCost(row.id);
      loadData();
    } catch (error) {
      showError("成本删除失败", error);
    }
  };

  const summary = useMemo(() => {
    if (!comparison?.comparison) return [];

    const totals = comparison.comparison.reduce(
      (acc, item) => {
        acc.signed += Number(item.signed_cost || 0);
        acc.budget += Number(item.budget_cost || 0);
        acc.actual += Number(item.actual_cost || 0);
        return acc;
      },
      { signed: 0, budget: 0, actual: 0 }
    );

    return [
      { label: "签约成本", value: formatCurrency(totals.signed) },
      { label: "预算成本", value: formatCurrency(totals.budget) },
      { label: "实际成本", value: formatCurrency(totals.actual) },
      { label: "成本偏差", value: formatCurrency(totals.actual - totals.budget) }
    ];
  }, [comparison]);

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">成本管理</h1>
          <p className="page-subtitle">
            管理签约、预算、实际三版本成本，并联动剩余材料数据，支撑经营分析和预算校核。
          </p>
        </div>
        <div className="hero-actions">
          <ActionButton onClick={quickAddRemaining}>新增剩余材料</ActionButton>
          <ActionButton variant="primary" onClick={() => setEditing({ project_id: projectId })}>新建成本</ActionButton>
        </div>
      </section>

      <div className="toolbar">
        <div className="filters">
          <input
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            placeholder="输入项目 ID 查看对比"
          />
          <ActionButton onClick={loadData}>刷新对比</ActionButton>
        </div>
      </div>

      <section className="grid four">
        {summary.map((item) => (
          <div className="panel-card" key={item.label}>
            <span className="card-subtitle">{item.label}</span>
            <div className="metric-value">{item.value}</div>
          </div>
        ))}
      </section>

      {comparison ? (
        <section className="panel-card">
          <div className="section-heading">
            <h2>三版本成本对比</h2>
            <span>项目 {projectId} 的成本执行情况</span>
          </div>
          <div className="grid three">
            {comparison.comparison.map((item) => (
              <div key={item.cost_category} className="list-item">
                <strong>{categoryMap[item.cost_category] || item.cost_category}</strong>
                <div style={{ marginTop: 10, color: "#6e87a5" }}>签约成本：{formatCurrency(item.signed_cost)}</div>
                <div style={{ marginTop: 6, color: "#6e87a5" }}>预算成本：{formatCurrency(item.budget_cost)}</div>
                <div style={{ marginTop: 6, color: "#6e87a5" }}>实际成本：{formatCurrency(item.actual_cost)}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <strong>剩余材料：</strong>
            {" "}
            {comparison.remainingMaterials?.length
              ? comparison.remainingMaterials.map((item) => `${item.material_name}（${item.status}）`).join("、")
              : "暂无"}
          </div>
        </section>
      ) : null}

      {editing !== null ? (
        <CostForm
          initialValues={editing.id ? editing : null}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <section className="panel-card">
        <div className="section-heading">
          <h2>成本台账</h2>
          <span>按项目、版本和科目跟踪成本录入</span>
        </div>
        <DataTable
          columns={[
            { key: "project_name", title: "项目" },
            { key: "version_type", title: "版本类型" },
            { key: "cost_category", title: "成本科目", render: (value) => categoryMap[value] || value },
            { key: "amount", title: "金额", render: (value) => formatCurrency(value) },
            { key: "entry_date", title: "录入日期" },
            { key: "source_ref", title: "来源单号" }
          ]}
          rows={costs}
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
