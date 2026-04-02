import React, { useContext, useEffect, useMemo, useState } from "react";
import ActionButton from "../../components/Common/ActionButton";
import DataTable from "../../components/Common/DataTable";
import StatusBadge from "../../components/Common/StatusBadge";
import { AppContext } from "../../context/AppContext";
import { fetchProjects } from "../../api/projectAPI";
import { fetchTasks } from "../../api/taskAPI";
import {
  createCollaborationItem,
  deleteCollaborationItem,
  fetchCollaborationItems,
  updateCollaborationItem
} from "../../api/collaborationAPI";

const emptyItem = {
  id: "",
  project_id: "",
  task_id: "",
  team: "",
  topic: "",
  assignee: "",
  due_date: "",
  status: "PENDING",
  notes: "",
  attachments: []
};

function formatAttachmentNames(attachments = []) {
  return attachments.map((item) => item.file_name).join("，");
}

export default function CollaborationWorkspace() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(emptyItem);
  const [attachments, setAttachments] = useState([]);
  const { showError } = useContext(AppContext);

  const loadData = async () => {
    try {
      const [projectRows, taskRows, collabRows] = await Promise.all([
        fetchProjects(),
        fetchTasks(),
        fetchCollaborationItems()
      ]);
      setProjects(projectRows);
      setTasks(taskRows);
      setItems(collabRows);
    } catch (error) {
      showError("组织协同数据加载失败", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const projectTasks = useMemo(
    () => tasks.filter((item) => String(item.project_id) === String(editing.project_id)),
    [tasks, editing.project_id]
  );

  const saveItem = async () => {
    if (!editing.project_id || !editing.team || !editing.topic) {
      return;
    }

    try {
      const payload = { ...editing, attachments };
      if (editing.id) {
        await updateCollaborationItem(editing.id, payload);
      } else {
        await createCollaborationItem(payload);
      }
      setEditing(emptyItem);
      setAttachments([]);
      await loadData();
    } catch (error) {
      showError("组织协同保存失败", error);
    }
  };

  const handleEdit = (row) => {
    setEditing({
      id: row.id,
      project_id: String(row.project_id || ""),
      task_id: String(row.task_id || ""),
      team: row.team || "",
      topic: row.topic || "",
      assignee: row.assignee || "",
      due_date: row.due_date || "",
      status: row.status || "PENDING",
      notes: row.notes || "",
      attachments: row.attachments || []
    });
    setAttachments([]);
  };

  return (
    <div className="grid">
      <section className="hero-band">
        <div>
          <h1 className="page-title">组织协同</h1>
          <p className="page-subtitle">
            协同事项可以关联项目的具体任务，也允许在暂无任务时先按项目维度发起协同，并支持上传附件。
          </p>
        </div>
        <div className="hero-actions">
          <ActionButton variant="primary" onClick={saveItem}>保存协同事项</ActionButton>
        </div>
      </section>

      <section className="workspace-grid workspace-grid--collaboration">
        <article className="panel-card collaboration-editor-panel">
          <div className="section-heading">
            <h2>协同事项编辑区</h2>
            <span>项目为必填，任务改为可选；当项目还没有任务时，也可以先保存协同事项。</span>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>所属项目</span>
              <select
                value={editing.project_id}
                onChange={(event) =>
                  setEditing((prev) => ({ ...prev, project_id: event.target.value, task_id: "" }))
                }
              >
                <option value="">请选择项目</option>
                {projects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>关联任务（可选）</span>
              <select
                value={editing.task_id}
                onChange={(event) => setEditing((prev) => ({ ...prev, task_id: event.target.value }))}
              >
                <option value="">暂不关联任务</option>
                {projectTasks.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.phase} / {item.task_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>协同团队</span>
              <input value={editing.team} onChange={(event) => setEditing((prev) => ({ ...prev, team: event.target.value }))} />
            </label>
            <label className="form-field">
              <span>责任人</span>
              <input value={editing.assignee} onChange={(event) => setEditing((prev) => ({ ...prev, assignee: event.target.value }))} />
            </label>
            <label className="form-field full">
              <span>协同主题</span>
              <input value={editing.topic} onChange={(event) => setEditing((prev) => ({ ...prev, topic: event.target.value }))} />
            </label>
            <label className="form-field">
              <span>截止日期</span>
              <input type="date" value={editing.due_date || ""} onChange={(event) => setEditing((prev) => ({ ...prev, due_date: event.target.value }))} />
            </label>
            <label className="form-field">
              <span>状态</span>
              <select value={editing.status} onChange={(event) => setEditing((prev) => ({ ...prev, status: event.target.value }))}>
                <option value="PENDING">待处理</option>
                <option value="IN_PROGRESS">执行中</option>
                <option value="COMPLETED">已完成</option>
                <option value="DELAYED">已延期</option>
              </select>
            </label>
            <label className="form-field full">
              <span>附件上传</span>
              <input type="file" multiple onChange={(event) => setAttachments(Array.from(event.target.files || []))} />
              {attachments.length ? (
                <div style={{ marginTop: 8, color: "#6e87a5" }}>{attachments.map((file) => file.name).join("，")}</div>
              ) : null}
              {!attachments.length && editing.id && editing.attachments?.length ? (
                <div style={{ marginTop: 8, color: "#6e87a5" }}>{formatAttachmentNames(editing.attachments)}</div>
              ) : null}
            </label>
            <label className="form-field full">
              <span>协同说明</span>
              <textarea rows="4" value={editing.notes} onChange={(event) => setEditing((prev) => ({ ...prev, notes: event.target.value }))} />
            </label>
          </div>
          <div className="form-actions">
            <ActionButton variant="primary" onClick={saveItem}>
              {editing.id ? "更新事项" : "新增事项"}
            </ActionButton>
            <ActionButton onClick={() => {
              setEditing(emptyItem);
              setAttachments([]);
            }}>清空</ActionButton>
          </div>
        </article>

        <article className="panel-card collaboration-ledger-panel">
          <div className="section-heading">
            <h2>协同事项台账</h2>
            <span>围绕项目和任务追踪跨团队协同，并保留上传附件。</span>
          </div>
          <DataTable
            rowKey="id"
            columns={[
              { key: "project_name", title: "所属项目", width: "220px", minWidth: "220px", cellClassName: "cell-multiline" },
              {
                key: "task_name",
                title: "关联任务",
                width: "180px",
                minWidth: "180px",
                cellClassName: "cell-multiline",
                render: (value) => value || "未关联"
              },
              { key: "team", title: "协同团队", width: "140px", minWidth: "140px", cellClassName: "cell-multiline" },
              { key: "topic", title: "协同主题", width: "240px", minWidth: "240px", cellClassName: "cell-multiline" },
              { key: "assignee", title: "责任人", width: "96px", minWidth: "96px", cellClassName: "cell-nowrap" },
              { key: "due_date", title: "截止日期", width: "130px", minWidth: "130px", cellClassName: "cell-nowrap" },
              {
                key: "status",
                title: "状态",
                width: "96px",
                minWidth: "96px",
                cellClassName: "cell-nowrap",
                render: (value) => <StatusBadge value={value} />
              },
              {
                key: "attachments",
                title: "附件",
                width: "160px",
                minWidth: "160px",
                cellClassName: "cell-multiline",
                render: (value) =>
                  value?.length ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {value.map((item) => (
                        <a key={item.id} href={`http://localhost:5000${item.url}`} target="_blank" rel="noreferrer">
                          {item.file_name}
                        </a>
                      ))}
                    </div>
                  ) : "无"
              }
            ]}
            rows={items}
            actions={(row) => (
              <div className="btn-row">
                <ActionButton onClick={() => handleEdit(row)}>编辑</ActionButton>
                <ActionButton
                  variant="danger"
                  onClick={async () => {
                    try {
                      await deleteCollaborationItem(row.id);
                      await loadData();
                    } catch (error) {
                      showError("组织协同删除失败", error);
                    }
                  }}
                >
                  删除
                </ActionButton>
              </div>
            )}
          />
        </article>
      </section>
    </div>
  );
}
