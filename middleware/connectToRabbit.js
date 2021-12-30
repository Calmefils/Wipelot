var amqp = require('amqplib/callback_api')

async function connectToRabbit(dataQueue, devicesQueue) {
  /**
   * Connect RabbitMQ server & consume
   */
  let connection = await connect()
  if (connection != null) {
    let dataChannel = await connectToQueue(connection, dataQueue)
    let devicesChannel = await connectToQueue(connection, devicesQueue)
    return { dataChannel, devicesChannel }
  } else return null
}

function connect() {
  return new Promise((resolve, reject) => {
    amqp.connect('amqp://localhost', function (error0, connection) {
      if (error0) {
        console.error(
          "Couldn't connect to RabbitMQ server. May be it's closed?"
        )
        throw error0
      }
      resolve(connection)
    })
  })
}

function connectToQueue(connection, queue) {
  return new Promise((resolve, reject) => {
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1
      }
      console.log('Connected to queue ' + queue)

      channel.assertQueue(queue, {
        durable: false,
      })
      resolve(channel)
    })
  })
}

module.exports = connectToRabbit
