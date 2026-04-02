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
            模块内保留采购执行、发运记录、材料动态三种切换，便于沿业务链路处理交付。
          </p>
        </div>
        <ActionButton variant="primary" onClick={() => setEditing({ record_type: filter })}>
          新建记录
        </ActionButton>
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <h2>模块内切换</h2>
          <span>采购执行暂保留页内切换，不纳入左侧全局二级菜单。</span>
        </div>
        <div className="module-switches">
          {procurementTypes.map((item) => (
            <button
              key={item}
              type="button"
              className={`module-switch ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
            >
              {typeLabels[item]}
            </button>
          ))}
          <ActionButton onClick={loadData}>刷新</ActionButton>
        </div>
      </section>

      {editing !== null ? (
        <SiteForm
          defaultRecordType={filter}
          initialValues={editing.id ? editing : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <section className="panel-card">
        <div className="section-heading">
          <h2>{typeLabels[filter]}台账</h2>
          <span>当前列表仅展示所选模块的数据。</span>
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
