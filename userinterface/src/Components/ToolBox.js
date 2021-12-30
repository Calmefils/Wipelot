import Lottie from 'react-lottie-player'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import lottieJson from '../Animations/waiting.json'

const ToolBoxItem = (props) => {
  return (
    <div
      className='toolbox__items__item'
      onClick={() => props.onTakeItem(props.item)}
    >
      <ul
        style={{
          fontSize: '1rem',
          listStyleType: 'none',
          padding: '0',
          textAlign: 'center',
        }}
      >
        <li style={{ color: '#373a47' }}>
          <span>
            ID: {props.allDevices?.[props.item.i]?.socketUniqueNumber}
          </span>
        </li>

        <li style={{ color: '#373a47' }}>
          <span>
            Connected at:{' '}
            {new Date(
              props.allDevices?.[props.item.i]?.timestamp
            ).toLocaleTimeString()}
          </span>
        </li>
      </ul>
    </div>
  )
}
const ToolBox = ({
  toolbox,
  setToolbox,
  currentBreakpoint,
  setLayouts,
  items,
  allDevices,
  handleDeselectAll,
}) => {
  const onTakeItem = (item) => {
    setToolbox((prev) => {
      return {
        ...prev,
        [currentBreakpoint]: prev[currentBreakpoint].filter(
          ({ i }) => i !== item.i
        ),
      }
    })
    setLayouts((prev) => {
      return {
        ...prev,
        [currentBreakpoint]: [...prev[currentBreakpoint], item],
      }
    })
  }

  const handleSelectAll = () => {
    toolbox[currentBreakpoint].forEach((item) => {
      onTakeItem(item)
    })
  }

  return (
    <div className='toolbox'>
      <div style={{ textAlign: 'center' }}>
        <ButtonGroup
          variant='outlined'
          size='medium'
          color='inherit'
          aria-label='medium secondary button group'
        >
          <Button onClick={handleSelectAll}>Select All</Button>
          <Button onClick={handleDeselectAll}>Deselect All</Button>
        </ButtonGroup>
        {items?.length > 0 && (
          <h6 style={{ margin: '1rem 0' }}> Click to view details</h6>
        )}
      </div>

      {allDevices?.length > 0 && items?.length === 0 ? (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <h6 style={{ marginTop: '1rem' }}>All devices are displayed</h6>
            <small> Looking for new devices</small>
            <Lottie
              loop
              animationData={lottieJson}
              play
              style={{ width: 200, height: 200 }}
            />
          </div>
        </>
      ) : (
        <div className='toolbox__items'>
          {items?.map((item) => (
            <ToolBoxItem
              key={item.i}
              item={item}
              onTakeItem={onTakeItem}
              allDevices={allDevices}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ToolBox
