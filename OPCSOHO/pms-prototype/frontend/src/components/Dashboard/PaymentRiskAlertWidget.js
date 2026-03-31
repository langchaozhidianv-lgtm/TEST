import React from "react";
import StatusBadge from "../Common/StatusBadge";
import { formatCurrency } from "../../utils/formatters";

export default function PaymentRiskAlertWidget({ items, loading }) {
  return (
    <div>
      <h3 className="card-title">发运回款风险预警</h3>
      <p className="card-subtitle">
        重点标识发运金额高于回款金额的项目，及时发现资金风险缺口。
      </p>
      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className="list-stack">
          {items.slice(0, 5).map((item, index) => (
            <div className="list-item" key={item.project_id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong>{index + 1}. {item.project_code} / {item.project_name || item.name}</strong>
                <StatusBadge value={item.alert_level} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginTop: 12 }}>
                <div>
                  <span style={{ display: "block", color: "#6e87a5", fontSize: 12 }}>发运金额</span>
                  <strong style={{ display: "block", marginTop: 6 }}>{formatCurrency(item.shipped_amount)}</strong>
                </div>
                <div>
                  <span style={{ display: "block", color: "#6e87a5", fontSize: 12 }}>回款金额</span>
                  <strong style={{ display: "block", marginTop: 6 }}>{formatCurrency(item.collected_amount)}</strong>
                </div>
                <div>
                  <span style={{ display: "block", color: "#6e87a5", fontSize: 12 }}>风险缺口</span>
                  <strong style={{ display: "block", marginTop: 6, color: "#f05f6d" }}>{formatCurrency(item.gap_amount)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
