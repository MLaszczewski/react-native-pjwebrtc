import EventEmitter from 'eventemitter3'
import { peerConnections, native, request } from './native'
import RTCIceCandidate from './RTCIceCandidate'

class RTCPeerConnectionIceEvent {
  constructor(candidate) {
    this.candidate = candidate
  }
}

class StateChangeEvent {
  constructor(type, eventInitDict) {
    this.type = type
    Object.assign(this, eventInitDict)
  }
}

class MediaStreamEvent {
  constructor(type, eventInitDict) {
    this.type = type
    Object.assign(this, eventInitDict)
  }
}

class RTCPeerConnection extends EventEmitter {
  constructor(config) {
    super()

    this.nativeId = null
    this.nativeQueue = []

    this.connectionState = "new"
    this.iceConnectionState = "new"
    this.iceGatheringState = "new"
    this.signalingState = "stable"

    this.needNullCandidate = true

    request({
      type: "createPeerConnection",
      config
    }).then(msg => {
      this.nativeId = msg.peerConnectionId
      peerConnections.set(this.nativeId, this)
      for(let fun of this.nativeQueue) fun()
    })
  }

  doWhenReady(fun) {
    if(this.nativeId) return fun()
    this.nativeQueue.push(fun)
  }

  postNativeMessage(msg) {
    this.doWhenReady(() => native.postMessage({ ...msg, peerConnectionId: this.nativeId }))
  }

  nativeRequest(msg) {
    return new Promise((resolve, reject) => this.doWhenReady(() => {
      request({ ...msg, peerConnectionId: this.nativeId  }).then(resolve).catch(reject)
    }))
  }

  emitEvent(eventType, event) {
    this.emit(eventType, event)
    let f = this['on'+eventType]
    if(f) f(event)
  }

  handleNativeMessage(msg) {
    switch(msg.type) {
      case "iceCandidate":
        this.emitEvent("icecandidate", new RTCPeerConnectionIceEvent(
            msg.candidate ? new RTCIceCandidate(msg.candidate) : null
        ))
        break;
      case "connectionStateChange":
        this.connectionState = msg.connectionState
        this.emitEvent("connectionstatechange", new StateChangeEvent( "connectionstatechange", {
          state: this.connectionState,
          target: this
        }))
        break;
      case "iceConnectionStateChange":
        this.iceConnectionState = msg.iceConnectionState
        this.emitEvent("iceconnectionstatechange", new StateChangeEvent( "iceconnectionstatechange", {
          state: this.iceConnectionState,
          target: this
        }))
        break;
      case "iceGatheringStateChange":
        this.iceGatheringState = msg.iceConnectionState
        this.emitEvent("icegatheringstatechange", new StateChangeEvent( "icegatheringtatechange", {
          state: this.iceGatheringState,
          target: this
        }))
        break;
      case "signalingStateChange":
        this.signalingState = msg.signalingState
        this.emitEvent("signalingstatechange", new StateChangeEvent( "signalingstatechange", {
          state: this.signalingState,
          target: this
        }))
        break;
      case "streamAdded":
        this.emitEvent(new MediaStreamEvent('addstream', {stream}))
        break;
    }
  }

  addStream(userMedia, successCb, errorCb) {
    let promise = this.nativeRequest({
      type: "addStream",
      userMediaId: userMedia.nativeId
    })
    promise.then((result) => successCb && successCb(result)).catch((error) => errorCb && errorCb(error))
    promise.then((result) => this.emitEvent("negotiationneeded"))
    return promise
  }

  setLocalDescription(sdp, successCb, errorCb) {
    let promise = this.nativeRequest({
      type: "setLocalDescription",
      sdp
    }).then((result) => {
      console.log("LOCALDESCRSET", sdp)
      this.localDescription = sdp
      return result
    })
    promise.then((result) => successCb && successCb(result)).catch((error) => errorCb && errorCb(error))
    return promise
  }

  setRemoteDescription(sdp, successCb, errorCb) {
    let promise = this.nativeRequest({
      type: "setRemoteDescription",
      sdp
    }).then((result) => {
      this.remoteDescription = sdp
      return result
    })
    promise.then((result) => successCb && successCb(result)).catch((error) => errorCb && errorCb(error))
    return promise
  }

  addIceCandidate(ice) {
    return this.nativeRequest({
      type: "addIceCandidate",
      ice
    })
  }

  createOffer(...args) {
    if(args.length > 1) {
      return this.nativeRequest({
        type: "createOffer"
      }).then(msg => args[0](msg.sdp))
    } else {
      return this.nativeRequest({
        type: "createOffer"
      })
    }
  }

  createAnswer(...args) {
    if(args.length > 1) {
      return this.nativeRequest({
        type: "createAnswer"
      }).then((msg) => args[0](msg.sdp))
    } else {
      return this.nativeRequest({
        type: "createAnswer"
      })
    }
  }

  close() {
    return this.nativeRequest({ type: "close" }).then(() => {
      return this.postNativeMessage({ type: "delete" })
    })
  }
}


export default RTCPeerConnection
