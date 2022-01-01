var amqp = require('amqplib/callback_api')

//RabbitMQ server address, if this runs on docker amqp://rabbit or appropriate container name, if this runs on local machine use amqp://localhost
const address = 'amqp://rabbit'

async function connectToRabbit(dataQueue, devicesQueue, logger) {
  /**
   * Connect RabbitMQ server & consume
   */
  let connection = await connect(logger)
  if (connection != null) {
    let dataChannel = await connectToQueue(connection, dataQueue, logger)
    let devicesChannel = await connectToQueue(connection, devicesQueue, logger)
    return { dataChannel, devicesChannel }
  } else return null
}

function connect(logger) {
  return new Promise((resolve, reject) => {
    amqp.connect(address, function (error0, connection) {
      if (error0) {
        logger.log(
          'error',
          "Couldn't connect to RabbitMQ server. May be it's closed?",
          error0
        )
        reject(error0)
      }
      logger.log({
        level: 'info',
        message: `Connected to RabbitMQ Server`,
      })
      resolve(connection)
    })
  })
}

function connectToQueue(connection, queue, logger) {
  return new Promise((resolve, reject) => {
    connection.createChannel(function (error1, channel) {
      if (error1) {
        logger.log('error', `Couldn't create the channel: ${channel}`, error1)
        reject(error1)
      }
      logger.log({
        level: 'info',
        message: 'Connected to queue ' + queue,
      })
      channel.assertQueue(queue, {
        durable: false,
      })
      resolve(channel)
    })
  })
}

module.exports = connectToRabbit
