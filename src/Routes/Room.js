import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { io } from 'socket.io-client'

import Video from '../Components/video'
import Videos from '../Components/videos'
import CallEndIcon from '@mui/icons-material/CallEnd';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Draggable from '../Components/draggable'
import { CHAT_SERVER_URL } from '../Services/Helper/constant';
import { delay } from '../Services/Helper/common';

class Room extends Component {
  constructor(props) {
    super(props)

    this.state = {
      localStream: null,    // used to hold local stream object to avoid recreating the stream everytime a new offer comes
      remoteStream: null,    // used to hold remote stream object that is displayed in the main screen
      roomId: null,
      remoteStreams: [],    // holds all Video Streams (all remote streams)
      peerConnections: {},  // holds all Peer Connections
      selectedVideo: null,
      muteMyCamera: false,
      muteMyMic: false,
      expand: true,
      typeCamera: 'user',
      status: 'Please wait...',

      pc_config: {
        "iceServers": [
          {
            urls: 'stun:stun.l.google.com:19302'
          }
        ]
      },

      sdpConstraints: {
        'mandatory': {
          'OfferToReceiveAudio': true,
          'OfferToReceiveVideo': true
        }
      },

      messages: [],
      sendChannels: [],
      disconnected: false,
    }

    // DONT FORGET TO CHANGE TO YOUR URL
    this.serviceIP = `${CHAT_SERVER_URL}/webrtcPeer`

    // https://reactjs.org/docs/refs-and-the-dom.html
    // this.localVideoref = React.createRef()
    // this.remoteVideoref = React.createRef()

    this.socket = null
    // this.candidates = []
  }

  getLocalStream = ({ typeCamera: typeCamera }) => {
    // called when getUserMedia() successfully returns - see below
    // getUserMedia() returns a MediaStream object (https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
    const success = (stream) => {
      window.localStream = stream
      // this.localVideoref.current.srcObject = stream
      // this.pc.addStream(stream);
      this.setState({
        localStream: stream
      })

      this.whoisOnline()
    }

    // called when getUserMedia() fails - see below
    const failure = (e) => {
      console.log('getUserMedia Error: ', e)
    }
    const constraints = {
      audio: true,
      video: {
        facingMode: { exact: typeCamera }
      }
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    navigator.mediaDevices.getUserMedia(constraints)
      .then(success)
      .catch(failure)
  }
  switchCam = (typeCamera) => {
    const tracks = this.state.localStream.getTracks();
    // Duyệt qua từng track
    tracks.forEach(track => {
      // Kiểm tra track có phải là video track không
      if (track.kind === 'video') {
        // Dừng track (tắt camera)
        track.stop();
      }
    });
    this.setState({ typeCamera: typeCamera });
    this.getLocalStream({ typeCamera: typeCamera });
  }
  whoisOnline = () => {
    // let all peers know I am joining
    this.sendToPeer('onlinePeers', { userId: this.props?.user?.id }, { local: this.socket.id })
  }

  sendToPeer = (messageType, payload, socketID) => {
    this.socket.emit(messageType, {
      socketID,
      payload
    })
  }

  createPeerConnection = async (socketID, callback) => {

    try {
      let pc = new RTCPeerConnection(this.state.pc_config)

      // add pc to peerConnections object
      const peerConnections = { ...this.state.peerConnections, [socketID]: pc }
      this.setState({
        peerConnections
      })

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          this.sendToPeer('candidate', e.candidate, {
            local: this.socket.id,
            remote: socketID
          })
        }
      }

      pc.oniceconnectionstatechange = (e) => {
        // if (pc.iceConnectionState === 'disconnected') {
        //   const remoteStreams = this.state.remoteStreams.filter(stream => stream.id !== socketID)

        //   this.setState({
        //     remoteStream: remoteStreams.length > 0 && remoteStreams[0].stream || null,
        //   })
        // }

      }

      pc.ontrack = (e) => {

        let _remoteStream = null
        let remoteStreams = this.state.remoteStreams
        let remoteVideo = {}


        // 1. check if stream already exists in remoteStreams
        const rVideos = this.state.remoteStreams.filter(stream => stream.id === socketID)

        // 2. if it does exist then add track
        if (rVideos.length) {
          _remoteStream = rVideos[0].stream
          _remoteStream.addTrack(e.track, _remoteStream)

          remoteVideo = {
            ...rVideos[0],
            stream: _remoteStream,
          }
          remoteStreams = this.state.remoteStreams.map(_remoteVideo => {
            return _remoteVideo.id === remoteVideo.id && remoteVideo || _remoteVideo
          })
        } else {
          // 3. if not, then create new stream and add track
          _remoteStream = new MediaStream()
          _remoteStream.addTrack(e.track, _remoteStream)

          remoteVideo = {
            id: socketID,
            name: socketID,
            stream: _remoteStream,
          }
          remoteStreams = [...this.state.remoteStreams, remoteVideo]
        }

        // const remoteVideo = {
        //   id: socketID,
        //   name: socketID,
        //   stream: e.streams[0]
        // }

        this.setState(prevState => {

          // If we already have a stream in display let it stay the same, otherwise use the latest stream
          // const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: e.streams[0] }
          const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: _remoteStream }

          // get currently selected video
          let selectedVideo = prevState.remoteStreams.filter(stream => stream.id === prevState.selectedVideo.id)
          // if the video is still in the list, then do nothing, otherwise set to new video stream
          selectedVideo = selectedVideo.length ? {} : { selectedVideo: remoteVideo }

          return {
            // selectedVideo: remoteVideo,
            ...selectedVideo,
            // remoteStream: e.streams[0],
            ...remoteStream,
            remoteStreams, //: [...prevState.remoteStreams, remoteVideo]
          }
        })
      }

