import React, { useContext, useEffect, useMemo, useState } from "react";
import DataTable from "../../components/Common/DataTable";
import ActionButton from "../../components/Common/ActionButton";
import StatusBadge from "../../components/Common/StatusBadge";
import ContractForm from "./ContractForm";
import {
  createContract,
  deleteContract,
  fetchContracts,
  updateContract
} from "../../api/contractAPI";
import { formatCurrency, formatPercent } from "../../utils/formatters";
import { AppContext } from "../../context/AppContext";
import useProjectContractOptions from "../../hooks/useProjectContractOptions";
import { getChangeContractViewModel } from "../../utils/changeContract";

const contractTypeLabels = {
  SALES: "销售合同",
  PROCUREMENT: "采购合同",
  LABOR: "劳务合同",
  CHANGE: "变更合同"
};

const contractViewMeta = {
  SALES: {
    title: "销售合同",
    subtitle: "维护销售合同台账、收款阶段与履约状态。",
    button: "新建销售合同"
  },
  PROCUREMENT: {
    title: "采购合同",
    subtitle: "统一管理供应商采购合同、付款条款和执行状态。",
    button: "新建采购合同"
  },
  LABOR: {
    title: "劳务合同",
    subtitle: "维护劳务分包合同、班组单位和履约记录。",
    button: "新建劳务合同"
  },
  CHANGE: {
    title: "变更合同",
    subtitle: "直接展示本次变更改了什么、金额前后如何变化。",
    button: "新建变更合同"
  }
};

function renderTextBlock(primary, secondary) {
  return (
    <div>
      <div>{primary || "-"}</div>
      {secondary ? <div className="card-subtitle">{secondary}</div> : null}
    </div>
  );
}

function calculateProgress(amount, actualAmount) {
  const total = Number(amount || 0);

  if (total <= 0) {
    return 0;
  }

  return (Number(actualAmount || 0) / total) * 100;
}

function getPrimaryActualAmount(contractType, item) {
  return contractType === "SALES"
    ? Number(item.actual_collection_amount || 0)
    : Number(item.actual_payment_amount || 0);
}

function getPrimaryActualLabel(contractType) {
  return contractType === "SALES" ? "累计实收" : "累计实付";
}

function getPrimaryProgressLabel(contractType) {
  return contractType === "SALES" ? "平均收款率" : "平均付款率";
}

function getPrimaryProgressColumn(contractType) {
  return contractType === "SALES"
    ? { key: "collection_rate", title: "收款百分比" }
    : { key: "payment_rate", title: "付款百分比" };
}

