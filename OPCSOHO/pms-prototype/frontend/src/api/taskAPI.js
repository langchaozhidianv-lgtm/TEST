import api from "./axiosClient";

export async function fetchTasks(params = {}) {
  const { data } = await api.get("/tasks", { params });
  return data;
}

export async function createTask(payload) {
  const { data } = await api.post("/tasks", payload);
  return data;
}