      pc.close = () => {
        // alert('GONE')
        console.log("pc closed");
      }

      if (this.state.localStream)
        // pc.addStream(this.state.localStream)
        // await delay(1000);
        this.state.localStream.getTracks().forEach(track => {
          pc.addTrack(track, this.state.localStream)
        })

      // return pc
      callback(pc)

    } catch (e) {
      console.log('Something went wrong! pc not created!!', e)
      // return;
      callback(null)
    }
  }

  componentDidMount = () => {
    const { location, roomId } = this.props;
    console.log('roomId', roomId);
    this.state.roomId = roomId;
    // if (!this.state.roomId) window.location.href = '/'
    this.socket = io(
      this.serviceIP,
      {
        path: '/io/webrtc',
        query: {
          room: this.state.roomId,
        }
      }
    )

    this.socket.on('connection-success', data => {

      this.getLocalStream({ typeCamera: 'user' })

      // console.log(data.success)
      const status = data.peerCount > 1 ? `Total Connected Peers to room ${this.state.roomId}: ${data.peerCount}` : `Waiting for other peers to connect ${this.state.roomId}`

      this.setState({
        status: status,
        messages: data.messages
      })
    })

    this.socket.on('joined-peers', data => {

      this.setState({
        status: data.peerCount > 1 ? `Total Connected Peers to room ${this.state.roomId}: ${data.peerCount}` : `Waiting for other peers to connect ${this.state.roomId}`
      })
    })

    // ************************************* //
    // ************************************* //
    this.socket.on('peer-disconnected', data => {

      // close peer-connection with this peer
      this.state.peerConnections[data.socketID].close()

      // get and stop remote audio and video tracks of the disconnected peer
      const rVideo = this.state.remoteStreams.filter(stream => stream.id === data.socketID)
      rVideo && this.stopTracks(rVideo[0]?.stream)

      // filter out the disconnected peer stream
      const remoteStreams = this.state.remoteStreams.filter(stream => stream.id !== data.socketID)

      this.setState(prevState => {
        // check if disconnected peer is the selected video and if there still connected peers, then select the first
        const selectedVideo = prevState.selectedVideo.id === data.socketID && remoteStreams.length ? { selectedVideo: remoteStreams[0] } : null

        return {
          // remoteStream: remoteStreams.length > 0 && remoteStreams[0].stream || null,
          remoteStreams,
          ...selectedVideo,
          status: data.peerCount > 1 ? `Total Connected Peers to room ${this.state.roomId}: ${data.peerCount}` : `Waiting for other peers to connect room ${this.state.roomId}`
        }
      }
      )
    })

    this.socket.on('online-peer', socketID => {
      // console.log('connected peers ...', socketID)

      // create and send offer to the peer (data.socketID)
      // 1. Create new pc
      this.createPeerConnection(socketID, pc => {
        // 2. Create Offer
        if (pc) {

          // Send Channel
          const handleSendChannelStatusChange = (event) => {
            console.log('send channel status: ' + this.state.sendChannels[0].readyState)
          }

          const sendChannel = pc.createDataChannel('sendChannel')
          sendChannel.onopen = handleSendChannelStatusChange
          sendChannel.onclose = handleSendChannelStatusChange

          this.setState(prevState => {
            return {
              sendChannels: [...prevState.sendChannels, sendChannel]
            }
          })

          // Receive Channels
          const handleReceiveMessage = (event) => {
            const message = JSON.parse(event.data)
            // console.log(message)
            this.setState(prevState => {
              return {
                messages: [...prevState.messages, message]
              }
            })
          }

          const handleReceiveChannelStatusChange = (event) => {
            if (this.receiveChannel) {
              console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
            }
          }

          const receiveChannelCallback = (event) => {
            const receiveChannel = event.channel
            receiveChannel.onmessage = handleReceiveMessage
            receiveChannel.onopen = handleReceiveChannelStatusChange
            receiveChannel.onclose = handleReceiveChannelStatusChange
          }

          pc.ondatachannel = receiveChannelCallback


          pc.createOffer(this.state.sdpConstraints)
            .then(sdp => {
              pc.setLocalDescription(sdp)

              this.sendToPeer('offer', sdp, {
                local: this.socket.id,
                remote: socketID
              })
            })
        }
      })
    })

    this.socket.on('offer', data => {
      this.createPeerConnection(data.socketID, pc => {
        pc.addStream(this.state.localStream)

        // Send Channel
        const handleSendChannelStatusChange = (event) => {
          console.log('send channel status: ' + this.state.sendChannels[0].readyState)
        }

        const sendChannel = pc.createDataChannel('sendChannel')
        sendChannel.onopen = handleSendChannelStatusChange
        sendChannel.onclose = handleSendChannelStatusChange

        this.setState(prevState => {
          return {
            sendChannels: [...prevState.sendChannels, sendChannel]
          }
        })

        // Receive Channels
        const handleReceiveMessage = (event) => {
          const message = JSON.parse(event.data)
          // console.log(message)
          this.setState(prevState => {
            return {
              messages: [...prevState.messages, message]
            }
          })
        }

        const handleReceiveChannelStatusChange = (event) => {
          if (this.receiveChannel) {
            console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
          }
        }

        const receiveChannelCallback = (event) => {
          const receiveChannel = event.channel
          receiveChannel.onmessage = handleReceiveMessage
          receiveChannel.onopen = handleReceiveChannelStatusChange
          receiveChannel.onclose = handleReceiveChannelStatusChange
        }

        pc.ondatachannel = receiveChannelCallback

        pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
          // 2. Create Answer
          pc.createAnswer(this.state.sdpConstraints)
            .then(sdp => {
              pc.setLocalDescription(sdp)

              this.sendToPeer('answer', sdp, {
                local: this.socket.id,
                remote: data.socketID
              })
            })
        })
      })
    })

    this.socket.on('answer', data => {
      // get remote's peerConnection
      const pc = this.state.peerConnections[data.socketID]
      // console.log(data.sdp)
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => { })
    })

    this.socket.on('candidate', (data) => {
      // get remote's peerConnection
      const pc = this.state.peerConnections[data.socketID]

      if (pc)
        pc.addIceCandidate(new RTCIceCandidate(data.candidate))
    })

    // const pc_config = null

    // const pc_config = {
    //   "iceServers": [
    //     // {
    //     //   urls: 'stun:[STUN_IP]:[PORT]',
    //     //   'credentials': '[YOR CREDENTIALS]',
    //     //   'username': '[USERNAME]'
    //     // },
    //     {
    //       urls : 'stun:stun.l.google.com:19302'
    //     }
    //   ]
    // }

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection
    // create an instance of RTCPeerConnection
    // this.pc = new RTCPeerConnection(this.state.pc_config)

    // triggered when a new candidate is returned
    // this.pc.onicecandidate = (e) => {
    //   // send the candidates to the remote peer
    //   // see addCandidate below to be triggered on the remote peer
    //   if (e.candidate) {
    //     // console.log(JSON.stringify(e.candidate))
    //     this.sendToPeer('candidate', e.candidate)
    //   }
    // }

    // triggered when there is a change in connection state
    // this.pc.oniceconnectionstatechange = (e) => {
    //   console.log(e)
    // }

    // triggered when a stream is added to pc, see below - this.pc.addStream(stream)
    // this.pc.onaddstream = (e) => {
    //   this.remoteVideoref.current.srcObject = e.stream
    // }

    // this.pc.ontrack = (e) => {
    //   debugger
    //   // this.remoteVideoref.current.srcObject = e.streams[0]

    //   this.setState({
    //     remoteStream: e.streams[0]
    //   })
    // }

  }

  // ************************************* //
  // NOT REQUIRED
  // ************************************* //
  disconnectSocket = (socketToDisconnect) => {
    this.sendToPeer('socket-to-disconnect', null, {
      local: this.socket.id,
      remote: socketToDisconnect
    })
  }

  switchVideo = (_video) => {
    // console.log(_video)
    this.setState({
      selectedVideo: _video
    })
  }

  // ************************************* //
  // ************************************* //
  stopTracks = async (stream) => {
    // await delay(1000);
    stream.getTracks().forEach(track => track.stop())
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.disconnected) {
      this.props.handleEndCall();
    }
  }
  render() {
    const {
      status,
      messages,
      disconnected,
      localStream,
      peerConnections,
      remoteStreams,
    } = this.state

    if (disconnected) {
      // disconnect socket
      this.socket && this.socket.close()
      // stop local audio & video tracks
      this.stopTracks(localStream)

      // stop all remote audio & video tracks
      remoteStreams.forEach(rVideo => this.stopTracks(rVideo.stream))

      // stop all remote peerconnections
      peerConnections && Object.values(peerConnections).forEach(pc => pc.close())
      // this.props.handleEndCall()
      return null;
    }

    const statusText = <div style={{ color: 'yellow', padding: 5 }}>{status}</div>
    console.log('this.state.muteMyCamera', this.state.muteMyCamera)
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        zIndex: 100,
        height: this.state.expand ? '100vh': '7vh',
        width: '100%',
        backgroundColor: 'black'
      }}>
        <div onClick={(e) => {
          this.setState({expand: !this.state.expand})
        }} style={{
          borderRadius: 20,
          width: 40,
          height: 40,
          margin: '5px 0px 0px 10px',
          display: this.state.expand ? '' : 'none',
          position: 'absolute'
        }}>
          <ExpandLessIcon style={{ fontSize: 25, color: 'white', marginTop: 7 }} />
        </div>
        <div onClick={(e) => {
          this.setState({expand: !this.state.expand})
        }} style={{
          borderRadius: 20,
          width: 40,
          height: 40,
          margin: '5px 0px 0px 10px',
          display: !this.state.expand ? '' : 'none',
          position: 'absolute'
        }}>
          <ExpandMoreIcon style={{ fontSize: 25, color: 'white', marginTop: 7 }} />
        </div>
        
        <Draggable style={{
          zIndex: 101,
          position: 'absolute',
          right: 0,
          cursor: 'move',
          display: this.state.expand ? '' : 'none'
        }}>
          <Video
            videoType='localVideo'
            videoStyles={{
              width: 200,
              borderRadius: '10%',
              maxHeight: 200
            }}
            frameStyle={{
              display: 'inline-block',
              // backgroundColor: 'black',
            }}
            mutecamera={this.state.muteMyCamera}
            mutemic={this.state.muteMyMic}
            myVideo={true}
            showMuteControls={false}
            videoStream={localStream}
            autoPlay muted>
          </Video>
        </Draggable>
        <br />
        <div style={{
          zIndex: 3,
          position: 'absolute',
          bottom: 20,
          textAlign: 'center',
          width: '75%',
          left: `50%`, transform: `translate(-50%, -50%)`,
          display: this.state.expand ? '' : 'none'
        }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* <div onClick={(e) => {
              this.switchCam(this.state.typeCamera === 'user' ? 'environment' : 'user');
            }} style={{
              borderRadius: 20,
              width: 40,
              height: 40
            }}>
              <CameraswitchIcon style={{ fontSize: 25, color: 'white', marginTop: 7 }} />
            </div> */}
            <i onClick={() => this.setState({ muteMyMic: !this.state.muteMyMic })}
              style={{ cursor: 'pointer', padding: 5, fontSize: 25, color: 'white' }} className='material-icons'>{!this.state.muteMyMic && 'mic' || 'mic_off'}</i>
            <i onClick={() => this.setState({ muteMyCamera: !this.state.muteMyCamera })}
              style={{ cursor: 'pointer', padding: 5, fontSize: 25, color: 'white' }} className='material-icons'>{!this.state.muteMyCamera && 'videocam' || 'videocam_off'}</i>
            <div onClick={(e) => { this.setState({ disconnected: true }); }} style={{
              borderRadius: 20,
              width: 40,
              height: 40,
              backgroundColor: 'red'
            }}>
              <CallEndIcon style={{ fontSize: 25, color: 'white', marginTop: 7 }} />
            </div>
          </div>
        </div>
        <div>
          <Videos
            switchVideo={this.switchVideo}
            remoteStreams={remoteStreams}
          ></Videos>
        </div>
        <br />
      </div>
    )
  }
}

export default Room;