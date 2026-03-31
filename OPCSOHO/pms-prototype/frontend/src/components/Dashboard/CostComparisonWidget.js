import React from "react";
import { formatCurrency } from "../../utils/formatters";

export default function CostComparisonWidget({ items, loading }) {
  return (
    <div>
      <h3 className="card-title">三版本成本对比</h3>
      <p className="card-subtitle">
        统一对比签约、预算和实际成本，快速判断预算执行偏差。
      </p>
      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className="list-stack">
          {items.map((item) => {
            const signed = Number(item.signed_cost || 0);
            const budget = Number(item.budget_cost || 0);
            const actual = Number(item.actual_cost || 0);
            const executionRate = budget > 0 ? Math.min((actual / budget) * 100, 100) : 0;

            return (
              <div className="list-item" key={item.project_id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <strong>项目 #{item.project_id}</strong>
                  <span className="badge badge-success">执行率 {executionRate.toFixed(0)}%</span>
                </div>
                <div style={{ marginTop: 10, color: "#6e87a5" }}>签约成本：{formatCurrency(signed)}</div>
                <div style={{ marginTop: 6, color: "#6e87a5" }}>预算成本：{formatCurrency(budget)}</div>
                <div style={{ marginTop: 6, color: "#6e87a5" }}>实际成本：{formatCurrency(actual)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
