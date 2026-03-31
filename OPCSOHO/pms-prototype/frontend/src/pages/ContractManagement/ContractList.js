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
import { formatCurrency } from "../../utils/formatters";
import { AppContext } from "../../context/AppContext";

const contractTypeLabels = {
  SALES: "销售合同",
  PROCUREMENT: "采购合同",
  LABOR: "劳务合同",
  CHANGE: "变更合同"
};

export default function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [editing, setEditing] = useState(null);
  const { showError } = useContext(AppContext);

  const loadData = async () => {
    try {
      setContracts(await fetchContracts());
    } catch (error) {
      setContracts([]);
      showError("合同数据加载失败", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (payload) => {
    try {
      if (editing?.id) {
        await updateContract(editing.id, payload);
      } else {
        await createContract(payload);
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
    const sumByType = (type) =>
      contracts
        .filter((item) => item.contract_type === type)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return [
      { label: "合同数量", value: contracts.length },
      { label: "销售合同额", value: formatCurrency(sumByType("SALES")) },
      { label: "采购合同额", value: formatCurrency(sumByType("PROCUREMENT")) },
      { label: "劳务合同额", value: formatCurrency(sumByType("LABOR")) }
    ];
  }, [contracts]);

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">合同履约</h1>
          <p className="page-subtitle">
            统一维护销售、采购、劳务与变更合同，支持直接新建、编辑和删除。
          </p>
        </div>
        <ActionButton variant="primary" onClick={() => setEditing({})}>新建合同</ActionButton>
      </section>

      <section className="grid four">
        {summary.map((item) => (
          <div className="panel-card" key={item.label}>
            <span className="card-subtitle">{item.label}</span>
            <div className="metric-value">{item.value}</div>
          </div>
        ))}
      </section>

      {editing !== null ? (
        <ContractForm
          initialValues={editing.id ? editing : null}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <section className="panel-card">
        <div className="section-heading">
          <h2>合同履约台账</h2>
          <span>按项目、合同类型和状态统一管理</span>
        </div>
        <DataTable
          columns={[
            { key: "contract_code", title: "合同编号" },
            { key: "project_name", title: "所属项目" },
            { key: "contract_type", title: "合同类型", render: (value) => contractTypeLabels[value] || value },
            { key: "contract_name", title: "合同名称" },
            { key: "counterparty_name", title: "对方单位" },
            { key: "amount", title: "合同金额", render: (value) => formatCurrency(value) },
            { key: "tax_rate", title: "税率" },
            { key: "status", title: "状态", render: (value) => <StatusBadge value={value} /> }
          ]}
          rows={contracts}
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
