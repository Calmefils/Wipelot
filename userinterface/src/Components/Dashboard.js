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
  currentTab
}) {
  const [allDevicesData, setAllDevicesData] = useState([])
  const [savedDevicesData, setSavedDevicesData] = useState([])
  const [meansAndStds, setMeansAndStds] = useState([])

  const messageListener = (message) => {
    if (message.code === 0) {
      let tempDevicesData = [...allDevicesData]
      let tempSavedDevicesData = [...savedDevicesData]
      message.data.forEach((data) => {
        let deviceIndex = tempDevicesData.findIndex(
          (device) => device.socketUniqueNumber === data.socketUniqueNumber
        )
        if (deviceIndex !== -1) {
          tempDevicesData[deviceIndex] = data
          tempSavedDevicesData[deviceIndex].push(data.value)
        } else {
          tempDevicesData.push(data)
          tempSavedDevicesData.push([data.value])
        }
        console.log(tempDevicesData)
        let [mean, std] = getStandardDeviationAndMeanu(tempSavedDevicesData[deviceIndex === -1 ? 0 : deviceIndex])
        data.id = data.socketUniqueNumber
        data.mean = mean.toFixed(0)
        data.std = std.toFixed(0)
      })
      setSavedDevicesData(tempSavedDevicesData)
      setAllDevicesData(tempDevicesData)
    } else if (message.code === 1) {
      setAllDevices(message.data)
    }
  }

  const getStandardDeviationAndMeanu = (array) => {
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    return [mean, Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)]
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
      {currentTab === 0 ? 
        <DraggableGridLayout
          layouts={layouts}
          currentBreakpoint={currentBreakpoint}
          allDevicesData={allDevicesData}
          onPutItem={onPutItem}
        /> :
        <Table layouts={layouts}
          currentBreakpoint={currentBreakpoint}
          allDevicesData={allDevicesData}
          onPutItem={onPutItem} 
          meansAndStds={meansAndStds}
        />
      }
    </>
  )
}

export default Dashboard
