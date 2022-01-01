#!/usr/bin/env node
import dotenv from 'dotenv'
import WebSocket from 'ws'
import winston from 'winston'
const { createLogger, format, transports } = winston

dotenv.config({ path: '.env' })

const socketAddress = 'ws://localhost:7000'

const logger = createLogger({
  level: 'info',
  format: format.json(),
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
    logger.log({
      level: 'info',
      message: `Device: ${index} connected to listener.`,
    })
    heartbeat(ws)

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
    }, 1000)
  })

  ws.on('message', (data) => {
    logger.log({
      level: 'info',
      message: `Received: ${data.toString()}.`,
    })
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
    logger.log({
      level: 'info',
      message: `Device index: ${index} connection closed`,
    })
  })

  ws.on('error', (err) => {
    logger.log('error', `Connection error! Device index: ${index} `, err)
  })

  return ws
}

clientNumber = process.env.CLIENTNUMBER

if (!isNaN(clientNumber)) {
  clientNumber = Number(clientNumber)
  logger.log({
    level: 'info',
    message: `${clientNumber} connections will be created`,
  })
  for (let i = 0; i < clientNumber; i++) {
    let conn = createNewConnection(i, null)
    connections.push(conn)
  }
} else {
  logger.log('error', 'Invalid input')
  process.exit(0)
}
