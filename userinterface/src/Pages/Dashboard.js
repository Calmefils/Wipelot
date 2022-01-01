import React, { useEffect, useState } from 'react'
import generateLayout from '../Helpers/generateLayout'
import Table from '../Components/Table'
import './Dashboard.css'

import DraggableGridLayout from '../Components/DraggableGridLayout'

function Dashboard({
  size,
  socket,
  layouts,
  allDevices,
  setAllDevices,
  setToolbox,
  currentBreakpoint,
  onPutItem,
  currentTab,
}) {
  const [allDevicesData, setAllDevicesData] = useState([]) // Holding latest data for each device
  const [savedDevicesData, setSavedDevicesData] = useState([]) // Holding all data after connecting the middleware

  const messageListener = (message) => {
    if (message.code === 0) {
      // Code 0 stands for regular data for each device, socket unique number, value, timestamp
      let tempDevicesData = [...allDevicesData]
      let tempSavedDevicesData = [...savedDevicesData]
      let gonnaReset = false
      message.data.forEach((data) => {
        // Incoming data is an array that stores all connected devices regular data for each second
        // Trying to find and match the indexes of incoming data and allDevicesData
        let deviceIndex = tempDevicesData.findIndex(
          (device) => device.socketUniqueNumber === data.socketUniqueNumber
        )
        if (deviceIndex !== -1) {
          // Index is found
          tempDevicesData[deviceIndex] = data // Update the latest value of this device
          tempSavedDevicesData[deviceIndex].push(data.value) // Store the value with old data
        } else {
          // Index is not found
          tempDevicesData.push(data) // Just push the data, there is no data from this device in the list
          tempSavedDevicesData.push([data.value]) // Same as above
        }
        // Calculate mean and standard deviation after adding new values to the old values
        let [mean, std] = getStandardDeviationAndMean(
          tempSavedDevicesData[deviceIndex === -1 ? 0 : deviceIndex]
        )
        data.id = data.socketUniqueNumber // Not important, just for data grid internal management
        data.mean = mean.toFixed(0) // Save calculated mean with no precision
        data.std = std.toFixed(0) // Save calculate standard deviation with no precision
        if (isNaN(mean)) {
          // This part is if somehow connection is lost some undefined values appear. So we clear the old data and calculate from 0.
          gonnaReset = true
        }
      })
      if (gonnaReset) {
        setSavedDevicesData([])
        setAllDevicesData([])
      } else {
        setSavedDevicesData(tempSavedDevicesData)
        setAllDevicesData(tempDevicesData)
      }
    } else if (message.code === 1) {
      // Code 1 stands for devices metadata
      setAllDevices(message.data)
    }
  }
  // Mean and Standard Deviation calculator of a given array
  const getStandardDeviationAndMean = (array) => {
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    return [
      mean,
      Math.sqrt(
        array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
      ),
    ]
  }
  // Adding listener for incoming messages
  useEffect(() => {
    socket.on('message', messageListener)
    socket.on('disconnect', () => {
      console.log('disconnected')
    })
    return () => {
      socket.off('message', messageListener)
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [messageListener])

  // If devices metadata change, so change the layout.
  useEffect(() => {
    let length = allDevices?.length
    if (length > 0) {
      let devices = [...allDevices]
      setToolbox({ lg: generateLayout(devices, length) })
    }
  }, [allDevices, setToolbox])

  return (
    <>
      {currentTab === 0 ? (
        <DraggableGridLayout
          size={size}
          layouts={layouts}
          currentBreakpoint={currentBreakpoint}
          allDevicesData={allDevicesData}
          onPutItem={onPutItem}
          setToolbox={setToolbox}
        />
      ) : (
        <Table
          layouts={layouts}
          currentBreakpoint={currentBreakpoint}
          allDevicesData={allDevicesData}
          onPutItem={onPutItem}
        />
      )}
    </>
  )
}

export default Dashboard
