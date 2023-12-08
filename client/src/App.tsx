import ReactJson from "@microlink/react-json-view";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { formatDate, formatTime, getResponseSize } from "./utils";
import clsx from "clsx";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
SyntaxHighlighter.registerLanguage("json", json);

function createWebSocket(cb: (data: any) => void, init: (data: any) => void) {
  const socket = new WebSocket("ws://localhost:2999");

  socket.onopen = () => {
    console.log("WebSocket connection opened");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "request-error") {
      console.log("====================================");
      console.log(data);
      console.log("====================================");
    } else {
      data.type === "init" ? init(data.caches) : cb(data);
    }
  };

  socket.onclose = (event) => {
    console.log("WebSocket connection closed", event);
    setTimeout(() => {
      createWebSocket(cb, init);
    }, 1000);
  };
}

function App() {
  const [list, setList] = useState<any[]>([]);
  const [tabActiveIndex, setTabActiveIndex] = useState(0);
  const [domWidth, setDomWidth] = useState(window.innerWidth);
  const [tableWidth, setTableWidth] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<any>(null);
  const resizer = useRef<HTMLDivElement>(null);
  const table = useRef<HTMLTableElement>(null);
  const boxHeightChange = useCallback(() => {
    setDomWidth(window.innerWidth);
    document.documentElement.style.setProperty(
      "--inner-height",
      `${window.innerHeight}px`
    );
  }, []);
  useEffect(() => {
    const m_resizer = resizer.current;
    let isResizing = false;
    const handleMouseMove = (e: any) => {
      if (isResizing) {
        let newW = e.clientX - 16;
        if (newW > window.innerWidth / 2) {
          newW = window.innerWidth / 2;
        } else if (newW < 150) {
          newW = 150;
        }
        setTableWidth(newW);
      }
    };
    const handleDomUp = () => {
      isResizing = false;
      document.removeEventListener("mousemove", handleMouseMove);
    };
    const handleMouseDown = () => {
      isResizing = true;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleDomUp);
    };
    if (activeItem && m_resizer) {
      m_resizer.addEventListener("mousedown", handleMouseDown);
    }
    return () => {
      m_resizer && m_resizer.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleDomUp);
    };
  }, [activeItem]);
  useEffect(() => {
    createWebSocket(
      (data) => {
        setList((v) => {
          const tmp = v.find((t) => t.id === data.id);
          if (tmp) {
            tmp.content = data.content;
          } else {
            v = [data, ...v];
          }
          return v.slice(0, 100);
        });
      },
      (data) => {
        setList(data);
      }
    );
    window.addEventListener("resize", boxHeightChange);
    boxHeightChange();
    return () => {
      window.removeEventListener("resize", boxHeightChange);
    };
  }, []);
  return (
    <div className="w-full h-full relative [border:1px_solid_#474747] flex">
      <table
        ref={table}
        border={0}
        cellPadding={0}
        cellSpacing={0}
        style={
          tableWidth
            ? {
                width: tableWidth + "px",
              }
            : undefined
        }
        className={clsx(
          "[&>tbody>tr]:grid shrink-0 [&>thead>tr]:grid h-full [&>tbody>tr.item:nth-of-type(2n)]:bg-[#202020]",
          activeItem
            ? "w-1/5 [&>tbody>tr]:grid-cols-1 [&>thead>tr]:grid-cols-1"
            : "!w-full [&>tbody>tr]:grid-cols-[32%_17%_17%_15%_19%] [&>thead>tr]:grid-cols-[32%_17%_17%_15%_19%]"
        )}
      >
        <thead className="overflow-y-scroll scrollbar-transparent flex flex-col h-[34px]">
          <tr className="[&>th:not(:last-of-type)]:[border-right:1px_solid_#474747] [&>th]:py-2 [&>th]:px-2 [border-bottom:1px_solid_#474747] h-full">
            <th className="">Name</th>
            {!activeItem && (
              <Fragment>
                <th className="">Status</th>
                <th className="">Size</th>
                <th className="">Time</th>
                <th className="">Date</th>
              </Fragment>
            )}
          </tr>
        </thead>
        <tbody className="w-full h-[calc(100%-34px)] overflow-y-scroll flex flex-col">
          {list.map((item, index) => (
            <tr
              onClick={() => {
                setActiveItemIndex(index);
                setActiveItem(item);
              }}
              key={index}
              className={clsx(
                "[&>td:not(:last-of-type)]:[border-right:1px_solid_#474747] item [&>td]:py-[6px] [&>td]:px-2 text-[14px] [&>td]:overflow-hidden whitespace-nowrap cursor-default",
                index === activeItemIndex
                  ? /^4|^5/.test(item.content?.response?.status ?? "") ||
                    (item.content.response?.timeConsuming &&
                      !item.content.response?.status)
                    ? "!bg-[#482523]"
                    : "!bg-[#154A77]"
                  : "hover:!bg-[#424242]",
                {
                  "text-[#ED4E4C]":
                    /^4|^5/.test(item.content?.response?.status ?? "") ||
                    (item.content.response?.timeConsuming &&
                      !item.content.response?.status),
                }
              )}
            >
              <td>
                {item.content?.request?.fullURL.slice(
                  item.content?.request?.fullURL
                    .slice(
                      0,
                      item.content.request.fullURL.indexOf("?") === -1
                        ? item.content.request.fullURL.length
                        : item.content.request.fullURL.indexOf("?")
                    )
                    .lastIndexOf("/") + 1
                )}
              </td>
              {!activeItem && (
                <Fragment>
                  <td className="flex items-center gap-x-2">
                    <div
                      className={clsx(
                        {
                          "2": "bg-[#81C995]",
                          "3": "bg-[#3498db]",
                          "4": "bg-[#F28B82]",
                          "5": "bg-[#F28B82]",
                        }[String(item.content?.response?.status ?? "0")[0]] ||
                          (item.content.response?.timeConsuming &&
                          !item.content.response?.status
                            ? "bg-[#F28B82]"
                            : "bg-[#B0B0B0]"),
                        "w-4 h-4 rounded-full"
                      )}
                    ></div>
                    {item.content.response?.status ??
                      (item.content.response?.timeConsuming
                        ? "Fail"
                        : "Pending")}
                  </td>
                  <td>{getResponseSize(item.content.response) ?? "Pending"}</td>
                  <td>
                    {formatTime(item.content.response?.timeConsuming) ||
                      "Pending"}
                  </td>
                  <td>
                    {item.content?.request?.sendTime
                      ? formatDate(
                          item.content?.request?.sendTime,
                          "yyyy-MM-dd HH:mm:ss"
                        )
                      : "--"}
                  </td>
                </Fragment>
              )}
            </tr>
          ))}
          <tr className="[&>td:not(:last-of-type)]:[border-right:1px_solid_#474747] flex-1">
            <td></td>
            {!activeItem && (
              <Fragment>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </Fragment>
            )}
          </tr>
        </tbody>
      </table>
      {!!activeItem && (
        <section className="flex-1 h-full [border-left:1px_solid_#474747] relative">
          <div
            ref={resizer}
            className="absolute top-0 left-0 z-10 cursor-ew-resize h-full w-1"
          ></div>
          <div className="bg-[#3D3D3D] flex px-2 items-center h-[34px]">
            <button
              onClick={() => setActiveItem(null)}
              className="border-none bg-transparent flex justify-center items-center relative w-4 h-4 mr-2 hover:brightness-110 active:brightness-100"
            >
              <div className="w-4 h-[2px] bg-[#C7C7C7] rounded-full rotate-45 absolute"></div>
              <div className="w-4 h-[2px] bg-[#C7C7C7] rounded-full -rotate-45 absolute"></div>
            </button>
            <ul className="flex">
              {["Headers", "Payload", "Preview", "Response"].map((tab, index) =>
                tab === "Payload" &&
                !activeItem.content?.request?.params &&
                !activeItem.content?.request?.data ? (
                  <Fragment key={tab}></Fragment>
                ) : (
                  <li
                    key={tab}
                    onClick={() => setTabActiveIndex(index)}
                    className={clsx("select-none p-2 hover:bg-[#545454]", {
                      "!text-[#7CACF8] [border-bottom:2px_solid_#7CACF8]":
                        tabActiveIndex === index,
                    })}
                  >
                    {tab}
                  </li>
                )
              )}
            </ul>
          </div>
          <div
            style={{
              width:
                domWidth -
                32 -
                (tableWidth ? tableWidth : table.current?.offsetWidth ?? 150) +
                "px",
            }}
            className="h-[calc(100%-34px)] overflow-auto"
          >
            {
              [
                <div className="h-full">
                  <section className="pb-2">
                    <p className="p-2 [border-top:1px_solid_#474747] [border-bottom:1px_solid_#474747] text-[#BDC6CF]">
                      General
                    </p>
                    <ul className="[&>li>span]:text-[#E7E9EC] [&>li>span]:whitespace-nowrap [&>li>p]:text-[#B8C1CA] [&>li>p]:text-[14px] [&>li]:grid [&>li]:grid-cols-[minmax(150px,30%)_1fr] [&>li]:items-center [&>li]:gap-x-2 p-2 grid gap-y-2">
                      <li>
                        <span>Request URL:</span>
                        <p>{activeItem.content?.request?.fullURL}</p>
                      </li>
                      <li>
                        <span>Request Method:</span>
                        <p>{activeItem.content?.request?.method}</p>
                      </li>
                      <li>
                        <span>Status Code:</span>
                        <p className="flex items-center gap-x-2">
                          <span
                            className={clsx(
                              {
                                "2": "bg-[#81C995]",
                                "3": "bg-[#3498db]",
                                "4": "bg-[#F28B82]",
                                "5": "bg-[#F28B82]",
                              }[
                                String(
                                  activeItem.content.response?.status ?? "0"
                                )[0]
                              ] ||
                                (activeItem.content.response?.timeConsuming &&
                                !activeItem.content.response?.status
                                  ? "bg-[#F28B82]"
                                  : "bg-[#B0B0B0]"),
                              "w-4 h-4 rounded-full block"
                            )}
                          ></span>
                          <span>
                            {activeItem.content.response?.status ??
                              (activeItem.content.response?.timeConsuming
                                ? "Fail"
                                : "Pending")}
                          </span>
                          <span>
                            {activeItem.content.response?.statusText ?? ""}
                          </span>
                        </p>
                      </li>
                    </ul>
                  </section>
                  <section className="pb-2">
                    <p className="p-2 [border-top:1px_solid_#474747] [border-bottom:1px_solid_#474747] text-[#BDC6CF]">
                      Response Headers
                    </p>
                    {activeItem.content?.response?.headers && (
                      <ul className="[&>li>span]:text-[#E7E9EC] [&>li>span]:whitespace-nowrap [&>li>p]:text-[#B8C1CA] [&>li>p]:text-[14px] [&>li]:grid [&>li]:grid-cols-[minmax(150px,30%)_1fr] [&>li]:items-center [&>li]:gap-x-2 p-2 grid gap-y-2">
                        {Object.entries(
                          activeItem.content.response.headers
                        ).map(([key, val]) => (
                          <li key={key}>
                            <span>
                              {key.replace(/^\w|-\w/g, (v) => v.toUpperCase())}:
                            </span>
                            <p>{String(val)}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                  <section className="pb-2">
                    <p className="p-2 [border-top:1px_solid_#474747] [border-bottom:1px_solid_#474747] text-[#BDC6CF]">
                      Request Headers
                    </p>
                    {activeItem.content?.request?.headers && (
                      <ul className="[&>li>span]:text-[#E7E9EC] [&>li>span]:whitespace-nowrap [&>li>p]:text-[#B8C1CA] [&>li>p]:text-[14px] [&>li]:grid [&>li]:grid-cols-[minmax(150px,30%)_1fr] [&>li]:items-center [&>li]:gap-x-2 p-2 grid gap-y-2">
                        {Object.entries(activeItem.content.request.headers).map(
                          ([key, val]) => (
                            <li key={key}>
                              <span>
                                {key.replace(/^\w|-\w/g, (v) =>
                                  v.toUpperCase()
                                )}
                                :
                              </span>
                              <p>{String(val)}</p>
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </section>
                </div>,
                !activeItem.content?.request?.params &&
                !activeItem.content?.request?.data ? null : (
                  <div>
                    {activeItem.content?.request?.params && (
                      <section className="pb-2">
                        <p className="p-2 [border-top:1px_solid_#474747] [border-bottom:1px_solid_#474747] text-[#BDC6CF]">
                          Query String parameters
                        </p>
                        <ul className="[&>li>span]:text-[#8F8F8F] [&>li>span]:whitespace-nowrap [&>li>p]:text-[#E3E3E3] [&>li>p]:text-[14px] [&>li]:flex [&>li]:items-center [&>li]:gap-x-2 py-2 px-4 grid gap-y-2">
                          {Object.entries(
                            activeItem.content.request.params
                          ).map(([key, val]) => (
                            <li key={key}>
                              <span className="font-medium">{key}:</span>
                              <p>{String(val)}</p>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    {activeItem.content?.request?.data && (
                      <section className="pb-2">
                        <p className="p-2 [border-top:1px_solid_#474747] [border-bottom:1px_solid_#474747] text-[#BDC6CF]">
                          Request Payload
                        </p>
                        <ul className="[&>li>span]:text-[#8F8F8F] [&>li>span]:whitespace-nowrap [&>li>p]:text-[#E3E3E3] [&>li>p]:text-[14px] [&>li]:flex [&>li]:items-center [&>li]:gap-x-2 py-2 px-4 grid gap-y-2">
                          {typeof activeItem.content.request.data ===
                          "object" ? (
                            <ReactJson
                              name={false}
                              style={{ height: "100%", background: "#282828" }}
                              theme="monokai"
                              iconStyle="triangle"
                              enableClipboard={true}
                              displayDataTypes={false}
                              displayObjectSize={false}
                              collapseStringsAfterLength={50}
                              src={activeItem.content.request.data as object}
                            />
                          ) : (
                            String(activeItem.content.request.data)
                          )}
                        </ul>
                      </section>
                    )}
                  </div>
                ),
                typeof activeItem.content.response?.data === "object" ? (
                  <ReactJson
                    name={false}
                    style={{ height: "100%", background: "#282828" }}
                    theme="monokai"
                    iconStyle="triangle"
                    enableClipboard={true}
                    displayDataTypes={false}
                    collapseStringsAfterLength={50}
                    src={activeItem.content.response?.data}
                  />
                ) : (
                  <div className="p-2">{activeItem.content.response?.data}</div>
                ),
                <SyntaxHighlighter
                  className="h-full !bg-[#282828]"
                  showLineNumbers={!!activeItem.content.response?.data}
                  style={a11yDark}
                >
                  {activeItem.content.response?.data
                    ? JSON.stringify(
                        activeItem.content.response.data,
                        null,
                        "    "
                      )
                    : ""}
                </SyntaxHighlighter>,
              ][tabActiveIndex]
            }
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
