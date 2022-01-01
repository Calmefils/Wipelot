#!/usr/bin/env node
import { createRequire } from 'module'
import { WebSocketServer } from 'ws'
import { createRabbitChannel, checkDataValidity } from './helperFunctions.js'
const require = createRequire(import.meta.url)
var amqp = require('amqplib/callback_api')
const { createLogger, format, transports, query } = require('winston')
import dotenv from 'dotenv'

// Environment variables will be read from .env file
dotenv.config({ path: '.env' })

//RabbitMQ server address, if this runs on docker amqp://rabbit or appropriate container name, if this runs on local machine use amqp://localhost
const address = 'amqp://rabbit'

// RabbitMQ queue names
const queue = 'Wipelot_data'
const devicesQueue = 'Connected_Devices'

// Logger instance created
const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: 'Listener' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new transports.File({
      filename: './Logs/error.log',
      level: 'error',
    }),
    new transports.File({
      filename: './Logs/info.log',
      level: 'info',
    }),
    new transports.File({ filename: './Logs/warn.log', level: 'warn' }),
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

// In order to reach channel connection globally, creating variables at global scope
let globalChannel
let globalDevicesChannel

// All connected devices list, at every update, list taking latest device status
let connectedDevices = []

// Connecting to RabbitMQ server
function connectToRabbit() {
  return new Promise((resolve, reject) => {
    amqp.connect(address, async function (error0, connection) {
      try {
        if (error0) {
          throw error0
        }
        logger.log('info', 'Connected to RabbitMQ server')
        // If not created the channels before, create them and assert queue.
        let tempGlobalChannel = await createRabbitChannel(
          connection,
          queue,
          logger
        )
        let tempGlobalDevicesChannel = await createRabbitChannel(
          connection,
          devicesQueue,
          logger
        )
        resolve([tempGlobalChannel, tempGlobalDevicesChannel])
      } catch (err) {
        logger.log('error', err)
        reject(false)
      }
    })
  })
}

let resp = await connectToRabbit()

if (resp) {
  globalChannel = resp[0]
  globalDevicesChannel = resp[1]
} else {
  logger.log('error', err, {
    devMsg: 'Failed to connect to RabbitMQ',
  })
  process.exit(1)
}

// Creating websocket server
const wss = new WebSocketServer({ port: 7000 })

// Every new connection will catch by this block
wss.on('connection', function connection(ws, req) {
  logger.log({
    level: 'info',
    message: `New connection from ${req.socket.remoteAddress}:${req.socket.remotePort} established.`,
  })

  let receivedValue
  // Sending this message to simulator to get back devices's socket unique numbers
  ws.send('socketUniqueNumber')

  // Checking if connection is still alive
  ws.isAlive = true
  ws.on('pong', () => {
    ws.isAlive = true
  })
  // Catching messages sent by simulator
  ws.on('message', function message(data) {
    // Check if incoming message is valid
    let [bool, resp] = checkDataValidity(data)
    if (bool === true) {
      // If true data is valid then process the data
      receivedValue = JSON.parse(data) // Parsing buffer to json
      if (resp === 1) {
        // Code 1 means simulator sending general device information
        // Storing device data to cache for other connection
        connectedDevices.push({
          socketUniqueNumber: receivedValue.socketUniqueNumber,
          ip: req.socket.remoteAddress,
          port: req.socket.remotePort,
          timestamp: Date.now(),
        })
        // If connected to Wipelot_data queue send to queue connected devices list
        if (globalDevicesChannel) {
          globalDevicesChannel.sendToQueue(
            devicesQueue,
            Buffer.from(JSON.stringify(connectedDevices))
          )
        }
      } else {
        // This block stands for code 0 and it means regular device data such as socket unique number, value and timestamp
        if (globalChannel) {
          globalChannel.sendToQueue(queue, Buffer.from(data)) // Sending to queue regular data
        } else {
          logger.log({
            level: 'info',
            message: "Couldn't connect the global channel yet.",
          })
        }
      }
    } else {
      // Data is not valid
      logger.log('warn', 'Inappropriate data detected.', {
        data: data.toString(),
      })
    }
  })
  ws.on('close', function close() {
    logger.log({
      level: 'info',
      message: `New connection from ${req.socket.remoteAddress}:${req.socket.remotePort} closed.`,
    })
    // On connection close device is removing from connected devices list
    connectedDevices = connectedDevices.filter(
      (obj) => obj.port !== req.socket.remotePort
    )
  })
})

// Check if clients are still connected.
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      return ws.terminate()
    }
    ws.isAlive = false
    ws.ping()
  })
}, 5000)

// Websocket instanse on close event
wss.on('close', function close() {
  clearInterval(interval)
  logger.log({
    level: 'info',
    message: `Websocket closed`,
  })
})
