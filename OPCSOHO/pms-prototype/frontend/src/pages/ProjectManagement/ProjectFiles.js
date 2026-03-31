import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ActionButton from "../../components/Common/ActionButton";
import DataTable from "../../components/Common/DataTable";
import { AppContext } from "../../context/AppContext";
import { fetchProjectDetail, validateProjectDocuments } from "../../api/projectAPI";
import { formatDate } from "../../utils/formatters";

const requiredDocMap = {
  CONTRACT: "合同文件",
  SAFETY_DISCLOSURE: "安全交底",
  ACCEPTANCE_FORM: "验收表单"
};

export default function ProjectFiles() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showError } = useContext(AppContext);
  const [detail, setDetail] = useState(null);
  const [validation, setValidation] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [detailData, validationData] = await Promise.all([
          fetchProjectDetail(id),
          validateProjectDocuments(id)
        ]);
        setDetail(detailData);
        setValidation(validationData);
      } catch (error) {
        showError("文件校验页加载失败", error);
      }
    };

    loadData();
  }, [id, showError]);

  const statusRows = useMemo(() => {
    if (!validation) return [];

    return validation.required.map((type) => ({
      id: type,
      name: requiredDocMap[type] || type,
      status: validation.uploaded.includes(type)
        ? "已上传"
        : validation.missing.includes(type)
          ? "缺失"
          : "待检查"
    }));
  }, [validation]);

  if (!detail || !validation) {
    return (
      <div className="grid">
        <section className="hero-band">
          <div>
            <h1 className="page-title">文件校验页</h1>
            <p className="page-subtitle">正在加载文件校验数据...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">文件校验页</h1>
          <p className="page-subtitle">项目：{detail.project.name}（{detail.project.project_code}）</p>
        </div>
        <div className="hero-actions">
          <ActionButton onClick={() => navigate(`/projects/${id}/detail`)}>返回项目详情</ActionButton>
          <ActionButton variant="primary" onClick={() => navigate("/projects")}>返回项目台账</ActionButton>
        </div>
      </section>

      <div className={`notice ${validation.ready ? "success" : "warning"}`}>
        {validation.ready
          ? "当前项目已满足结算和下一流程的前置文件要求。"
          : `当前项目仍缺少：${validation.missing.map((item) => requiredDocMap[item] || item).join("、")}`}
      </div>

      <section className="grid three">
        {statusRows.map((item) => (
          <div className="panel-card file-status-card" key={item.id}>
            <span className="card-subtitle">{item.name}</span>
            <div className={`file-status-text ${item.status === "缺失" ? "danger" : "success"}`}>{item.status}</div>
          </div>
        ))}
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <h2>已上传文件</h2>
          <span>查看当前项目的文件清单、上传人和上传时间</span>
        </div>
        <DataTable
          columns={[
            { key: "doc_type", title: "文件类型", render: (value) => requiredDocMap[value] || value },
            { key: "file_name", title: "文件名" },
            { key: "uploaded_by", title: "上传人" },
            { key: "uploaded_at", title: "上传时间", render: (value) => formatDate(value) },
            { key: "is_required", title: "是否必检", render: (value) => (value ? "是" : "否") }
          ]}
          rows={detail.documents}
        />
      </section>
    </div>
  );
}
