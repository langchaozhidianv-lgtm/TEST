import React, { useEffect, useMemo, useState } from "react";
import FormCard from "../../components/Common/FormCard";
import ActionButton from "../../components/Common/ActionButton";
import { costCategories, costVersions } from "../../utils/constants";
import useProjectContractOptions from "../../hooks/useProjectContractOptions";

const emptyState = {
  project_id: "",
  contract_id: "",
  version_type: "BUDGET",
  cost_category: "MAIN_MATERIAL",
  amount: "",
  entry_date: "",
  source_ref: "",
  notes: ""
};

export default function CostForm({ initialValues, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyState);
  const { projectOptions, getContractsByProject } = useProjectContractOptions();

  useEffect(() => {
    setForm(() => {
      const next = initialValues ? { ...emptyState, ...initialValues } : { ...emptyState };
      if (!next.project_id && projectOptions[0]) {
        next.project_id = projectOptions[0].value;
      }
      return next;
    });
  }, [initialValues, projectOptions]);

  const contractOptions = useMemo(
    () => getContractsByProject(form.project_id).map((item) => ({
      value: String(item.id),
      label: `${item.contract_name}（${item.contract_code}）`
    })),
    [form.project_id, getContractsByProject]
  );

  useEffect(() => {
    if (form.contract_id && !contractOptions.some((item) => item.value === String(form.contract_id))) {
      setForm((prev) => ({ ...prev, contract_id: "" }));
    }
  }, [contractOptions, form.contract_id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "project_id" ? { contract_id: "" } : {})
    }));
  };

  return (
    <FormCard
      title={initialValues?.id ? "编辑成本" : "新建成本"}
      subtitle="仅展示项目与合同名称，系统会自动映射真实 ID。"
    >
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        <div className="form-grid">
          <label className="form-field">
            <span>所属项目</span>
            <select name="project_id" value={form.project_id} onChange={handleChange} required>
              <option value="">请选择项目</option>
              {projectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>所属合同</span>
            <select name="contract_id" value={form.contract_id || ""} onChange={handleChange}>
              <option value="">不关联具体合同</option>
              {contractOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="form-field"><span>版本类型</span><select name="version_type" value={form.version_type} onChange={handleChange}>{costVersions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="form-field"><span>成本科目</span><select name="cost_category" value={form.cost_category} onChange={handleChange}>{costCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="form-field"><span>金额</span><input name="amount" value={form.amount} onChange={handleChange} required /></label>
          <label className="form-field"><span>录入日期</span><input type="date" name="entry_date" value={form.entry_date || ""} onChange={handleChange} required /></label>
          <label className="form-field"><span>来源单号</span><input name="source_ref" value={form.source_ref} onChange={handleChange} /></label>
          <label className="form-field full"><span>备注</span><textarea name="notes" value={form.notes} rows="3" onChange={handleChange} /></label>
        </div>
        <div className="form-actions">
          <ActionButton variant="primary" type="submit">保存</ActionButton>
          <ActionButton type="button" onClick={onCancel}>取消</ActionButton>
        </div>
      </form>
    </FormCard>
  );
}
