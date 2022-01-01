// Helper method for creating channel
function createRabbitChannel(connection, q, logger) {
  return new Promise((resolve, reject) => {
    connection.createChannel(function (error1, channel) {
      try {
        if (error1) {
          throw error1
        }
        logger.log('info', `Created channel and asserted to queue: ${q}`)
        channel.assertQueue(q, {
          durable: false,
        })
        resolve(channel)
      } catch (err) {
        logger.log('error', err, {
          devMsg: "Couldn't create channel for queue: " + q,
        })
        reject(err)
      }
    })
  })
}

// Incoming data validity checker
function checkDataValidity(data) {
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

export { createRabbitChannel, checkDataValidity }
