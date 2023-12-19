import Clipboard from "clipboard";

// 获取响应数据大小
export function getResponseSize(response: any) {
  if (!response || !response.headers) {
    return undefined;
  }
  const headers = response.headers;
  const body = response.data;
  const size =
    JSON.stringify(headers).length + (body ? JSON.stringify(body).length : 0);
  return formatSize(size);
}

function formatSize(size: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return Number(size.toFixed(2)) + " " + units[i];
}

export function formatTime(time: number | undefined) {
  if (!time) {
    return null;
  }
  if (time >= 1000) {
    return `${Number((time / 1000).toFixed(2))} s`;
  } else {
    return `${time} ms`;
  }
}

export function formatDate(t: string | Date | number, str: string) {
  t = new Date(t);
  const obj: Record<string, any> = {
    yyyy: t.getFullYear(),
    yy: ("" + t.getFullYear()).slice(-2),
    M: t.getMonth() + 1,
    MM: ("0" + (t.getMonth() + 1)).slice(-2),
    d: t.getDate(),
    dd: ("0" + t.getDate()).slice(-2),
    H: t.getHours(),
    HH: ("0" + t.getHours()).slice(-2),
    h: t.getHours() % 12,
    hh: ("0" + (t.getHours() % 12)).slice(-2),
    m: t.getMinutes(),
    mm: ("0" + t.getMinutes()).slice(-2),
    s: t.getSeconds(),
    ss: ("0" + t.getSeconds()).slice(-2),
    w: ["日", "一", "二", "三", "四", "五", "六"][t.getDay()],
  };
  const reg = /y{2,4}|m{1,2}|d{1,2}|h{1,2}|s{1,2}|w/gi;
  return str.replace(reg, (k) => obj[k]);
}

export class CurlHelper {
  request: any;
  constructor(request: any) {
    this.request = request;
  }

  getHeaders() {
    let curlHeaders = "";
    Object.entries(this.request?.headers ?? {}).map(([property, value]) => {
      const header = `${property}:${value}`;
      curlHeaders = `${curlHeaders} -H '${header}'`;
    });
    return curlHeaders.trim();
  }

  getMethod() {
    return `-X ${this.request.method.toUpperCase()}`;
  }

  getBody() {
    if (
      typeof this.request.data !== "undefined" &&
      this.request.data !== "" &&
      this.request.data !== null &&
      this.request.method.toUpperCase() !== "GET"
    ) {
      const data =
        typeof this.request.data === "object" ||
        Object.prototype.toString.call(this.request.data) === "[object Array]"
          ? JSON.stringify(this.request.data)
          : this.request.data;
      return `--data '${data}'`.trim();
    } else {
      return "";
    }
  }

  getUrl() {
    return this.request.fullURL;
  }

  getBuiltURL() {
    const url = this.getUrl();

    return url.trim();
  }

  generateCommand() {
    return `curl ${this.getMethod()} "${this.getBuiltURL()}" ${this.getHeaders()} ${this.getBody()}`
      .trim()
      .replace(/\s{2,}/g, " ");
  }
}

export const copyText = (str: string, cb: () => void) => {
  const fakeElement = document.createElement("button");
  const clipboard = new Clipboard(fakeElement, {
    text: () => str || "",
    action: () => "copy",
  });
  clipboard.on("success", () => {
    clipboard.destroy();
    cb()
  });
  clipboard.on("error", () => {
    clipboard.destroy();
  });
  document.body.appendChild(fakeElement);
  fakeElement.click();
  document.body.removeChild(fakeElement);
};
