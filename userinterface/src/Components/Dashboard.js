import React, { useEffect, useState } from 'react'
import generateLayout from '../Helpers/generateLayout'
import Table from '../Components/Table'
import './Dashboard.css'

import DraggableGridLayout from './DraggableGridLayout'

function Dashboard({
  socket,
  layouts,
  allDevices,
  setAllDevices,
  setToolbox,
  currentBreakpoint,
  onPutItem,
}) {
  const [allDevicesData, setAllDevicesData] = useState([])

  const messageListener = (message) => {
    if (message.code === 0) {
      let tempDevicesData = [...allDevicesData]
      message.data.forEach((data) => {
        let deviceIndex = tempDevicesData.findIndex(
          (device) => device.socketUniqueNumber === data.socketUniqueNumber
        )
        if (deviceIndex !== -1) {
          tempDevicesData[deviceIndex] = data
        } else {
          tempDevicesData.push(data)
        }
      })

      //console.log(tempDevicesData)
      setAllDevicesData(tempDevicesData)
    } else if (message.code === 1) {
      setAllDevices(message.data)
    }
  }

  useEffect(() => {
    socket.on('message', messageListener)
    //socket.on('deleteMessage', deleteMessageListener)
    //socket.emit('getMessages')
    return () => {
      socket.off('message', messageListener)
      socket.off('connect')
      socket.off('disconnect')
      //socket.off('deleteMessage', deleteMessageListener)
    }
  }, [socket, allDevices, allDevicesData])

  useEffect(() => {
    let length = allDevices?.length

    if (length > 0) {
      let devices = [...allDevices]
      setToolbox({ lg: generateLayout(devices, length) })
    }
  }, [allDevices])

  return (
    <>
      <DraggableGridLayout
        layouts={layouts}
        currentBreakpoint={currentBreakpoint}
        allDevicesData={allDevicesData}
        onPutItem={onPutItem}
      />
      <Table allDevicesData={allDevicesData} />
    </>
  )
}

export default Dashboard
