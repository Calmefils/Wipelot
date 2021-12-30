#!/usr/bin/env node
import dotenv from 'dotenv'
import WebSocket from 'ws'

dotenv.config({ path: '.env' })

const socketAddress = 'ws://localhost:7000'
var clientNumber
var connections = []

const heartbeat = (ws) => {
  clearTimeout(ws.pingTimeout)

  // Use `WebSocket#terminate()`, which immediately destroys the connection,
  // instead of `WebSocket#close()`, which waits for the close timer.
  // Delay should be equal to the interval at which your server
  // sends out pings plus a conservative assumption of the latency.
  ws.pingTimeout = setTimeout(() => {
    ws.terminate()
  }, 5000 + 1000)
}

const createNewConnection = (index, lastSent) => {
  const ws = new WebSocket(socketAddress)
  let interval
  let toSend
  ws.on('open', () => {
    heartbeat(ws)
    console.log()
    let timer = lastSent === null ? 0 : lastSent.timestamp
    let firstValue =
      lastSent === null ? Math.random() * 2998 + 1 : lastSent.value
    let lastValue = firstValue
    interval = setInterval(() => {
      let newValue = Math.random() * 200 - 100 + lastValue
      if (newValue > 2999) newValue = 2999
      if (newValue < 1) newValue = 1
      toSend = {
        socketUniqueNumber: index,
        timestamp: lastSent === null ? timer : timer + 1,
        value: Number(parseFloat(newValue).toFixed(0)),
      }
      lastValue = newValue
      timer++
      ws.send(JSON.stringify(toSend))
      console.log(toSend)
    }, 1000)
  })

  ws.on('message', (data) => {
    console.log('received: %s', data)
    if (data == 'socketUniqueNumber') {
      let jsonResp = { socketUniqueNumber: index }
      ws.send(JSON.stringify(jsonResp))
    }
  })

  ws.on('ping', () => {
    heartbeat(ws)
  })

  ws.on('close', () => {
    clearInterval(interval)
    console.log(`Index: ${index} connection closed`)
    //createNewConnection(index, toSend)
    //console.log(`Index: ${index} connection reopened`)
  })

  ws.on('error', (err) => {
    console.log(err)
  })

  return ws
}

clientNumber = process.env.CLIENTNUMBER

if (!isNaN(clientNumber)) {
  clientNumber = Number(clientNumber)
  for (let i = 0; i < clientNumber; i++) {
    let conn = createNewConnection(i, null)
    connections.push(conn)
  }
  console.log(`${connections.length} connections are created`)
} else {
  console.log('Invalid Input')
  process.exit(0)
}
