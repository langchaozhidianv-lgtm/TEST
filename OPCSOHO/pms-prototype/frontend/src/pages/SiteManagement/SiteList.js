import React, { useContext, useEffect, useState } from "react";
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

export default function SiteList() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const { showError } = useContext(AppContext);

  const loadData = async () => {
    try {
      setItems(await fetchSiteRecords());
    } catch (error) {
      setItems([]);
      showError("现场数据加载失败", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (payload) => {
    try {
      if (editing?.id) {
        await updateSiteRecord(editing.id, payload);
      } else {
        await createSiteRecord(payload);
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

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">现场与劳务管理</h1>
          <p className="page-subtitle">
            跟踪劳务、安全、验收与现场执行记录，支撑施工阶段的过程管控。
          </p>
        </div>
        <ActionButton variant="primary" onClick={() => setEditing({})}>新建现场记录</ActionButton>
      </section>

      {editing !== null ? (
        <SiteForm
          initialValues={editing.id ? editing : null}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <section className="panel-card">
        <div className="section-heading">
          <h2>现场台账</h2>
          <span>统一查看采购、发运、劳务、安全和验收记录</span>
        </div>
        <DataTable
          columns={[
            { key: "project_name", title: "项目" },
            { key: "record_type", title: "记录类型", render: (value) => typeLabels[value] || value },
            { key: "title", title: "标题" },
            { key: "vendor_or_team", title: "供应商/班组" },
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
