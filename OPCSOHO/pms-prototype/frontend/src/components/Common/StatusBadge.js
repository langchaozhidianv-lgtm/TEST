import React from "react";

const toneMap = {
  DELAYED: "danger",
  BLOCKED: "danger",
  OVERDUE: "danger",
  RED: "danger",
  PENDING: "warning",
  IN_PROGRESS: "warning",
  PENDING_CONFIRM: "warning",
  AMBER: "warning",
  APPROVED: "success",
  PAID: "success",
  COMPLETED: "success",
  GREEN: "success"
};

const labelMap = {
  PLANNING: "计划中",
  IN_PROGRESS: "执行中",
  DELAYED: "已延期",
  ACCEPTANCE: "验收中",
  WARRANTY: "质保中",
  CLOSED: "已完结",
  DRAFT: "草稿",
  APPROVED: "已审批",
  EXECUTING: "履约中",
  COMPLETED: "已完成",
  CHANGED: "已变更",
  PLANNED: "已计划",
  PENDING: "待处理",
  PAID: "已支付",
  BLOCKED: "已阻断",
  OVERDUE: "已逾期",
  PENDING_CONFIRM: "待确认",
  RED: "红色预警",
  AMBER: "黄色预警",
  GREEN: "正常",
  REUSABLE: "可复用",
  TO_BE_SCRAPPED: "待报废",
  SOLD: "已出售",
  REDEPLOYED: "已调拨"
};

export default function StatusBadge({ value, labelMapOverride }) {
  const tone = toneMap[value] || "neutral";
  return <span className={`badge badge-${tone}`}>{labelMapOverride?.[value] || labelMap[value] || value}</span>;
}
