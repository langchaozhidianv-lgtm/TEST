import React, { useEffect, useMemo, useState } from "react";
import FormCard from "../../components/Common/FormCard";
import ActionButton from "../../components/Common/ActionButton";
import FieldLabel from "../../components/Common/FieldLabel";
import { financeTypes } from "../../utils/constants";
import useProjectContractOptions from "../../hooks/useProjectContractOptions";
import { parseContractStages } from "../../utils/contractStages";

const transactionTypeLabels = {
  COLLECTION_PLAN: "收款计划",
  COLLECTION: "收款记录",
  PAYMENT_PLAN: "付款计划",
  PAYMENT_REQUEST: "付款申请",
  REIMBURSEMENT: "报销",
  WAGE_DISBURSEMENT: "工资发放",
  PREPAYMENT: "预付款"
};

const financeViewTypes = {
  COLLECTIONS: ["COLLECTION_PLAN", "COLLECTION"],
  PAYMENTS: ["PAYMENT_PLAN", "PAYMENT_REQUEST", "PREPAYMENT"],
  REIMBURSEMENTS: ["REIMBURSEMENT"],
  WAGES: ["WAGE_DISBURSEMENT"],
  RISKS: financeTypes
};

const collectionStatusOptions = [
  { value: "PLANNED", label: "待收款" },
  { value: "APPROVED", label: "已确认" },
  { value: "PAID", label: "已收款" },
  { value: "OVERDUE", label: "已逾期" },
  { value: "BLOCKED", label: "已阻塞" }
];

const wageStatusOptions = [
  { value: "PENDING", label: "待财务复核" },
  { value: "APPROVED", label: "待发放" },
  { value: "PAID", label: "已发放" },
  { value: "COMPLETED", label: "已归档" },
  { value: "BLOCKED", label: "资料退回" }
];

const emptyState = {
  project_id: "",
  contract_id: "",
  transaction_type: "PAYMENT_REQUEST",
  direction: "EXPENSE",
  collection_stage: "",
  amount: "",
  due_date: "",
  transaction_date: "",
  status: "PENDING",
  vendor_name: "",
  applicant: "",
  notes: ""
};

function getCollectionDefaultStatus(transactionType) {
  return transactionType === "COLLECTION" ? "PAID" : "PLANNED";
}

function getAllowedContractTypes(view) {
  if (view === "COLLECTIONS") {
    return ["SALES", "CHANGE"];
  }

  if (view === "PAYMENTS") {
    return ["PROCUREMENT", "LABOR", "CHANGE"];
  }

  if (view === "WAGES") {
    return ["LABOR"];
  }

  return null;
}

function filterContractsForView(contracts, view) {
  const allowedTypes = getAllowedContractTypes(view);

  if (!allowedTypes) {
    return contracts;
  }

  return contracts.filter((item) => allowedTypes.includes(item.contract_type));
}

function normalizeMonthValue(value) {
  if (!value) {
    return "";
  }
  return String(value).slice(0, 7);
}

function normalizeMonthForSubmit(value) {
  if (!value) {
    return "";
  }
  return `${value}-01`;
}

