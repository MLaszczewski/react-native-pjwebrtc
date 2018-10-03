import { native, request } from './native'

class MediaStreamTrack {
  constructor(mediaStream, trackId) {
    this.enabledValue = true
    this.mediaStream = mediaStream;
    this.trackId = trackId;
  }

  get enabled() {
    return this.enabledValue
  }

  set enabled(value) {
    this.enabledValue = false
    request({
      type: "setTrackEnabled",
      trackId: this.trackId,
      enabled: value,
      userMediaId: this.mediaStream.nativeId
    })
  }
}

class MediaStream {
  constructor(nativeId, constraints) {
    this.nativeId = nativeId
    this.tracks = []
    if(!constraints.hasOwnProperty('audio') || constraints.audio) {
      this.tracks.push(new MediaStreamTrack(this, this.tracks.length))
    }
    if(!constraints.hasOwnProperty('video') || constraints.video) {
      this.tracks.push(new MediaStreamTrack(this, this.tracks.length))
    }
  }

  getTracks() {
    return this.tracks
  }

  toURL() {
    return "pjwebrtc-local:///" + this.nativeId
  }
}

function getUserMedia(constraints, successCb, errorCb) {
  let streamPromise = request({ type: "getUserMedia", constraints }).then(msg => {
    return new MediaStream(msg.userMediaId, constraints)
  })
  streamPromise.then((stream) => successCb && successCb(stream)).catch((error) => errorCb && errorCb(error))
  return streamPromise
}

export { getUserMedia }

export default MediaStream