export default function ContractList({ contractType = "SALES" }) {
  const [contracts, setContracts] = useState([]);
  const [editing, setEditing] = useState(null);
  const { showError } = useContext(AppContext);
  const { contracts: allContracts } = useProjectContractOptions();

  const meta = contractViewMeta[contractType] || contractViewMeta.SALES;

  const contractLookup = useMemo(
    () =>
      allContracts.reduce((acc, item) => {
        acc[String(item.id)] = item;
        return acc;
      }, {}),
    [allContracts]
  );

  const loadData = async () => {
    try {
      const rows = await fetchContracts();
      setContracts(rows.filter((item) => item.contract_type === contractType));
    } catch (error) {
      setContracts([]);
      showError("合同数据加载失败", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [contractType]);

  const handleSubmit = async (payload) => {
    try {
      const nextPayload = { ...payload, contract_type: payload.contract_type || contractType };
      if (editing?.id) {
        await updateContract(editing.id, nextPayload);
      } else {
        await createContract(nextPayload);
      }
      setEditing(null);
      loadData();
    } catch (error) {
      showError("合同保存失败", error);
    }
  };

  const handleDelete = async (row) => {
    try {
      await deleteContract(row.id);
      loadData();
    } catch (error) {
      showError("合同删除失败", error);
    }
  };

  const summary = useMemo(() => {
    const totalAmount = contracts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const primaryActualAmount = contracts.reduce(
      (sum, item) => sum + getPrimaryActualAmount(contractType, item),
      0
    );
    const approvedCount = contracts.filter((item) => item.status === "APPROVED").length;
    const activeCount = contracts.filter((item) => ["EXECUTING", "COMPLETED"].includes(item.status)).length;

    return [
      { label: "合同数量", value: contracts.length },
      { label: contractType === "CHANGE" ? "变更总额" : "合同总额", value: formatCurrency(totalAmount) },
      { label: getPrimaryActualLabel(contractType), value: formatCurrency(primaryActualAmount) },
      {
        label: getPrimaryProgressLabel(contractType),
        value: formatPercent(calculateProgress(totalAmount, primaryActualAmount))
      },
      { label: "审批/执行中", value: approvedCount + activeCount }
    ];
  }, [contractType, contracts]);

  const tableRows = useMemo(
    () =>
      contracts.map((item) => {
        if (item.contract_type === "CHANGE") {
          const changeMeta = getChangeContractViewModel(item);
          const relatedContract = contractLookup[changeMeta.relatedContractId];

          return {
            ...item,
            change_fields_text: changeMeta.changeFieldsText,
            before_amount: changeMeta.beforeAmount,
            after_amount: changeMeta.afterAmount,
            change_reason: changeMeta.changeReason,
            detail_note: changeMeta.detailNote,
            related_contract_label: relatedContract
              ? `${relatedContract.contract_name} (${relatedContract.contract_code})`
              : changeMeta.relatedContractId
                ? `原合同#${changeMeta.relatedContractId}`
                : "-"
          };
        }

        return {
          ...item,
          collection_rate: calculateProgress(item.amount, item.actual_collection_amount),
          payment_rate: calculateProgress(item.amount, item.actual_payment_amount)
        };
      }),
    [contractLookup, contracts]
  );

  const columns = contractType === "CHANGE"
    ? [
        { key: "contract_code", title: "变更编号" },
        { key: "project_name", title: "所属项目" },
        { key: "related_contract_label", title: "原合同" },
        { key: "contract_name", title: "变更名称" },
        {
          key: "change_fields_text",
          title: "变更内容",
          render: (value, row) => renderTextBlock(value || "-", row.detail_note || "")
        },
        {
          key: "before_amount",
          title: "变更前金额",
          render: (value) => (value === "" || value === null || value === undefined ? "-" : formatCurrency(value))
        },
        {
          key: "after_amount",
          title: "变更后金额",
          render: (value) => (value === "" || value === null || value === undefined ? "-" : formatCurrency(value))
        },
        { key: "amount", title: "变更金额", render: (value) => formatCurrency(value) },
        { key: "change_reason", title: "变更原因/依据", render: (value) => value || "-" },
        { key: "status", title: "状态", render: (value) => <StatusBadge value={value} /> }
      ]
    : [
        { key: "contract_code", title: "合同编号" },
        { key: "project_name", title: "所属项目" },
        { key: "contract_type", title: "合同类型", render: (value) => contractTypeLabels[value] || value },
        { key: "contract_name", title: "合同名称" },
        { key: "counterparty_name", title: "对方单位" },
        { key: "amount", title: "合同金额", render: (value) => formatCurrency(value) },
        ...(contractType === "SALES"
          ? [
              { key: "actual_collection_amount", title: "实际收款金额", render: (value) => formatCurrency(value) },
              {
                ...getPrimaryProgressColumn(contractType),
                render: (value) => formatPercent(value)
              }
            ]
          : [
              { key: "actual_payment_amount", title: "实际付款金额", render: (value) => formatCurrency(value) },
              {
                ...getPrimaryProgressColumn(contractType),
                render: (value) => formatPercent(value)
              }
            ]),
        { key: "status", title: "状态", render: (value) => <StatusBadge value={value} /> }
      ];

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">{meta.title}</h1>
          <p className="page-subtitle">{meta.subtitle}</p>
        </div>
        <ActionButton variant="primary" onClick={() => setEditing({ contract_type: contractType })}>
          {meta.button}
        </ActionButton>
      </section>

      <section className="grid five">
        {summary.map((item) => (
          <div className="panel-card" key={item.label}>
            <span className="card-subtitle">{item.label}</span>
            <div className="metric-value">{item.value}</div>
          </div>
        ))}
      </section>

      {editing !== null ? (
        <ContractForm
          defaultContractType={contractType}
          initialValues={editing.id ? editing : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <section className="panel-card">
        <div className="section-heading">
          <h2>{contractType === "CHANGE" ? "变更台账" : `${meta.title}台账`}</h2>
          <span>
            {contractType === "CHANGE"
              ? "每条变更直接展示原合同、变更项、前后金额和变更依据。"
              : contractType === "SALES"
                ? "按所属项目、合同金额、对方单位、实际收款金额和收款百分比统一管理。"
                : "按所属项目、合同金额、对方单位、实际付款金额和付款百分比统一管理。"}
          </span>
        </div>
        <DataTable
          columns={columns}
          rows={tableRows}
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
