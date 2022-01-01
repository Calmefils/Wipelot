#!/usr/bin/env node
import { createRequire } from 'module'
import { WebSocketServer } from 'ws'
const require = createRequire(import.meta.url)
var amqp = require('amqplib/callback_api')
const { createLogger, format, transports } = require('winston')
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
const queue = 'Wipelot_data'
const devicesQueue = 'Connected_Devices'

const logger = createLogger({
  level: 'info',
  format: format.json(),
  defaultMeta: { service: 'Listener' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new transports.File({ filename: './Logs/error.log', level: 'error' }),
    new transports.File({ filename: './Logs/info.log', level: 'info' }),
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

let globalChannel
let globalDevicesChannel
let connectedDevices = []

amqp.connect('amqp://localhost', function (error0, connection) {
  try {
    if (error0) {
      throw error0
    }
    connection.createChannel(function (error1, channel) {
      try {
        if (error1) {
          throw error1
        }
        globalChannel = channel

        channel.assertQueue(queue, {
          durable: false,
        })
      } catch (err) {
        logger.log('error', err, {
          devMsg: "Couldn't create channel: " + channel,
        })
      }
    })

    connection.createChannel(function (error1, channel) {
      try {
        if (error1) {
          throw error1
        }
        globalDevicesChannel = channel

        channel.assertQueue(devicesQueue, {
          durable: false,
        })
      } catch (err) {
        logger.log('error', err, {
          devMsg: "Couldn't create channel: " + channel,
        })
      }
    })
  } catch (err) {
    logger.log('error', err, {
      devMsg: "Couldn't connect to RabbitMQ",
    })
  }
})

const wss = new WebSocketServer({ port: 7000 })

wss.on('connection', function connection(ws, req) {
  logger.log({
    level: 'info',
    message: `New connection from ${req.socket.remoteAddress}:${req.socket.remotePort} established.`,
  })

  let receivedValue
  ws.send('socketUniqueNumber')

  ws.isAlive = true
  ws.on('pong', () => {
    ws.isAlive = true
  })

  ws.on('message', function message(data) {
    let [bool, resp] = checkDataValidity(data)
    if (bool === true) {
      receivedValue = JSON.parse(data)
      if (resp === 1) {
        connectedDevices.push({
          socketUniqueNumber: receivedValue.socketUniqueNumber,
          ip: req.socket.remoteAddress,
          port: req.socket.remotePort,
          timestamp: Date.now(),
        })

        if (globalDevicesChannel) {
          globalDevicesChannel.sendToQueue(
            devicesQueue,
            Buffer.from(JSON.stringify(connectedDevices))
          )
        }
      } else {
        if (globalChannel) {
          globalChannel.sendToQueue(queue, Buffer.from(data))
        } else {
          logger.log({
            level: 'info',
            message: "Couldn't connect the global channel yet.",
          })
        }
      }
    } else {
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
    connectedDevices = connectedDevices.filter(
      (obj) => obj.port !== req.socket.remotePort
    )
  })
})

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      return ws.terminate()
    }
    ws.isAlive = false
    ws.ping()
  })
}, 5000)

wss.on('close', function close() {
  clearInterval(interval)
  logger.log({
    level: 'info',
    message: `Websocket closed`,
  })
})

const checkDataValidity = (data) => {
  try {
    let parsedData = JSON.parse(data)
    let length = Object.keys(parsedData).length
    if (length === 3) {
      if (
        parsedData.hasOwnProperty('socketUniqueNumber') &&
        parsedData.hasOwnProperty('timestamp') &&
        parsedData.hasOwnProperty('value')
      ) {
        return [true, 0]
      }
    } else if (length === 1) {
      parsedData.hasOwnProperty('socketUniqueNumber')
      return [true, 1]
    }
    return [false, null]
  } catch (err) {
    return [false, null]
  }
}
