import React, { useEffect, useMemo, useState } from "react";
import FormCard from "../../components/Common/FormCard";
import ActionButton from "../../components/Common/ActionButton";
import { financeTypes } from "../../utils/constants";
import useProjectContractOptions from "../../hooks/useProjectContractOptions";

const emptyState = {
  project_id: "",
  contract_id: "",
  transaction_type: "PAYMENT_REQUEST",
  direction: "EXPENSE",
  amount: "",
  due_date: "",
  transaction_date: "",
  status: "PENDING",
  vendor_name: "",
  applicant: "",
  notes: ""
};

export default function FinanceForm({ initialValues, onSubmit, onCancel }) {
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
      title={initialValues?.id ? "编辑财务事项" : "新建财务事项"}
      subtitle="项目和合同仅展示业务名称，提交时自动映射真实 ID。"
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
          <label className="form-field"><span>交易类型</span><select name="transaction_type" value={form.transaction_type} onChange={handleChange}>{financeTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="form-field"><span>收支方向</span><select name="direction" value={form.direction} onChange={handleChange}><option value="INCOME">收入</option><option value="EXPENSE">支出</option></select></label>
          <label className="form-field"><span>金额</span><input name="amount" value={form.amount} onChange={handleChange} required /></label>
          <label className="form-field"><span>到期日期</span><input type="date" name="due_date" value={form.due_date || ""} onChange={handleChange} /></label>
          <label className="form-field"><span>发生日期</span><input type="date" name="transaction_date" value={form.transaction_date || ""} onChange={handleChange} /></label>
          <label className="form-field"><span>状态</span><input name="status" value={form.status} onChange={handleChange} /></label>
          <label className="form-field"><span>往来单位</span><input name="vendor_name" value={form.vendor_name} onChange={handleChange} /></label>
          <label className="form-field"><span>申请人</span><input name="applicant" value={form.applicant} onChange={handleChange} /></label>
          <label className="form-field full"><span>备注</span><textarea name="notes" rows="3" value={form.notes} onChange={handleChange} /></label>
        </div>
        <div className="form-actions">
          <ActionButton variant="primary" type="submit">保存</ActionButton>
          <ActionButton type="button" onClick={onCancel}>取消</ActionButton>
        </div>
      </form>
    </FormCard>
  );
}
