import WebSocket from 'ws'
import heartbeat from './heartbeat'

const socketAddress = 'ws://localhost:7000'

const createNewConnection = () => {
  const ws = new WebSocket(socketAddress)
  ws.on('open', () => {
    heartbeat(ws)
  })

  ws.on('message', (data) => {
    console.log('received: %s', data)
  })

  ws.on('ping', () => {
    heartbeat(ws)
  })

  ws.on('close', () => {
    console.log(`Connection closed`)
  })

  ws.on('error', (err) => {
    console.log(err)
  })

  return ws
}

export default createNewConnection
