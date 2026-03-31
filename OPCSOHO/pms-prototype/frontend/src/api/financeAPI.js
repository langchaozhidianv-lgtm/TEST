import api from "./axiosClient";

export async function fetchFinanceTransactions(params = {}) {
  const { data } = await api.get("/finance", { params });
  return data;
}

export async function createFinanceTransaction(payload) {
  const { data } = await api.post("/finance", payload);
  return data;
}

export async function updateFinanceTransaction(id, payload) {
  const { data } = await api.put(`/finance/${id}`, payload);
  return data;
}

export async function deleteFinanceTransaction(id) {
  const { data } = await api.delete(`/finance/${id}`);
  return data;
}

export async function fetchPaymentRiskAlerts(params = {}) {
  const { data } = await api.get("/finance/alerts/payment-risk", { params });
  return data;
}
