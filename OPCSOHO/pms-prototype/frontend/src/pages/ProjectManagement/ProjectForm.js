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

export default function ProjectForm({ initialValues, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyState);

  useEffect(() => {
    setForm(initialValues ? { ...emptyState, ...initialValues } : emptyState);
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <FormCard
      title={initialValues?.id ? "编辑项目" : "新建项目"}
      subtitle="项目主数据是所有业务模块的统一索引。"
    >
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        <div className="form-grid">
          <label className="form-field"><span>项目编号</span><input name="project_code" value={form.project_code} onChange={handleChange} required /></label>
          <label className="form-field"><span>项目名称</span><input name="name" value={form.name} onChange={handleChange} required /></label>
          <label className="form-field"><span>合同编号</span><input name="contract_no" value={form.contract_no} onChange={handleChange} /></label>
          <label className="form-field"><span>项目类型</span><select name="project_type" value={form.project_type} onChange={handleChange}>{projectTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="form-field"><span>客户</span><input name="customer_name" value={form.customer_name} onChange={handleChange} required /></label>
          <label className="form-field"><span>事业部</span><input name="division_name" value={form.division_name} onChange={handleChange} required /></label>
          <label className="form-field"><span>项目经理</span><input name="project_manager" value={form.project_manager} onChange={handleChange} required /></label>
          <label className="form-field"><span>项目状态</span><select name="status" value={form.status} onChange={handleChange}>{projectStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="form-field"><span>计划开工日期</span><input type="date" name="start_date" value={form.start_date || ""} onChange={handleChange} /></label>
          <label className="form-field"><span>计划完工日期</span><input type="date" name="planned_end_date" value={form.planned_end_date || ""} onChange={handleChange} /></label>
          <label className="form-field"><span>合同金额</span><input name="contract_amount" value={form.contract_amount} onChange={handleChange} /></label>
          <label className="form-field"><span>已发运金额</span><input name="shipped_amount" value={form.shipped_amount} onChange={handleChange} /></label>
          <label className="form-field"><span>已回款金额</span><input name="collected_amount" value={form.collected_amount} onChange={handleChange} /></label>
          <label className="form-field full"><span>项目说明</span><textarea name="description" rows="4" value={form.description} onChange={handleChange} /></label>
        </div>
        <div className="form-actions">
          <ActionButton variant="primary" type="submit">保存</ActionButton>
          <ActionButton type="button" onClick={onCancel}>取消</ActionButton>
        </div>
      </form>
    </FormCard>
  );
}
