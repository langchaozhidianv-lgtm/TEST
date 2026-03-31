import api from "./axiosClient";

export async function fetchCosts(params = {}) {
  const { data } = await api.get("/costs", { params });
  return data;
}

export async function createCost(payload) {
  const { data } = await api.post("/costs", payload);
  return data;
}

export async function updateCost(id, payload) {
  const { data } = await api.put(`/costs/${id}`, payload);
  return data;
}

export async function deleteCost(id) {
  const { data } = await api.delete(`/costs/${id}`);
  return data;
}

export async function fetchCostComparison(projectId) {
  const { data } = await api.get(`/costs/comparison/${projectId}`);
  return data;
}

export async function createRemainingMaterial(payload) {
  const { data } = await api.post("/costs/remaining-materials", payload);
  return data;
}
