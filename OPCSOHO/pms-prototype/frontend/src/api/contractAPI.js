import api from "./axiosClient";

export async function fetchContracts(params = {}) {
  const { data } = await api.get("/contracts", { params });
  return data;
}

export async function createContract(payload) {
  const { data } = await api.post("/contracts", payload);
  return data;
}

export async function updateContract(id, payload) {
  const { data } = await api.put(`/contracts/${id}`, payload);
  return data;
}

export async function deleteContract(id) {
  const { data } = await api.delete(`/contracts/${id}`);
  return data;
}
