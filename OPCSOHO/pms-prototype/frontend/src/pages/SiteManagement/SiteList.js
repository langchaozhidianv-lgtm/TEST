import React, { useContext, useEffect, useMemo, useState } from "react";
import DataTable from "../../components/Common/DataTable";
import ActionButton from "../../components/Common/ActionButton";
import StatusBadge from "../../components/Common/StatusBadge";
import SiteForm from "./SiteForm";
import {
  createSiteRecord,
  deleteSiteRecord,
  fetchSiteRecords,
  updateSiteRecord
} from "../../api/siteAPI";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { AppContext } from "../../context/AppContext";

const typeLabels = {
  PROCUREMENT: "采购",
  SHIPPING: "发运",
  MATERIAL: "材料动态",
  LABOR: "劳务",
  SAFETY: "安全",
  ACCEPTANCE: "验收"
};

const siteViewMeta = {
  LABOR: {
    title: "劳务管理",
    subtitle: "跟踪劳务班组、施工安排和劳务执行状态。",
    button: "新建劳务记录",
    types: ["LABOR"],
    defaultType: "LABOR"
  },
  SAFETY: {
    title: "安全管理",
    subtitle: "维护安全检查、安全交底和现场安全事项。",
    button: "新建安全记录",
    types: ["SAFETY"],
    defaultType: "SAFETY"
  },
  ACCEPTANCE: {
    title: "验收管理",
    subtitle: "维护分阶段验收和项目交付验收记录。",
    button: "新建验收记录",
    types: ["ACCEPTANCE"],
    defaultType: "ACCEPTANCE"
  },
  RECORDS: {
    title: "现场记录",
    subtitle: "综合查看现场与劳务相关记录，不含采购执行模块。",
    button: "新建现场记录",
    types: ["LABOR", "SAFETY", "ACCEPTANCE"],
    defaultType: "LABOR"
  }
};

export default function SiteList({ view = "LABOR" }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const { showError } = useContext(AppContext);

  const meta = siteViewMeta[view] || siteViewMeta.LABOR;

  const loadData = async () => {
    try {
      const rows = await fetchSiteRecords();
      setItems(rows.filter((item) => meta.types.includes(item.record_type)));
    } catch (error) {
      setItems([]);
      showError("现场数据加载失败", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [view]);

  const handleSubmit = async (payload) => {
    try {
      const nextPayload = {
        ...payload,
        record_type: payload.record_type || meta.defaultType
      };
      if (editing?.id) {
        await updateSiteRecord(editing.id, nextPayload);
      } else {
        await createSiteRecord(nextPayload);
      }
      setEditing(null);
      loadData();
    } catch (error) {
      showError("现场记录保存失败", error);
    }
  };

  const handleDelete = async (row) => {
    try {
      await deleteSiteRecord(row.id);
      loadData();
    } catch (error) {
      showError("现场记录删除失败", error);
    }
  };

  const summary = useMemo(() => {
    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const completed = items.filter((item) => item.status === "COMPLETED").length;
    return [
      { label: "记录数量", value: items.length },
      { label: "累计金额", value: formatCurrency(totalAmount) },
      { label: "已完成", value: completed }
    ];
  }, [items]);

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">{meta.title}</h1>
          <p className="page-subtitle">{meta.subtitle}</p>
        </div>
        <ActionButton variant="primary" onClick={() => setEditing({ record_type: meta.defaultType })}>
          {meta.button}
        </ActionButton>
      </section>

      <section className="grid three">
        {summary.map((item) => (
          <div className="panel-card" key={item.label}>
            <span className="card-subtitle">{item.label}</span>
            <div className="metric-value">{item.value}</div>
          </div>
        ))}
      </section>

      {editing !== null ? (
        <SiteForm
          defaultRecordType={meta.defaultType}
          initialValues={editing.id ? editing : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <section className="panel-card">
        <div className="section-heading">
          <h2>{meta.title}台账</h2>
          <span>当前列表仅展示与本二级菜单对应的现场记录。</span>
        </div>
        <DataTable
          columns={[
            { key: "project_name", title: "项目名称" },
            { key: "record_type", title: "记录类型", render: (value) => typeLabels[value] || value },
            { key: "title", title: "标题" },
            { key: "vendor_or_team", title: "供应商 / 班组" },
            { key: "planned_date", title: "计划日期", render: (value) => formatDate(value) },
            { key: "amount", title: "金额", render: (value) => formatCurrency(value) },
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
