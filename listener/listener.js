#!/usr/bin/env node

/* var amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) {
    throw error0
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1
    }

    var queue = 'hello'

    channel.assertQueue(queue, {
      durable: false,
    })

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue)

    channel.consume(
      queue,
      function (msg) {
        console.log(' [x] Received %s', msg.content.toString())
      },
      {
        noAck: true,
      }
    )
  })
}) */

import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', function connection(ws) {
  let receivedValue
  ws.on('message', function message(data) {
    //console.log('received: %s', data)
    receivedValue = JSON.parse(data)
    console.log(
      `Socket Unique Number: ${receivedValue.socketUniqueNumber}, Timestamp: ${receivedValue.timestamp}, Value: ${receivedValue.value} received.`
    )
  })
})
