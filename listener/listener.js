#!/usr/bin/env node
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

var amqp = require('amqplib/callback_api')
import { WebSocketServer } from 'ws'
let globalChannel
var queue = 'Wipelot_data'
amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) {
    throw error0
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1
    }
    globalChannel = channel

    channel.assertQueue(queue, {
      durable: false,
    })
  })
})

const wss = new WebSocketServer({ port: 7000 })

wss.on('connection', function connection(ws, req) {
  console.log(
    `New connection from ${req.socket.remoteAddress}:${req.socket.remotePort} established.`
  )
  let receivedValue
  ws.isAlive = true
  ws.on('pong', () => {
    ws.isAlive = true
  })
  ws.on('message', function message(data) {
    receivedValue = JSON.parse(data)
    if (checkDataValidity(receivedValue)) {
      if (globalChannel) {
        globalChannel.sendToQueue(queue, Buffer.from(data))
        console.log(' [x] Sent %s', receivedValue)
      } else {
        console.log("Couldn't connect the channel yet.")
      }

      /* console.log(
      `Socket Unique Number: ${receivedValue.socketUniqueNumber}, Timestamp: ${receivedValue.timestamp}, Value: ${receivedValue.value} received.`
    ) */
      // Soket bağlantısı 5. saniyede koparılıyor. Cihazın yeniden bağlanıp bağlanmadığı test ediliyor.
      if (receivedValue.timestamp === 5) {
        ws.terminate()
      }
    } else {
      console.log('Uygun olmayan veri tespit edildi.')
      console.log(receivedValue)
      console.log('------')
    }
  })
  ws.on('close', function close() {
    console.log(
      `New connection from ${req.socket.remoteAddress}:${req.socket.remotePort} closed.`
    )
  })
})

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      console.log('One connection is closed.')
      return ws.terminate()
    }
    ws.isAlive = false
    ws.ping()
  })
}, 5000)

wss.on('close', function close() {
  clearInterval(interval)
  console.log('Websocket closed.')
})

const checkDataValidity = (data) => {
  if (typeof data === 'object') {
    let length = Object.keys(data).length
    if (length === 3) {
      if (
        data.hasOwnProperty('socketUniqueNumber') &&
        data.hasOwnProperty('timestamp') &&
        data.hasOwnProperty('value')
      ) {
        return true
      }
    }
  }
  return false
}