export default function FinanceForm({ initialValues, defaultTransactionType = "PAYMENT_REQUEST", view = "PAYMENTS", onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyState);
  const { projectOptions, getContractsByProject } = useProjectContractOptions();
  const isCollectionView = view === "COLLECTIONS";
  const isWageView = view === "WAGES";

  useEffect(() => {
    setForm(() => {
      const next = initialValues
        ? { ...emptyState, transaction_type: defaultTransactionType, ...initialValues }
        : { ...emptyState, transaction_type: defaultTransactionType };

      if (isCollectionView) {
        next.transaction_type = next.transaction_type || defaultTransactionType || "COLLECTION";
        next.direction = "INCOME";
        next.status = next.status || getCollectionDefaultStatus(next.transaction_type);
      }

      if (isWageView) {
        next.transaction_type = "WAGE_DISBURSEMENT";
        next.direction = "EXPENSE";
        next.status = next.status || "PENDING";
        next.due_date = normalizeMonthValue(next.due_date);
      }

      const preferredProjectOption = projectOptions.find((option) => {
        const visibleContracts = filterContractsForView(
          getContractsByProject(option.value),
          view
        );
        return visibleContracts.length > 0;
      });

      if (!next.project_id) {
        next.project_id = preferredProjectOption?.value || projectOptions[0]?.value || "";
      }

      return next;
    });
  }, [initialValues, projectOptions, defaultTransactionType, isCollectionView, isWageView, getContractsByProject, view]);

  const contractOptions = useMemo(
    () =>
      filterContractsForView(getContractsByProject(form.project_id), view)
        .map((item) => ({
          value: String(item.id),
          label: `${item.contract_name} (${item.contract_code})`
        })),
    [form.project_id, getContractsByProject, view]
  );

  const typeOptions = financeViewTypes[view] || financeTypes;
  const selectedContract = useMemo(
    () =>
      filterContractsForView(getContractsByProject(form.project_id), view)
        .find((item) => String(item.id) === String(form.contract_id)) || null,
    [form.project_id, form.contract_id, getContractsByProject, view]
  );
  const collectionStageOptions = useMemo(
    () => parseContractStages(selectedContract?.collection_stages),
    [selectedContract]
  );

  useEffect(() => {
    if (form.contract_id && !contractOptions.some((item) => item.value === String(form.contract_id))) {
      setForm((prev) => ({ ...prev, contract_id: "", collection_stage: "" }));
    }
  }, [contractOptions, form.contract_id]);

  useEffect(() => {
    if (form.collection_stage && !collectionStageOptions.includes(form.collection_stage)) {
      setForm((prev) => ({ ...prev, collection_stage: "" }));
    }
  }, [collectionStageOptions, form.collection_stage]);

  useEffect(() => {
    if (initialValues?.id || form.contract_id || contractOptions.length === 0) {
      return;
    }

    if (isCollectionView || isWageView) {
      setForm((prev) => ({ ...prev, contract_id: contractOptions[0].value }));
    }
  }, [initialValues, form.contract_id, contractOptions, isCollectionView, isWageView]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(isCollectionView && name === "transaction_type"
        ? { status: getCollectionDefaultStatus(value) }
        : {}),
      ...(name === "project_id" ? { contract_id: "", collection_stage: "" } : {}),
      ...(name === "contract_id" ? { collection_stage: "" } : {}),
      ...(isCollectionView ? { direction: "INCOME" } : {}),
      ...(isWageView ? { direction: "EXPENSE", transaction_type: "WAGE_DISBURSEMENT" } : {})
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      transaction_type: isWageView ? "WAGE_DISBURSEMENT" : form.transaction_type,
      direction: isCollectionView ? "INCOME" : (isWageView ? "EXPENSE" : form.direction),
      due_date: isWageView ? normalizeMonthForSubmit(form.due_date) : form.due_date
    });
  };

  return (
    <FormCard
      title={
        isWageView
          ? (initialValues?.id ? "编辑劳务人员工资发放记录" : "新建劳务人员工资发放记录")
          : (initialValues?.id ? "编辑财务事项" : "新建财务事项")
      }
      subtitle={
        isCollectionView
          ? "收款管理中默认必须关联合同，收支方向固定为收入，并可关联合同收款阶段。"
          : isWageView
            ? "按项目经理上传工资发放记录的视角整理字段，提交后进入财务复核与发放流程。"
            : "项目和合同仅展示业务名称，提交时自动映射真实 ID。"
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <FieldLabel required>所属项目</FieldLabel>
            <select name="project_id" value={form.project_id} onChange={handleChange} required>
              <option value="">请选择项目</option>
              {projectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <label className="form-field">
            <FieldLabel required={isCollectionView}>{isWageView ? "对应劳务合同" : "所属合同"}</FieldLabel>
            <select
              name="contract_id"
              value={form.contract_id || ""}
              onChange={handleChange}
              required={isCollectionView}
            >
              <option value="">
                {isCollectionView
                  ? "请选择合同"
                  : isWageView
                    ? "可不关联具体劳务合同"
                    : "不关联合同"}
              </option>
              {contractOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          {isWageView ? null : (
            <>
              <label className="form-field">
                <FieldLabel required>交易类型</FieldLabel>
                <select name="transaction_type" value={form.transaction_type} onChange={handleChange}>
                  {typeOptions.map((item) => (
                    <option key={item} value={item}>{transactionTypeLabels[item] || item}</option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <FieldLabel required>收支方向</FieldLabel>
                <select name="direction" value={form.direction} onChange={handleChange} disabled={isCollectionView}>
                  <option value="INCOME">收入</option>
                  <option value="EXPENSE">支出</option>
                </select>
              </label>
            </>
          )}

          {isCollectionView ? (
            <label className="form-field">
              <FieldLabel required={Boolean(form.contract_id && collectionStageOptions.length)}>合同收款阶段</FieldLabel>
              <select
                name="collection_stage"
                value={form.collection_stage || ""}
                onChange={handleChange}
                disabled={!form.contract_id || collectionStageOptions.length === 0}
                required={Boolean(form.contract_id && collectionStageOptions.length)}
              >
                <option value="">
                  {!form.contract_id
                    ? "请先选择合同"
                    : collectionStageOptions.length
                      ? "请选择收款阶段"
                      : "该合同未配置收款阶段"}
                </option>
                {collectionStageOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="form-field">
            <FieldLabel required>{isWageView ? "发放总金额" : "金额"}</FieldLabel>
            <input name="amount" value={form.amount} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <FieldLabel>{isWageView ? "工资所属月份" : "到期日期"}</FieldLabel>
            <input type={isWageView ? "month" : "date"} name="due_date" value={form.due_date || ""} onChange={handleChange} />
          </label>

          <label className="form-field">
            <FieldLabel>{isWageView ? "项目经理上传日期" : "发生日期"}</FieldLabel>
            <input type="date" name="transaction_date" value={form.transaction_date || ""} onChange={handleChange} />
          </label>

          <label className="form-field">
            <FieldLabel required={isCollectionView || isWageView}>{isWageView ? "发放状态" : "状态"}</FieldLabel>
            {isCollectionView ? (
              <select name="status" value={form.status} onChange={handleChange}>
                {collectionStatusOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            ) : isWageView ? (
              <select name="status" value={form.status} onChange={handleChange}>
                {wageStatusOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            ) : (
              <input name="status" value={form.status} onChange={handleChange} />
            )}
          </label>

          <label className="form-field">
            <FieldLabel>{isWageView ? "劳务班组/劳务单位" : "往来单位"}</FieldLabel>
            <input name="vendor_name" value={form.vendor_name} onChange={handleChange} />
          </label>

          <label className="form-field">
            <FieldLabel>{isWageView ? "上传项目经理" : "申请人"}</FieldLabel>
            <input name="applicant" value={form.applicant} onChange={handleChange} />
          </label>

          <label className="form-field full">
            <FieldLabel>{isWageView ? "发放说明/备注" : "备注"}</FieldLabel>
            <textarea name="notes" rows="3" value={form.notes} onChange={handleChange} />
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
