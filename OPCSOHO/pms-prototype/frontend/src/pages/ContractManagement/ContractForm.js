import React, { useEffect, useState } from "react";
import FormCard from "../../components/Common/FormCard";
import ActionButton from "../../components/Common/ActionButton";
import { contractTypes } from "../../utils/constants";
import useProjectContractOptions from "../../hooks/useProjectContractOptions";

const contractTypeLabels = {
  SALES: "销售合同",
  PROCUREMENT: "采购合同",
  LABOR: "劳务合同",
  CHANGE: "变更合同"
};

const emptyState = {
  project_id: "",
  contract_code: "",
  contract_type: "SALES",
  contract_name: "",
  counterparty_name: "",
  amount: "",
  tax_rate: "13",
  payment_terms: "",
  signed_date: "",
  status: "APPROVED"
};

export default function ContractForm({ initialValues, onSubmit, onCancel }) {
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
      title={initialValues?.id ? "编辑合同" : "新建合同"}
      subtitle="表单只展示项目名称，提交时系统会自动带出真实项目 ID。"
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
            <span>合同编号</span>
            <input name="contract_code" value={form.contract_code} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <span>合同类型</span>
            <select name="contract_type" value={form.contract_type} onChange={handleChange}>
              {contractTypes.map((item) => (
                <option key={item} value={item}>{contractTypeLabels[item] || item}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>合同名称</span>
            <input name="contract_name" value={form.contract_name} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <span>对方单位</span>
            <input name="counterparty_name" value={form.counterparty_name} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <span>合同金额</span>
            <input name="amount" value={form.amount} onChange={handleChange} required />
          </label>
          <label className="form-field">
            <span>税率</span>
            <input name="tax_rate" value={form.tax_rate} onChange={handleChange} />
          </label>
          <label className="form-field">
            <span>签订日期</span>
            <input type="date" name="signed_date" value={form.signed_date || ""} onChange={handleChange} />
          </label>
          <label className="form-field full">
            <span>付款条款</span>
            <textarea name="payment_terms" value={form.payment_terms} rows="3" onChange={handleChange} />
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
