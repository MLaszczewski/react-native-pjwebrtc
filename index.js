import { NativeModules, View } from 'react-native'
import React, { Component } from 'react'
const native =  NativeModules.PJWebRTCModule

import RTCPeerConnection from "./RTCPeerConnection"
import RTCIceCandidate from "./RTCIceCandidate"
import RTCSessionDescription from "./RTCSessionDescription"
import { getUserMedia } from "./MediaStream"

class MediaStreamTrack {

}

class RTCView extends Component {
  render() {
    return  <View></View>
  }
}

export {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStreamTrack,
  RTCView,
  getUserMedia
}