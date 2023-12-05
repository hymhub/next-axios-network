// import ReactJson from '@microlink/react-json-view'
import { useEffect } from 'react'
import { getRequestSize, getResponseSize } from './utils'
import { reqdemo, resdemo } from './mock'

const item = {
  requestMiddleWare: reqdemo,
  responseMiddleWare: resdemo
}

const boxHeightChange = () => {
  document.documentElement.style.setProperty('--inner-height', `${window.innerHeight}px`)
}

function App() {
  useEffect(() => {
    window.addEventListener('resize', boxHeightChange)
    boxHeightChange()
    return () => {
      window.removeEventListener('resize', boxHeightChange)
    }
  }, [])
  return (
    <div className="w-full h-full [border:1px_solid_#474747] grid grid-cols-[1fr_1fr_1fr_1fr] [&>section:not(:last-of-type)]:[border-right:1px_solid_#474747] [&>section>ul>p]:[border-bottom:1px_solid_#474747] [&>section>ul>li:nth-of-type(2n)]:bg-[#202020]">
      <section className="">
        <ul className="">
          <p className="">
            Name
          </p>
          <li className="">
            {item.requestMiddleWare.data.url}
          </li>
          <li className="">
            {item.requestMiddleWare.data.url}
          </li>
        </ul>
      </section>
      <section className="">
        <ul className="">
          <p className="">
            Status
          </p>
          <li className="">
            {item.responseMiddleWare.data.status}
          </li>
          <li className="">
            {item.responseMiddleWare.data.status}
          </li>
        </ul>
      </section>
      <section className="">
        <ul className="">
          <p className="">
            Size
          </p>
          <li className="">
            {getResponseSize(item.responseMiddleWare.data)}
          </li>
          <li className="">
            {getResponseSize(item.responseMiddleWare.data)}
          </li>
        </ul>
      </section>
      <section className="">
        <ul className="">
          <p className="">
            Time
          </p>
          <li className="">
            {'Pending'}
          </li>
          <li className="">
            {'Pending'}
          </li>
        </ul>
      </section>
      {/* <ReactJson src={[{
        a: 1
      }]} /> */}
    </div>
  );
}

export default App;
