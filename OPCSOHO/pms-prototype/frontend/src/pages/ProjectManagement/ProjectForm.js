import React, { useEffect, useState } from "react";
import FormCard from "../../components/Common/FormCard";
import ActionButton from "../../components/Common/ActionButton";
import { projectStatuses, projectTypes } from "../../utils/constants";

const emptyState = {
  project_code: "",
  name: "",
  contract_no: "",
  project_type: "COLD_STORAGE",
  business_type: "EPC",
  customer_name: "",
  division_name: "",
  project_manager: "",
  status: "PLANNING",
  start_date: "",
  planned_end_date: "",
  contract_amount: "",
  shipped_amount: "",
  collected_amount: "",
  description: ""
};

const requiredFields = new Set([
  "name",
  "project_type",
  "customer_name",
  "division_name",
  "project_manager"
]);

const projectTypeLabelMap = {
  COLD_STORAGE: "冷库工程",
  BUILDING: "工业建筑",
  DOOR: "工业门系统",
  MATERIAL: "材料供应"
};

const projectStatusLabelMap = {
  PLANNING: "规划中",
  IN_PROGRESS: "执行中",
  DELAYED: "已延期",
  ACCEPTANCE: "验收中",
  WARRANTY: "质保中",
  CLOSED: "已完结"
};

function FieldLabel({ children, required = false }) {
  return (
    <span className="field-label">
      {children}
      {required ? <em className="required-mark">*</em> : null}
    </span>
  );
}

export default function ProjectForm({ initialValues, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyState);

  useEffect(() => {
    setForm(initialValues ? { ...emptyState, ...initialValues } : { ...emptyState });
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <FormCard
      title={initialValues?.id ? "编辑项目" : "新建项目"}
      subtitle="项目编号由系统按年份加 5 位流水自动生成，无需手工录入。"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
      >
        <div className="form-grid">
          <label className="form-field">
            <FieldLabel>项目编号</FieldLabel>
            <input
              name="project_code"
              value={form.project_code || ""}
              readOnly
              placeholder={initialValues?.id ? "" : "保存后自动生成，如 202600001"}
            />
          </label>
          <label className="form-field">
            <FieldLabel required={requiredFields.has("name")}>项目名称</FieldLabel>
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <FieldLabel>合同编号</FieldLabel>
            <input name="contract_no" value={form.contract_no} onChange={handleChange} />
          </label>
          <label className="form-field">
            <FieldLabel required={requiredFields.has("project_type")}>项目类型</FieldLabel>
            <select name="project_type" value={form.project_type} onChange={handleChange}>
              {projectTypes.map((item) => (
                <option key={item} value={item}>
                  {projectTypeLabelMap[item] || item}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <FieldLabel required={requiredFields.has("customer_name")}>客户</FieldLabel>
            <input name="customer_name" value={form.customer_name} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <FieldLabel required={requiredFields.has("division_name")}>事业部</FieldLabel>
            <input name="division_name" value={form.division_name} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <FieldLabel required={requiredFields.has("project_manager")}>项目经理</FieldLabel>
            <input name="project_manager" value={form.project_manager} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <FieldLabel>项目状态</FieldLabel>
            <select name="status" value={form.status} onChange={handleChange}>
              {projectStatuses.map((item) => (
                <option key={item} value={item}>
                  {projectStatusLabelMap[item] || item}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <FieldLabel>计划开工日期</FieldLabel>
            <input type="date" name="start_date" value={form.start_date || ""} onChange={handleChange} />
          </label>
          <label className="form-field">
            <FieldLabel>计划完工日期</FieldLabel>
            <input type="date" name="planned_end_date" value={form.planned_end_date || ""} onChange={handleChange} />
          </label>
          <label className="form-field">
            <FieldLabel>合同金额</FieldLabel>
            <input name="contract_amount" value={form.contract_amount} onChange={handleChange} />
          </label>
          <label className="form-field">
            <FieldLabel>已发运金额</FieldLabel>
            <input name="shipped_amount" value={form.shipped_amount} onChange={handleChange} />
          </label>
          <label className="form-field">
            <FieldLabel>已回款金额</FieldLabel>
            <input name="collected_amount" value={form.collected_amount} onChange={handleChange} />
          </label>
          <label className="form-field full">
            <FieldLabel>项目说明</FieldLabel>
            <textarea name="description" rows="4" value={form.description} onChange={handleChange} />
          </label>
        </div>
        <div className="form-actions">
          <ActionButton variant="primary" type="submit">
            保存
          </ActionButton>
          <ActionButton type="button" onClick={onCancel}>
            取消
          </ActionButton>
        </div>
      </form>
    </FormCard>
  );
}
