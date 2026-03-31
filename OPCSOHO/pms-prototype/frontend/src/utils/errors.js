export function getErrorMessage(error, fallback = "请求失败，请稍后重试。") {
  if (!error) return fallback;

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
}
