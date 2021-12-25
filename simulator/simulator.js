#!/usr/bin/env node

import readline from 'readline'
import WebSocket from 'ws'

var clientNumber
var connections = []

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.prompt()
console.log('Resquest Client Number')

rl.on('line', function (cmd) {
  console.log(typeof cmd, cmd, !isNaN(cmd))
  if (!isNaN(cmd)) {
    clientNumber = Number(cmd)
  }
  for (let i = 0; i < clientNumber; i++) {
    let conn = createNewConnection(i)
    //console.log(conn)
    connections.push(conn)
  }
  rl.close()
})

const createNewConnection = (index) => {
  console.log(`${index}. connection is creating`)
  const ws = new WebSocket('ws://127.0.0.1:8080')

  ws.on('open', function open() {
    let timer = 0
    let firstValue = 10 //Math.random() * 2998 + 1
    let lastValue = firstValue
    setInterval(() => {
      //let newValue = timer !== 0 ? calculateNewValue(lastValue) : firstValue
      let newValue = Math.random() * 200 - 100 + lastValue
      if (newValue > 2999) newValue = 2999
      if (newValue < 1) newValue = 1
      let toSend = {
        socketUniqueNumber: index,
        timestamp: timer,
        value: newValue,
        lastValue: lastValue,
        //value: timer === 0 ? parseFloat(firstValue).toFixed(0) : newValue,
      }
      lastValue = newValue
      timer++
      console.log(toSend)
      ws.send(JSON.stringify(toSend))
    }, 1000)
  })

  ws.on('message', function message(data) {
    console.log('received: %s', data)
  })

  return ws
}

const calculateNewValue = (lastValue) => {
  // -100<= newValue <= +100 arasında kalması için
  let temp = Math.random() * 200 - 100
  let value = temp + lastValue
  console.log('lastValue:', lastValue, 'newValue:', value, 'temp: ', temp)
  /*   while (value > 3000 || value <= 1) {
    value = Math.random() * 200 - 100 + lastValue
    console.log('newValue:', value)
  } */
  return parseFloat(value).toFixed(0)
}
