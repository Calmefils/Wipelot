const connectToRabbit = require('./connectToRabbit')

// RabbitMQ queue names
const dataQueue = 'Wipelot_data'
const devicesQueue = 'Connected_Devices'

const messages = [] // Storing data at 1000ms frequency
let devices = { code: 1, data: null } // Storing devices data
let connections = new Set() // Storing connected user interfaces

class Connection {
  // Every connection has one instance created from Connection class
  constructor(io, socket, logger) {
    this.socket = socket
    this.io = io
    this.logger = logger
    this.reference = null
    this.interval = null
    // Catching disconnect event
    socket.on('disconnect', () => this.disconnect())
    // Catching connect_error event
    socket.on('connect_error', (err) => {
      this.logger.log({
        level: 'error',
        message: `connect_error due to ${err.message}`,
      })
    })
  }
  // Setter method for instance reference
  setReference(ref) {
    this.reference = ref
  }
  // Setter method for interval reference
  setIntervalRef(interval) {
    this.interval = interval
  }
  // Message sender to client helper method
  sendMessage(message) {
    this.io.sockets.emit('message', message)
  }
  // On disconnect helper method
  disconnect() {
    clearInterval(this.interval) // Clearing loop to send data every second for this connection
    let isDeleted = connections.delete(this.reference) // Deleting the reference from the connection list
    this.logger.log({
      level: 'error',
      message: `One userinterface disconnected, deleted from list: ${isDeleted}, ${JSON.stringify(
        this.socket.handshake
      )}`,
    })
  }
}
// This function is triggered after websocket server ran at www server
async function middleware(io, logger) {
  // Connection to RabbitMQ server
  let { dataChannel, devicesChannel } = await connectToRabbit(
    dataQueue,
    devicesQueue,
    logger
  )
  // If connected to RabbitMQ and created the channels then consume queues
  if (dataChannel && devicesChannel) {
    consumeDataChannel(dataChannel) // Consume Wipelot_data queue
    consumeDevicesChannel(devicesChannel, logger) // Consume Connected_device queue
    // At every connection from user interface this "connection" event will be triggered.
    io.on('connection', (socket) => {
      let conn = new Connection(io, socket, logger) // Creating an instance for this connection
      logger.log({
        level: 'info',
        message: `New connection: ${JSON.stringify(socket.handshake)}`,
      })
      conn.setReference(conn) // Setting reference
      connections.add(conn) // Adding connection to the all connections list
      conn.sendMessage(devices) // Sending connected devices info to the user interface
      // Setting interval to send consumed data from the Wipelot_data queue every second
      let interval = setInterval(() => {
        let toSend = { code: 0, data: messages } // Regular data has the code 0
        conn.sendMessage(toSend)
      }, 1000)

      conn.setIntervalRef(interval) // Setting interval reference
    })
  }
}
// Consumer helper method for Wipelot_data queue
function consumeDataChannel(dataChannel) {
  dataChannel.consume(dataQueue, function (msg) {
    if (msg !== null) {
      let parsedMsg = JSON.parse(msg.content)
      // Trying to find index of the incoming data in messages list
      let index = messages.findIndex(
        (message) => message.socketUniqueNumber === parsedMsg.socketUniqueNumber
      )
      // If index is found then save the data
      if (index !== -1) {
        messages[index].value = parsedMsg.value
        messages[index].timestamp = parsedMsg.timestamp
      }
      dataChannel.ack(msg)
    }
  })
}
// Consumer helper method for Connected_Devices queue
function consumeDevicesChannel(devicesChannel, logger) {
  devicesChannel.consume(devicesQueue, function (msg) {
    if (msg !== null) {
      let parsedMsg = JSON.parse(msg.content)
      logger.log({
        level: 'info',
        message: `Devices List: ${JSON.stringify(parsedMsg)}`,
      })
      devices = { code: 1, data: parsedMsg } // Devices data has the code 1
      messages.length = 0 // Clearing the list
      // Incoming devices data is an array, so we loop through it
      for (let device of parsedMsg) {
        if (messages.length === 0) {
          // If array is empty, just push the data
          messages.push({
            socketUniqueNumber: device.socketUniqueNumber,
          })
        } else {
          // If array is not empty then we need to check the list if this device is already on the list or not.
          let included = messages.includes(
            (message) =>
              message.socketUniqueNumber === device.socketUniqueNumber
          )
          if (!included) {
            // If included just pass, if not push it
            messages.push({
              socketUniqueNumber: device.socketUniqueNumber,
            })
          }
        }
      }
      if (connections.size > 0) {
        // If there is active connection(s)
        connections.forEach((conn) => {
          conn.sendMessage(devices) // Send devices data to all connections
        })
      }
      devicesChannel.ack(msg)
    }
  })
}

module.exports = middleware
