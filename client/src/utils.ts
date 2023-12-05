// 获取请求数据大小
export function getRequestSize(request) {
  const headers = request.headers;
  const body = request.data;
  const size = JSON.stringify(headers).length + (body ? JSON.stringify(body).length : 0);
  return formatSize(size);
}

// 获取响应数据大小
export function getResponseSize(response) {
  const headers = response.headers;
  const body = response.data;
  const size = JSON.stringify(headers).length + (body ? JSON.stringify(body).length : 0);
  return formatSize(size);
}

function formatSize(size) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return Number(size.toFixed(2)) + ' ' + units[i];
}