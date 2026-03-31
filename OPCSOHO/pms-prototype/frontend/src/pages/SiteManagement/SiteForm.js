import React, { useEffect, useState } from "react";
import FormCard from "../../components/Common/FormCard";
import ActionButton from "../../components/Common/ActionButton";
import { siteTypes } from "../../utils/constants";
import useProjectContractOptions from "../../hooks/useProjectContractOptions";

const siteTypeLabels = {
  PROCUREMENT: "采购执行",
  SHIPPING: "发运记录",
  MATERIAL: "材料动态",
  LABOR: "劳务管理",
  SAFETY: "安全检查",
  ACCEPTANCE: "验收记录"
};

const emptyState = {
  project_id: "",
  record_type: "PROCUREMENT",
  title: "",
  vendor_or_team: "",
  status: "PLANNING",
  planned_date: "",
  actual_date: "",
  amount: "",
  quantity: "",
  unit: "",
  details: ""
};

export default function SiteForm({ initialValues, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyState);
  const { projectOptions } = useProjectContractOptions();

  useEffect(() => {
    setForm(() => {
      const next = initialValues ? { ...emptyState, ...initialValues } : { ...emptyState };
      if (!next.project_id && projectOptions[0]) {
        next.project_id = projectOptions[0].value;
      }
      return next;
    });
  }, [initialValues, projectOptions]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  return (
    <FormCard
      title={initialValues?.id ? "编辑记录" : "新建记录"}
      subtitle="页面只展示项目名称，提交时系统会自动映射真实项目 ID。"
    >
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        <div className="form-grid">
          <label className="form-field">
            <span>所属项目</span>
            <select name="project_id" value={form.project_id} onChange={handleChange} required>
              <option value="">请选择项目</option>
              {projectOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>记录类型</span>
            <select name="record_type" value={form.record_type} onChange={handleChange}>
              {siteTypes.map((item) => (
                <option key={item} value={item}>{siteTypeLabels[item] || item}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>标题</span>
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <span>供应商 / 班组</span>
            <input name="vendor_or_team" value={form.vendor_or_team} onChange={handleChange} />
          </label>
          <label className="form-field">
            <span>状态</span>
            <input name="status" value={form.status} onChange={handleChange} />
          </label>
          <label className="form-field">
            <span>计划日期</span>
            <input type="date" name="planned_date" value={form.planned_date || ""} onChange={handleChange} />
          </label>
          <label className="form-field">
            <span>实际日期</span>
            <input type="date" name="actual_date" value={form.actual_date || ""} onChange={handleChange} />
          </label>
          <label className="form-field">
            <span>金额</span>
            <input name="amount" value={form.amount} onChange={handleChange} />
          </label>
          <label className="form-field">
            <span>数量</span>
            <input name="quantity" value={form.quantity} onChange={handleChange} />
          </label>
          <label className="form-field">
            <span>单位</span>
            <input name="unit" value={form.unit} onChange={handleChange} />
          </label>
          <label className="form-field full">
            <span>详细说明</span>
            <textarea name="details" rows="3" value={form.details} onChange={handleChange} />
          </label>
        </div>
        <div className="form-actions">
          <ActionButton variant="primary" type="submit">保存</ActionButton>
          <ActionButton type="button" onClick={onCancel}>取消</ActionButton>
        </div>
      </form>
    </FormCard>
  );
}
