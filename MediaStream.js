import { native, request } from './native'

class MediaStream {
  constructor(nativeId) {
    this.nativeId = nativeId
  }

  toURL() {
    return "pjwebrtc-local:///" + this.nativeId
  }
}

function getUserMedia(constraints, successCb, errorCb) {
  let streamPromise = request({ type: "getUserMedia", constraints }).then(msg => {
    return new MediaStream(msg.userMediaId)
  })
  streamPromise.then((stream) => successCb && successCb(stream)).catch((error) => errorCb && errorCb(error))
  return streamPromise
}

export { getUserMedia }

export default MediaStream
