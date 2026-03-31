import api from "./axiosClient";

export async function fetchSiteRecords(params = {}) {
  const { data } = await api.get("/sites", { params });
  return data;
}

export async function createSiteRecord(payload) {
  const { data } = await api.post("/sites", payload);
  return data;
}

export async function updateSiteRecord(id, payload) {
  const { data } = await api.put(`/sites/${id}`, payload);
  return data;
}

export async function deleteSiteRecord(id) {
  const { data } = await api.delete(`/sites/${id}`);
  return data;
}
