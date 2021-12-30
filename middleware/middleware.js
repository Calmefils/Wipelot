const connectToRabbit = require('./connectToRabbit')

const messageExpirationTimeMS = 5 * 60 * 1000
const dataQueue = 'Wipelot_data'
const devicesQueue = 'Connected_Devices'

const messages = []
let latestMessage = { code: 0, data: null }
let devices = { code: 1, data: null }
let connections = new Set()

class Connection {
  constructor(io, socket) {
    this.socket = socket
    this.io = io
    this.reference = null
    this.interval = null
    //socket.on('getMessages', () => this.getMessages())
    socket.on('connect', () => {
      console.log('connected')
      this.sendMessage(devices)
    })
    //socket.on('message', (value) => this.handleMessage(value))
    socket.on('disconnect', () => this.disconnect())
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`)
    })
  }
  setReference(ref) {
    this.reference = ref
  }
  setIntervalRef(interval) {
    this.interval = interval
  }

  sendMessage(message) {
    this.io.sockets.emit('message', message)
  }

  /*  getMessages() {
    messages.forEach((message) => this.sendMessage(message))
  } */

  /*   handleMessage(data) {
    this.sendMessage(data)

         setTimeout(() => {
      //messages.delete(message)
      this.io.sockets.emit('deleteMessage', message.id)
    }, messageExpirationTimeMS) 
  } */

  disconnect() {
    //users.delete(this.socket)
    clearInterval(this.interval)
    console.log(
      'One userinterface disconnected, deleted from list',
      connections.delete(this.reference)
    )
  }
}

async function middleware(io) {
  let { dataChannel, devicesChannel } = await connectToRabbit(
    dataQueue,
    devicesQueue
  )

  if (dataChannel && devicesChannel) {
    dataChannel.consume(dataQueue, function (msg) {
      if (msg !== null) {
        //console.log(msg.content.toString())
        let parsedMsg = JSON.parse(msg.content)
        let index = messages.findIndex(
          (message) =>
            message.socketUniqueNumber === parsedMsg.socketUniqueNumber
        )
        if (index !== -1) {
          messages[index].value = parsedMsg.value
          messages[index].timestamp = parsedMsg.timestamp
        }
        dataChannel.ack(msg)
      }
    })

    devicesChannel.consume(devicesQueue, function (msg) {
      if (msg !== null) {
        //console.log(msg.content.toString())
        let parsedMsg = JSON.parse(msg.content)
        console.log('New Devices List: ', parsedMsg)
        devices = { code: 1, data: parsedMsg }
        messages.length = 0
        for (let device of parsedMsg) {
          if (messages.length === 0) {
            messages.push({
              socketUniqueNumber: device.socketUniqueNumber,
            })
          } else {
            let included = messages.includes(
              (message) =>
                message.socketUniqueNumber === device.socketUniqueNumber
            )
            if (!included) {
              messages.push({
                socketUniqueNumber: device.socketUniqueNumber,
              })
            }
          }
        }
        if (connections.size > 0) {
          connections.forEach((conn) => {
            conn.sendMessage(devices)
          })
        }
        devicesChannel.ack(msg)
      }
    })
  }

  io.on('connection', (socket) => {
    console.log('New connection')
    let conn = new Connection(io, socket)
    conn.setReference(conn)
    connections.add(conn)
    conn.sendMessage(devices)

    let interval = setInterval(() => {
      let toSend = { code: 0, data: messages }
      console.log(toSend)
      conn.sendMessage(toSend)
    }, 1000)

    conn.setIntervalRef(interval)
  })
}

module.exports = middleware
