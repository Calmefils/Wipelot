import _ from 'lodash'
function generateLayout(devices, size) {
  return devices.map(function (item, index) {
    return {
      x: (index % 5) * 2,
      y: (index / 5) * 2,
      w: 2,
      h: 2,
      i: index.toString(),
      minH: 2,
      minW: 2,
      socketUniqueNumber: item.socketUniqueNumber,
    }
  })
}

export default generateLayout
