export function getErrorMessage(error, fallback = "请求失败，请稍后重试。") {
  if (!error) return fallback;

  if (typeof error.response?.data?.message === "string" && error.response.data.message.trim()) {
    return error.response.data.message;
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
