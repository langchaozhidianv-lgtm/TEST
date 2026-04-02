import React, { useEffect, useMemo, useState } from "react";
import FormCard from "../../components/Common/FormCard";
import ActionButton from "../../components/Common/ActionButton";
import FieldLabel from "../../components/Common/FieldLabel";
import { contractTypes } from "../../utils/constants";
import useProjectContractOptions from "../../hooks/useProjectContractOptions";
import { buildChangeContractPaymentTerms, getChangeContractViewModel } from "../../utils/changeContract";
import { formatCurrency, formatDate, formatPercent } from "../../utils/formatters";

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
  collection_stages: "",
  actual_collection_amount: "0",
  actual_payment_amount: "0",
  signed_date: "",
  status: "APPROVED",
  related_contract_id: "",
  change_fields_text: "",
  before_amount: "",
  after_amount: "",
  change_reason: "",
  detail_note: ""
};

function calculateProgress(amount, actualAmount) {
  const total = Number(amount || 0);

  if (total <= 0) {
    return 0;
  }

  return (Number(actualAmount || 0) / total) * 100;
}

export default function ContractForm({ initialValues, defaultContractType = "SALES", onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyState);
  const { contracts, projectOptions } = useProjectContractOptions();
  const isChangeContract = form.contract_type === "CHANGE";
  const isSalesContract = form.contract_type === "SALES";

  useEffect(() => {
    setForm(() => {
      const next = initialValues
        ? { ...emptyState, contract_type: defaultContractType, ...initialValues }
        : { ...emptyState, contract_type: defaultContractType };

      if (next.contract_type === "CHANGE") {
        const changeMeta = getChangeContractViewModel(next);
        next.related_contract_id = changeMeta.relatedContractId;
        next.change_fields_text = changeMeta.changeFieldsText;
        next.before_amount = changeMeta.beforeAmount;
        next.after_amount = changeMeta.afterAmount;
        next.change_reason = changeMeta.changeReason;
        next.detail_note = changeMeta.detailNote;
      }

      if (!next.project_id && projectOptions[0]) {
        next.project_id = projectOptions[0].value;
      }

      return next;
    });
  }, [defaultContractType, initialValues, projectOptions]);

  const projectLabelMap = useMemo(
    () =>
      projectOptions.reduce((acc, item) => {
        acc[item.value] = item.label;
        return acc;
      }, {}),
    [projectOptions]
  );

  const relatedContractOptions = useMemo(() => {
    const sourceContracts = contracts.filter((item) => item.contract_type !== "CHANGE");

    return sourceContracts
      .slice()
      .sort((a, b) => {
        const aSameProject = String(a.project_id) === String(form.project_id) ? 0 : 1;
        const bSameProject = String(b.project_id) === String(form.project_id) ? 0 : 1;

        if (aSameProject !== bSameProject) {
          return aSameProject - bSameProject;
        }

        return String(a.contract_code || "").localeCompare(String(b.contract_code || ""), "zh-CN");
      });
  }, [contracts, form.project_id]);

  const selectedRelatedContract = useMemo(
    () => relatedContractOptions.find((item) => String(item.id) === String(form.related_contract_id)) || null,
    [form.related_contract_id, relatedContractOptions]
  );

  const primaryActualAmount = isSalesContract
    ? form.actual_collection_amount
    : form.actual_payment_amount;
  const primaryProgress = calculateProgress(form.amount, primaryActualAmount);

  const syncChangeAmount = (next) => {
    const beforeAmount = Number(next.before_amount);
    const afterAmount = Number(next.after_amount);

    if (
      next.before_amount !== "" &&
      next.after_amount !== "" &&
      !Number.isNaN(beforeAmount) &&
      !Number.isNaN(afterAmount)
    ) {
      next.amount = String(afterAmount - beforeAmount);
    }

    return next;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (prev.contract_type === "CHANGE" && name === "related_contract_id") {
        const selected = relatedContractOptions.find((item) => String(item.id) === String(value));

        if (selected) {
          next.project_id = String(selected.project_id || "");
          next.before_amount = String(selected.amount ?? "");
          if (!next.after_amount) {
            next.after_amount = String(selected.amount ?? "");
          }
          if (!prev.counterparty_name) {
            next.counterparty_name = selected.counterparty_name || "";
          }
        } else {
          next.before_amount = "";
        }

        return syncChangeAmount(next);
      }

      if (prev.contract_type === "CHANGE" && name === "project_id" && !prev.related_contract_id) {
        return next;
      }

      if (prev.contract_type === "CHANGE" && (name === "before_amount" || name === "after_amount")) {
        return syncChangeAmount(next);
      }

      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = { ...form };

    if (payload.contract_type === "CHANGE") {
      syncChangeAmount(payload);
      payload.payment_terms = buildChangeContractPaymentTerms({
        relatedContractId: payload.related_contract_id,
        changeFields: payload.change_fields_text,
        beforeAmount: payload.before_amount,
        afterAmount: payload.after_amount,
        changeReason: payload.change_reason,
        detailNote: payload.detail_note
      });
    }

    delete payload.related_contract_id;
    delete payload.change_fields_text;
    delete payload.before_amount;
    delete payload.after_amount;
    delete payload.change_reason;
    delete payload.detail_note;

    onSubmit(payload);
  };

  return (
    <FormCard
      title={initialValues?.id ? `编辑${contractTypeLabels[defaultContractType]}` : `新建${contractTypeLabels[defaultContractType]}`}
      subtitle={
        isChangeContract
          ? "关联原合同可以从全部非变更合同中选择，同项目合同会优先排在前面。"
          : "带 * 的字段为必填项。销售合同侧重收款过程，采购和劳务合同侧重付款过程。"
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <FieldLabel required>所属项目</FieldLabel>
            <select name="project_id" value={form.project_id} onChange={handleChange} required>
              <option value="">请选择项目</option>
              {projectOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <FieldLabel required>合同编号</FieldLabel>
            <input name="contract_code" value={form.contract_code} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <FieldLabel required>合同类型</FieldLabel>
            <select name="contract_type" value={form.contract_type} onChange={handleChange}>
              {contractTypes.map((item) => (
                <option key={item} value={item}>{contractTypeLabels[item] || item}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <FieldLabel required>{isChangeContract ? "变更名称" : "合同名称"}</FieldLabel>
            <input
              name="contract_name"
              value={form.contract_name}
              onChange={handleChange}
              placeholder={isChangeContract ? "例如：一期设备增补协议" : undefined}
              required
            />
          </label>

          <label className="form-field">
            <FieldLabel required>对方单位</FieldLabel>
            <input name="counterparty_name" value={form.counterparty_name} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <FieldLabel required>{isChangeContract ? "变更金额" : "合同金额"}</FieldLabel>
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder={isChangeContract ? "可直接填写，或由前后金额自动计算" : undefined}
              required
            />
          </label>

          {isChangeContract ? (
            <>
              <label className="form-field">
                <FieldLabel>关联原合同</FieldLabel>
                <select name="related_contract_id" value={form.related_contract_id} onChange={handleChange}>
                  <option value="">请选择原合同</option>
                  {relatedContractOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.contract_name} ({item.contract_code}) / {projectLabelMap[String(item.project_id)] || `项目 ${item.project_id}`}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <FieldLabel>变更前金额</FieldLabel>
                <input name="before_amount" value={form.before_amount} onChange={handleChange} />
              </label>

              <label className="form-field">
                <FieldLabel>变更后金额</FieldLabel>
                <input name="after_amount" value={form.after_amount} onChange={handleChange} />
              </label>

              {selectedRelatedContract ? (
                <div className="form-field full">
                  <FieldLabel>变更前信息</FieldLabel>
                  <div className="panel-card">
                    <div className="grid three">
                      <div>
                        <div className="card-subtitle">所属项目</div>
                        <div>{projectLabelMap[String(selectedRelatedContract.project_id)] || "-"}</div>
                      </div>
                      <div>
                        <div className="card-subtitle">原合同</div>
                        <div>{selectedRelatedContract.contract_name}</div>
                      </div>
                      <div>
                        <div className="card-subtitle">合同编号</div>
                        <div>{selectedRelatedContract.contract_code || "-"}</div>
                      </div>
                      <div>
                        <div className="card-subtitle">合同类型</div>
                        <div>{contractTypeLabels[selectedRelatedContract.contract_type] || selectedRelatedContract.contract_type}</div>
                      </div>
                      <div>
                        <div className="card-subtitle">对方单位</div>
                        <div>{selectedRelatedContract.counterparty_name || "-"}</div>
                      </div>
                      <div>
                        <div className="card-subtitle">当前合同金额</div>
                        <div>{formatCurrency(selectedRelatedContract.amount || 0)}</div>
                      </div>
                      <div>
                        <div className="card-subtitle">签订日期</div>
                        <div>{formatDate(selectedRelatedContract.signed_date)}</div>
                      </div>
                      <div>
                        <div className="card-subtitle">状态</div>
                        <div>{selectedRelatedContract.status || "-"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <label className="form-field">
            <FieldLabel>税率</FieldLabel>
            <input name="tax_rate" value={form.tax_rate} onChange={handleChange} />
          </label>

          <label className="form-field">
            <FieldLabel>签订日期</FieldLabel>
            <input type="date" name="signed_date" value={form.signed_date || ""} onChange={handleChange} />
          </label>

          <label className="form-field">
            <FieldLabel>{isSalesContract ? "实际收款金额" : "实际付款金额"}</FieldLabel>
            <input
              name={isSalesContract ? "actual_collection_amount" : "actual_payment_amount"}
              value={isSalesContract ? (form.actual_collection_amount || "0") : (form.actual_payment_amount || "0")}
              disabled
              readOnly
            />
          </label>

          <label className="form-field">
            <FieldLabel>{isSalesContract ? "收款百分比" : "付款百分比"}</FieldLabel>
            <input value={formatPercent(primaryProgress)} disabled readOnly />
          </label>

          <label className="form-field full">
            <FieldLabel>{isChangeContract ? "补充说明" : "付款/收款条款"}</FieldLabel>
            <textarea
              name={isChangeContract ? "detail_note" : "payment_terms"}
              value={isChangeContract ? form.detail_note : form.payment_terms}
              rows="3"
              onChange={handleChange}
              placeholder={isChangeContract ? "补充描述审批意见、附件说明或现场情况" : undefined}
            />
          </label>

          {isChangeContract ? (
            <>
              <label className="form-field full">
                <FieldLabel required>本次变更内容</FieldLabel>
                <textarea
                  name="change_fields_text"
                  value={form.change_fields_text}
                  rows="3"
                  onChange={handleChange}
                  placeholder="每行一个变更项，例如：合同金额、供货范围、完工日期"
                  required
                />
              </label>

              <label className="form-field full">
                <FieldLabel>变更原因/依据</FieldLabel>
                <textarea
                  name="change_reason"
                  value={form.change_reason}
                  rows="3"
                  onChange={handleChange}
                  placeholder="例如：客户新增设备需求，现场荷载条件变化"
                />
              </label>
            </>
          ) : null}

          {!isChangeContract && form.contract_type === "SALES" ? (
            <label className="form-field full">
              <FieldLabel>收款阶段</FieldLabel>
              <textarea
                name="collection_stages"
                value={form.collection_stages}
                rows="3"
                onChange={handleChange}
                placeholder="每行一个阶段，例如：预付款、发货款、验收款、质保金"
              />
            </label>
          ) : null}

          <label className="form-field">
            <FieldLabel>状态</FieldLabel>
            <input name="status" value={form.status} onChange={handleChange} />
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
