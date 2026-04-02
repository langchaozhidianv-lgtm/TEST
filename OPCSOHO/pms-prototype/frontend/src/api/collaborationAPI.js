import api from "./axiosClient";

export async function fetchCollaborationItems() {
  const { data } = await api.get("/collaboration");
  return data;
}

export async function createCollaborationItem(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "attachments") return;
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  (payload.attachments || []).forEach((file) => formData.append("attachments", file));
  const { data } = await api.post("/collaboration", formData);
  return data;
}

export async function updateCollaborationItem(id, payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "attachments") return;
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  (payload.attachments || []).forEach((file) => formData.append("attachments", file));
  const { data } = await api.put(`/collaboration/${id}`, formData);
  return data;
}

export async function deleteCollaborationItem(id) {
  const { data } = await api.delete(`/collaboration/${id}`);
  return data;
}
