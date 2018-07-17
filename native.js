import { NativeModules } from 'react-native'
const native =  NativeModules.PJWebRTCModule
import { DeviceEventEmitter } from 'react-native'

let lastRequestId = 0
let peerConnections = new Map()
let responseHandlers = new Map()

DeviceEventEmitter.addListener('PJWebRTCMessage', function(e) {
  console.log("CPP->JS", e)
  const message = JSON.parse(e)
  if(message.responseId) {
    const rid = message.responseId
    responseHandlers.get(rid)(message)
    responseHandlers.delete(rid)
  } else if(message.peerConnectionId) {
    peerConnections.get(message.peerConnectionId).handleNativeMessage(message)
  } else {
    console.log("UNKNOWN NATIVE MESSAGE", e.message)
  }
})

function postMessage(msg) {
  let str = JSON.stringify(msg, null, 2)
  console.log("JS->CPP", str)
  native.postMessage(str)
}

function request(msg) {
  return new Promise((resolve, reject) => {
    const requestId = ++lastRequestId
    responseHandlers.set(requestId, resolve)
    postMessage({ ...msg, requestId })
  })
}

export { peerConnections, request, postMessage }
