import React, { useEffect, useMemo, useState } from "react";
import FormCard from "../../components/Common/FormCard";
import ActionButton from "../../components/Common/ActionButton";
import { costCategories, costVersions } from "../../utils/constants";
import useProjectContractOptions from "../../hooks/useProjectContractOptions";

const versionLabels = {
  SIGNED: "签约成本",
  BUDGET: "预算成本",
  ACTUAL: "实际成本"
};

const categoryLabels = {
  MAIN_MATERIAL: "主材",
  AUX_MATERIAL: "辅材",
  LABOR: "劳务",
  EXPENSE: "费用",
  SHIPPING: "运输",
  OTHER: "其他"
};

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

const materialState = {
  project_id: "",
  material_name: "",
  specification: "",
  quantity: "",
  unit: "",
  estimated_value: "",
  status: "REUSABLE",
  disposal_notes: ""
};

export default function CostForm({ initialValues, view = "VERSIONS", onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyState);
  const { projectOptions, getContractsByProject } = useProjectContractOptions();

  useEffect(() => {
    const base = view === "MATERIALS" ? materialState : emptyState;
    setForm(() => {
      const next = initialValues ? { ...base, ...initialValues } : { ...base };
      if (!next.project_id && projectOptions[0]) {
        next.project_id = projectOptions[0].value;
      }
      return next;
    });
  }, [initialValues, projectOptions, view]);

  const contractOptions = useMemo(
    () => getContractsByProject(form.project_id).map((item) => ({
      value: String(item.id),
      label: `${item.contract_name} (${item.contract_code})`
    })),
    [form.project_id, getContractsByProject]
  );

  useEffect(() => {
    if (view !== "MATERIALS" && form.contract_id && !contractOptions.some((item) => item.value === String(form.contract_id))) {
      setForm((prev) => ({ ...prev, contract_id: "" }));
    }
  }, [contractOptions, form.contract_id, view]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "project_id" ? { contract_id: "" } : {})
    }));
  };

  const isMaterialView = view === "MATERIALS";

  return (
    <FormCard
      title={
        isMaterialView
          ? (initialValues?.id ? "编辑剩余材料" : "新建剩余材料")
          : (initialValues?.id ? "编辑成本" : "新建成本")
      }
      subtitle={
        isMaterialView
          ? "用于维护项目剩余材料、估值和处置状态。"
          : "仅展示项目与合同名称，系统会自动映射真实 ID。"
      }
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

          {isMaterialView ? (
            <>
              <label className="form-field"><span>材料名称</span><input name="material_name" value={form.material_name || ""} onChange={handleChange} required /></label>
              <label className="form-field"><span>规格说明</span><input name="specification" value={form.specification || ""} onChange={handleChange} /></label>
              <label className="form-field"><span>数量</span><input name="quantity" value={form.quantity || ""} onChange={handleChange} /></label>
              <label className="form-field"><span>单位</span><input name="unit" value={form.unit || ""} onChange={handleChange} /></label>
              <label className="form-field"><span>估值</span><input name="estimated_value" value={form.estimated_value || ""} onChange={handleChange} /></label>
              <label className="form-field"><span>状态</span><input name="status" value={form.status || ""} onChange={handleChange} /></label>
              <label className="form-field full"><span>处置说明</span><textarea name="disposal_notes" rows="3" value={form.disposal_notes || ""} onChange={handleChange} /></label>
            </>
          ) : (
            <>
              <label className="form-field">
                <span>所属合同</span>
                <select name="contract_id" value={form.contract_id || ""} onChange={handleChange}>
                  <option value="">不关联具体合同</option>
                  {contractOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>版本类型</span>
                <select name="version_type" value={form.version_type} onChange={handleChange}>
                  {costVersions.map((item) => <option key={item} value={item}>{versionLabels[item] || item}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>成本科目</span>
                <select name="cost_category" value={form.cost_category} onChange={handleChange}>
                  {costCategories.map((item) => <option key={item} value={item}>{categoryLabels[item] || item}</option>)}
                </select>
              </label>
              <label className="form-field"><span>金额</span><input name="amount" value={form.amount} onChange={handleChange} required /></label>
              <label className="form-field"><span>录入日期</span><input type="date" name="entry_date" value={form.entry_date || ""} onChange={handleChange} required /></label>
              <label className="form-field"><span>来源单号</span><input name="source_ref" value={form.source_ref} onChange={handleChange} /></label>
              <label className="form-field full"><span>备注</span><textarea name="notes" value={form.notes} rows="3" onChange={handleChange} /></label>
            </>
          )}
        </div>
        <div className="form-actions">
          <ActionButton variant="primary" type="submit">保存</ActionButton>
          <ActionButton type="button" onClick={onCancel}>取消</ActionButton>
        </div>
      </form>
    </FormCard>
  );
}
