#!/usr/bin/env node
import dotenv from 'dotenv'
import WebSocket from 'ws'
import winston from 'winston'
const { createLogger, format, transports } = winston

// Environment variables will be read from .env file
dotenv.config({ path: '.env' })

// Listener addres, if this runs on docker ws://listener:7000 or appropriate container name, if this runs on local machine use ws://localhost:7000
const socketAddress = 'ws://listener:7000'

// Logger instance created
const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: 'Simulator' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new transports.File({ filename: './Logs/error.log', level: 'error' }),
    new transports.File({ filename: './Logs/info.log', level: 'info' }),
    new transports.File({ filename: './Logs/combined.log' }),
  ],
})

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  )
}

var clientNumber // Storing the value of how many devices will be created
var connections = [] // Storing all connections instance

// Helper method for the connection, checking if it is alive
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

// The specified number(environment variable) of devices are being created.
const createNewConnection = (index, lastSent) => {
  const ws = new WebSocket(socketAddress) // New connection created
  let interval
  let toSend
  // If the connection established successfully this event will be triggered.
  ws.on('open', () => {
    logger.log({
      level: 'info',
      message: `Device: ${index} connected to listener.`,
    })
    heartbeat(ws)
    // Holding devices timestamp, if it's newly created, it will start from 0 else it will take latest sent value
    let timer = lastSent === null ? 0 : lastSent.timestamp
    // Same logic like the timer, if new, generating a number between 1-3000 else latest sent value
    let firstValue =
      lastSent === null ? Math.random() * 2998 + 1 : lastSent.value
    let lastValue = firstValue // Storing first value as last value before going into loop
    interval = setInterval(() => {
      // Creating a loop to send data every second
      let newValue = Math.random() * 200 - 100 + lastValue // last value +- 100
      if (newValue > 2999) newValue = 2999 // if new value exceeds 2999, it is set to the limit value
      if (newValue < 1) newValue = 1 // if new value falls below 1, it is set to the limit value
      toSend = {
        // Generated data is gettin ready to send as json
        socketUniqueNumber: index,
        timestamp: lastSent === null ? timer : timer + 1,
        value: Number(parseFloat(newValue).toFixed(0)), // Getting rid of the part after comma
      }
      lastValue = newValue // Last value is storing
      timer++ // Timer on.
      ws.send(JSON.stringify(toSend)) // Sending json data as string to listener
    }, 1000)
  })

  // Catching listener's messages
  ws.on('message', (data) => {
    logger.log({
      level: 'info',
      message: `Received: ${data.toString()}.`,
    })
    if (data == 'socketUniqueNumber') {
      // If listener requests socket unique number, simulator responds it
      let jsonResp = { socketUniqueNumber: index }
      ws.send(JSON.stringify(jsonResp))
    }
  })
  // Checking if connection is still alive
  ws.on('ping', () => {
    heartbeat(ws)
  })
  // On close event
  ws.on('close', () => {
    clearInterval(interval)
    logger.log({
      level: 'info',
      message: `Device index: ${index} connection closed`,
    })
  })
  // On error event
  ws.on('error', (err) => {
    logger.log('error', `Connection error! Device index: ${index} `, err)
  })

  return ws
}
// Getting number of clients that will be generated
clientNumber = process.env.CLIENTNUMBER

if (!isNaN(clientNumber)) {
  // Check if it's number
  clientNumber = Number(clientNumber)
  logger.log({
    level: 'info',
    message: `${clientNumber} connections will be created`,
  })
  // Invoke the method as many as the clientNumber
  for (let i = 0; i < clientNumber; i++) {
    let conn = createNewConnection(i, null)
    connections.push(conn) // Save the connection
  }
} else {
  logger.log('error', 'Invalid input')
  process.exit(0)
}
