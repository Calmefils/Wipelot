import _ from 'lodash'
import { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import IconButton from '@mui/material/IconButton'
import generateLayout from '../Helpers/generateLayout'
const ResponsiveReactGridLayout = WidthProvider(Responsive)

const DraggableGridLayout = ({
  layouts,
  onPutItem,
  currentBreakpoint,
  allDevicesData,
}) => {
  const [compactType, setCompactType] = useState('vertical')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div>
      <ResponsiveReactGridLayout
        className='layout'
        breakpoints={{
          lg: 1200,
          md: 996,
          sm: 768,
          xs: 480,
          xxs: 0,
        }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        layouts={layouts}
        //onBreakpointChange={onBreakpointChange}
        //onLayoutChange={this.onLayoutChange}
        // WidthProvider option
        measureBeforeMount={false}
        // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
        // and set `measureBeforeMount={true}`.
        useCSSTransforms={mounted}
        compactType={compactType}
        preventCollision={!compactType}
      >
        {layouts[currentBreakpoint]?.map((l) => {
          let device = allDevicesData?.find(
            (dvc) => dvc.socketUniqueNumber === l.socketUniqueNumber
          )
          return (
            <div
              key={l.i}
              style={{
                backgroundColor: '#393e46',
                color: '#eeeeee',
                borderRadius: '2rem 0 2rem 0',
              }}
            >
              <div style={{ width: '100%', textAlign: 'end' }}>
                <IconButton aria-label='delete' onClick={() => onPutItem(l)}>
                  <RemoveCircleIcon style={{ color: 'white' }} />
                </IconButton>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ backgroundColor: '#EEEEEE', padding: '8px 0' }}>
                  <h6 className='noMarginBottom' style={{ color: 'black' }}>
                    Socket Unique Number
                  </h6>
                  <p
                    className='noMarginBottom'
                    style={{ color: 'black', fontSize: '1.5rem' }}
                  >
                    {device?.socketUniqueNumber}
                  </p>
                </div>
                <div style={{ padding: '8px 0' }}>
                  <h6 className='noMarginBottom'>Value</h6>
                  <p className='noMarginBottom' style={{ fontSize: '1.5rem' }}>
                    {device?.value}
                  </p>
                </div>
                <h6 className='noMarginBottom'>Timestamp</h6>
                <p className='noMarginBottom'>{device?.timestamp}</p>
              </div>
            </div>
          )
        })}
      </ResponsiveReactGridLayout>
    </div>
  )
}

export default DraggableGridLayout
