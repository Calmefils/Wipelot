// Checks if connection is still alive
const heartbeat = (ws) => {
  clearTimeout(ws.pingTimeout)

  // Use `WebSocket#terminate()`, which immediately destroys the connection,
  // instead of `WebSocket#close()`, which waits for the close timer.
  // Delay should be equal to the interval at which your server
  // sends out pings plus a conservative assumption of the latency.
  ws.pingTimeout = setTimeout(() => {
    ws.terminate()
  }, 5000 + 1000)
}

export default heartbeat
