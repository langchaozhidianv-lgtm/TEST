import React, { useContext, useEffect, useState } from "react";
import DataTable from "../../components/Common/DataTable";
import ActionButton from "../../components/Common/ActionButton";
import StatusBadge from "../../components/Common/StatusBadge";
import SiteForm from "../SiteManagement/SiteForm";
import {
  createSiteRecord,
  deleteSiteRecord,
  fetchSiteRecords,
  updateSiteRecord
} from "../../api/siteAPI";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { AppContext } from "../../context/AppContext";

const procurementTypes = ["PROCUREMENT", "SHIPPING", "MATERIAL"];
const typeLabels = {
  PROCUREMENT: "采购执行",
  SHIPPING: "发运记录",
  MATERIAL: "材料动态"
};

export default function ProcurementList() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("PROCUREMENT");
  const { showError } = useContext(AppContext);

  const loadData = async () => {
    try {
      const data = await fetchSiteRecords();
      setItems(
        data.filter(
          (item) => procurementTypes.includes(item.record_type) && (!filter || item.record_type === filter)
        )
      );
    } catch (error) {
      setItems([]);
      showError("采购数据加载失败", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

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
      showError("采购记录保存失败", error);
    }
  };

  const handleDelete = async (row) => {
    try {
      await deleteSiteRecord(row.id);
      loadData();
    } catch (error) {
      showError("采购记录删除失败", error);
    }
  };

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">采购执行</h1>
          <p className="page-subtitle">
            聚焦采购、发运和材料动态维护，顶部入口现在就是完整可编辑工作区。
          </p>
        </div>
        <ActionButton variant="primary" onClick={() => setEditing({ record_type: filter })}>
          新建记录
        </ActionButton>
      </section>

      <div className="toolbar">
        <div className="filters">
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="PROCUREMENT">采购执行</option>
            <option value="SHIPPING">发运记录</option>
            <option value="MATERIAL">材料动态</option>
          </select>
          <ActionButton onClick={loadData}>刷新</ActionButton>
        </div>
      </div>

      {editing !== null ? (
        <SiteForm
          initialValues={editing.id ? editing : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <section className="panel-card">
        <div className="section-heading">
          <h2>采购执行台账</h2>
          <span>按采购执行、发运记录和材料动态三类维护</span>
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
