const connectToRabbit = require('./connectToRabbit')

const dataQueue = 'Wipelot_data'
const devicesQueue = 'Connected_Devices'

const messages = []
let devices = { code: 1, data: null }
let connections = new Set()

class Connection {
  constructor(io, socket, logger) {
    this.socket = socket
    this.io = io
    this.logger = logger
    this.reference = null
    this.interval = null
    socket.on('disconnect', () => this.disconnect())
    socket.on('connect_error', (err) => {
      this.logger.log({
        level: 'error',
        message: `connect_error due to ${err.message}`,
      })
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

  disconnect() {
    clearInterval(this.interval)
    let isDeleted = connections.delete(this.reference)
    this.logger.log({
      level: 'error',
      message: `One userinterface disconnected, deleted from list: ${isDeleted}, ${JSON.stringify(
        this.socket.handshake
      )}`,
    })
  }
}

async function middleware(io, logger) {
  let { dataChannel, devicesChannel } = await connectToRabbit(
    dataQueue,
    devicesQueue,
    logger
  )

  if (dataChannel && devicesChannel) {
    consumeDataChannel(dataChannel)
    consumeDevicesChannel(devicesChannel, logger)

    io.on('connection', (socket) => {
      let conn = new Connection(io, socket, logger)
      logger.log({
        level: 'info',
        message: `New connection: ${JSON.stringify(socket.handshake)}`,
      })
      conn.setReference(conn)
      connections.add(conn)
      conn.sendMessage(devices)

      let interval = setInterval(() => {
        let toSend = { code: 0, data: messages }
        conn.sendMessage(toSend)
      }, 1000)

      conn.setIntervalRef(interval)
    })
  }
}
function consumeDataChannel(dataChannel) {
  dataChannel.consume(dataQueue, function (msg) {
    if (msg !== null) {
      let parsedMsg = JSON.parse(msg.content)
      let index = messages.findIndex(
        (message) => message.socketUniqueNumber === parsedMsg.socketUniqueNumber
      )
      if (index !== -1) {
        messages[index].value = parsedMsg.value
        messages[index].timestamp = parsedMsg.timestamp
      }
      dataChannel.ack(msg)
    }
  })
}

function consumeDevicesChannel(devicesChannel, logger) {
  devicesChannel.consume(devicesQueue, function (msg) {
    if (msg !== null) {
      let parsedMsg = JSON.parse(msg.content)
      logger.log({
        level: 'info',
        message: `Devices List: ${JSON.stringify(parsedMsg)}`,
      })
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

module.exports = middleware
