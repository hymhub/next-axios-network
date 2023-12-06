import ReactJson from '@microlink/react-json-view'
import { Fragment, useEffect, useState } from "react";
import { getRequestSize, getResponseSize } from "./utils";
import { reqdemo, resdemo } from "./mock";
import clsx from "clsx";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
SyntaxHighlighter.registerLanguage('json', json);

const item = {
  requestMiddleWare: reqdemo,
  responseMiddleWare: resdemo,
};

const boxHeightChange = () => {
  document.documentElement.style.setProperty(
    "--inner-height",
    `${window.innerHeight}px`
  );
};

function App() {
  const [tabActiveIndex, setTabActiveIndex] = useState(0);
  const [activeItem, setActiveItem] = useState<unknown>(null);
  useEffect(() => {
    window.addEventListener("resize", boxHeightChange);
    boxHeightChange();
    return () => {
      window.removeEventListener("resize", boxHeightChange);
    };
  }, []);
  return (
    <div className="w-full h-full relative [border:1px_solid_#474747] flex">
      <table
        border={0}
        cellPadding={0}
        cellSpacing={0}
        className={clsx(
          "[&>tbody>tr]:grid [&>thead>tr]:grid h-full [&>tbody>tr.item:nth-of-type(2n)]:bg-[#202020]",
          activeItem
            ? "w-1/5 [&>tbody>tr]:grid-cols-1 [&>thead>tr]:grid-cols-1"
            : "w-full [&>tbody>tr]:grid-cols-[40%_20%_20%_20%] [&>thead>tr]:grid-cols-[40%_20%_20%_20%]"
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
              </Fragment>
            )}
          </tr>
        </thead>
        <tbody className="w-full h-[calc(100%-34px)] overflow-y-scroll flex flex-col">
          {[
            1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3,
            4, 5, 6, 7, 8, 9, 0,
          ].map((v, index) => (
            <tr
              onClick={() => setActiveItem(item)}
              key={index}
              className="[&>td:not(:last-of-type)]:[border-right:1px_solid_#474747] item [&>td]:py-[6px] [&>td]:px-2 hover:!bg-[#424242] text-[14px] [&>td]:overflow-hidden whitespace-nowrap"
            >
              <td>{item.requestMiddleWare.data.url}</td>
              {!activeItem && (
                <Fragment>
                  <td>{item.responseMiddleWare.data.status}</td>
                  <td>{getResponseSize(item.responseMiddleWare.data)}</td>
                  <td>{"Pending"}</td>
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
              </Fragment>
            )}
          </tr>
        </tbody>
      </table>
      {!!activeItem && (
        <section className="w-4/5 h-full [border-left:1px_solid_#474747]">
          <div className="bg-[#3D3D3D] flex px-2 items-center h-[34px]">
            <button
              onClick={() => setActiveItem(null)}
              className="border-none bg-transparent flex justify-center items-center relative w-4 h-4 mr-2 hover:brightness-110 active:brightness-100"
            >
              <div className="w-4 h-[2px] bg-[#C7C7C7] rounded-full rotate-45 absolute"></div>
              <div className="w-4 h-[2px] bg-[#C7C7C7] rounded-full -rotate-45 absolute"></div>
            </button>
            <ul className="flex">
              {["Headers", "Preview", "Response"].map((tab, index) => (
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
              ))}
            </ul>
          </div>
          <div className="h-[calc(100%-34px)] overflow-y-auto">
            {
              [
                <div className="h-full">
                  <section>
                    <p className="p-2 [border-top:1px_solid_#474747] [border-bottom:1px_solid_#474747] text-[#BDC6CF]">General</p>
                    <ul className="[&>li>span]:text-[#E7E9EC] [&>li>span]:whitespace-nowrap [&>li>p]:text-[#B8C1CA] [&>li>p]:text-[14px] [&>li]:grid [&>li]:grid-cols-[minmax(150px,30%)_1fr] [&>li]:items-center [&>li]:gap-x-2 p-2">
                      <li>
                        <span>Request URL:</span>
                        <p>{'http://www.www.www'}</p>
                      </li>
                      <li>
                        <span>Request Method:</span>
                        <p>{'GET'}</p>
                      </li>
                      <li>
                        <span>Status Code:</span>
                        <p>{}</p>
                      </li>
                    </ul>
                  </section>
                </div>,
                <ReactJson style={{height: '100%'}} theme="monokai" iconStyle="triangle" enableClipboard={false} displayDataTypes={false} src={item.responseMiddleWare.data.data} />,
                <SyntaxHighlighter className="h-full" showLineNumbers style={a11yDark}>
                  {JSON.stringify(item.responseMiddleWare.data.data, null, '    ')}
                </SyntaxHighlighter>
              ][tabActiveIndex]
            }
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
