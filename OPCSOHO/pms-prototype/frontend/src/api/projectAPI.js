import api from "./axiosClient";

export async function fetchDashboard() {
  const { data } = await api.get("/projects/dashboard");
  return data;
}

export async function fetchProjects(params = {}) {
  const { data } = await api.get("/projects", { params });
  return data;
}

export async function createProject(payload) {
  const { data } = await api.post("/projects", payload);
  return data;
}

export async function updateProject(id, payload) {
  const { data } = await api.put(`/projects/${id}`, payload);
  return data;
}

export async function deleteProject(id) {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
}

export async function validateProjectDocuments(id) {
  const { data } = await api.get(`/projects/${id}/validate-documents`);
  return data;
}

export async function fetchProjectDetail(id) {
  const { data } = await api.get(`/projects/${id}/detail`);
  return data;
}
