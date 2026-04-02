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

const versionLabels = {
  SIGNED: "签约成本",
  BUDGET: "预算成本",
  ACTUAL: "实际成本"
};

const costViewMeta = {
  VERSIONS: {
    title: "三版本成本",
    subtitle: "集中查看签约、预算、实际三版本成本对比。",
    button: "新建成本录入",
    showSummary: true
  },
  CATEGORIES: {
    title: "成本科目",
    subtitle: "按成本科目汇总项目成本，便于科目口径核对。",
    button: "新建科目录入",
    showSummary: false
  },
  MATERIALS: {
    title: "剩余材料",
    subtitle: "管理项目剩余材料、处置状态和回收价值。",
    button: "新建剩余材料",
    showSummary: false
  }
};

export default function CostList({ view = "VERSIONS" }) {
  const [costs, setCosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [projectId, setProjectId] = useState("1");
  const { showError } = useContext(AppContext);

  const meta = costViewMeta[view] || costViewMeta.VERSIONS;

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
  }, [projectId, view]);

  const filteredCosts = useMemo(() => {
    if (view === "VERSIONS") {
      return costs.filter((item) => ["SIGNED", "BUDGET", "ACTUAL"].includes(item.version_type));
    }
    if (view === "CATEGORIES") {
      return costs;
    }
    return [];
  }, [costs, view]);

  const handleSubmit = async (payload) => {
    try {
      if (view === "MATERIALS") {
        await createRemainingMaterial(payload);
      } else if (editing?.id) {
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

  const groupedByCategory = useMemo(() => {
    const map = filteredCosts.reduce((acc, item) => {
      const key = item.cost_category;
      acc[key] = (acc[key] || 0) + Number(item.amount || 0);
      return acc;
    }, {});
    return Object.entries(map).map(([key, amount]) => ({ key, amount }));
  }, [filteredCosts]);

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">{meta.title}</h1>
          <p className="page-subtitle">{meta.subtitle}</p>
        </div>
        <div className="hero-actions">
          <ActionButton variant="primary" onClick={() => setEditing({ project_id: projectId })}>
            {meta.button}
          </ActionButton>
        </div>
      </section>

      <div className="toolbar">
        <div className="filters">
          <input
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            placeholder="输入项目 ID 查看当前项目"
          />
          <ActionButton onClick={loadData}>刷新</ActionButton>
        </div>
      </div>

      {meta.showSummary ? (
        <section className="grid four">
          {summary.map((item) => (
            <div className="panel-card" key={item.label}>
              <span className="card-subtitle">{item.label}</span>
              <div className="metric-value">{item.value}</div>
            </div>
          ))}
        </section>
      ) : null}

      {editing !== null ? (
        <CostForm
          view={view}
          initialValues={editing.id ? editing : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      {view === "VERSIONS" && comparison ? (
        <section className="panel-card">
          <div className="section-heading">
            <h2>三版本成本对比</h2>
            <span>项目 {projectId} 的签约、预算、实际成本执行情况。</span>
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
        </section>
      ) : null}

      {view === "CATEGORIES" ? (
        <section className="panel-card">
          <div className="section-heading">
            <h2>成本科目汇总</h2>
            <span>按科目汇总当前项目的成本金额。</span>
          </div>
          <div className="grid three">
            {groupedByCategory.map((item) => (
              <div key={item.key} className="list-item">
                <strong>{categoryMap[item.key] || item.key}</strong>
                <div style={{ marginTop: 8, color: "#6e87a5" }}>{formatCurrency(item.amount)}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {view === "MATERIALS" ? (
        <section className="panel-card">
          <div className="section-heading">
            <h2>剩余材料台账</h2>
            <span>管理项目剩余材料、处置状态与回收价值。</span>
          </div>
          <DataTable
            columns={[
              { key: "material_name", title: "材料名称" },
              { key: "specification", title: "规格说明" },
              { key: "quantity", title: "数量" },
              { key: "unit", title: "单位" },
              { key: "estimated_value", title: "估值", render: (value) => formatCurrency(value) },
              { key: "status", title: "状态" }
            ]}
            rows={comparison?.remainingMaterials || []}
          />
        </section>
      ) : (
        <section className="panel-card">
          <div className="section-heading">
            <h2>{meta.title}台账</h2>
            <span>根据当前二级菜单展示对应的成本记录视图。</span>
          </div>
          <DataTable
            columns={[
              { key: "project_name", title: "项目名称" },
              { key: "version_type", title: "版本类型", render: (value) => versionLabels[value] || value },
              { key: "cost_category", title: "成本科目", render: (value) => categoryMap[value] || value },
              { key: "amount", title: "金额", render: (value) => formatCurrency(value) },
              { key: "entry_date", title: "录入日期" },
              { key: "source_ref", title: "来源单号" }
            ]}
            rows={filteredCosts}
            actions={(row) => (
              <div className="btn-row">
                <ActionButton onClick={() => setEditing(row)}>编辑</ActionButton>
                <ActionButton variant="danger" onClick={() => handleDelete(row)}>删除</ActionButton>
              </div>
            )}
          />
        </section>
      )}
    </div>
  );
}
