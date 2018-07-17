
class RTCIceCandidate {
  constructor(data) {
    for(let k in data) {
      this[k] = data[k]
    }
  }
}

export default RTCIceCandidate