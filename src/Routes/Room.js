import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { io } from 'socket.io-client'

import Video from '../Components/video'
import Videos from '../Components/videos'
import CallEndIcon from '@mui/icons-material/CallEnd';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import MoodIcon from '@mui/icons-material/Mood';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import PanToolIcon from '@mui/icons-material/PanTool';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FavoriteIcon from '@mui/icons-material/Favorite';
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
      showEmoji: false,
      cams: [],
      camIndex: 0,
      status: 'Please wait...',

      pc_config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          {
            urls: 'turn:hk-turn1.xirsys.com:80?transport=udp',
            username: 'tSH4W-UfQFcDjiMRR8xlse_Cu92GD_ajaOzASFOstKbzliOBFUF--SdwY0ae3aKUAAAAAGSlE5hjcmFja2VydHZu',
            credential: 'c1c8371a-1b00-11ee-ba7a-0242ac120004'
          },
          {
            urls: 'turn:hk-turn1.xirsys.com:3478?transport=udp',
            username: 'tSH4W-UfQFcDjiMRR8xlse_Cu92GD_ajaOzASFOstKbzliOBFUF--SdwY0ae3aKUAAAAAGSlE5hjcmFja2VydHZu',
            credential: 'c1c8371a-1b00-11ee-ba7a-0242ac120004'
          },
          {
            urls: 'turn:hk-turn1.xirsys.com:80?transport=tcp',
            username: 'tSH4W-UfQFcDjiMRR8xlse_Cu92GD_ajaOzASFOstKbzliOBFUF--SdwY0ae3aKUAAAAAGSlE5hjcmFja2VydHZu',
            credential: 'c1c8371a-1b00-11ee-ba7a-0242ac120004'
          },
          {
            urls: 'turn:hk-turn1.xirsys.com:3478?transport=tcp',
            username: 'tSH4W-UfQFcDjiMRR8xlse_Cu92GD_ajaOzASFOstKbzliOBFUF--SdwY0ae3aKUAAAAAGSlE5hjcmFja2VydHZu',
            credential: 'c1c8371a-1b00-11ee-ba7a-0242ac120004'
          },
          {
            urls: 'turns:hk-turn1.xirsys.com:443?transport=tcp',
            username: 'tSH4W-UfQFcDjiMRR8xlse_Cu92GD_ajaOzASFOstKbzliOBFUF--SdwY0ae3aKUAAAAAGSlE5hjcmFja2VydHZu',
            credential: 'c1c8371a-1b00-11ee-ba7a-0242ac120004'
          },
          {
            urls: 'turns:hk-turn1.xirsys.com:5349?transport=tcp',
            username: 'tSH4W-UfQFcDjiMRR8xlse_Cu92GD_ajaOzASFOstKbzliOBFUF--SdwY0ae3aKUAAAAAGSlE5hjcmFja2VydHZu',
            credential: 'c1c8371a-1b00-11ee-ba7a-0242ac120004'
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
  getVideoDevices = () => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const filtered = devices.filter((device) => device.kind === 'videoinput');
          resolve(filtered);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  getLocalStream = (device) => {
    try {
      const constraints = {
        audio: true,
        video: {
          deviceId: {
            exact: device?.deviceId
          },
          width: { ideal: 480 },
          height: { ideal: 640 }
        }
      }
      return navigator.mediaDevices.getUserMedia(constraints)
      // .then(success)
      // .catch(failure)
      // navigator.mediaDevices.getDisplayMedia({
      //   video: {
      //     cursor: "always"
      //   },
      //   audio: false
      // }).then(success).catch(failure);
    }
    catch (e) {
      console.error(e);
    }
  }
  switchCam = async () => {
    try {
      this.state.localStream.getTracks().forEach(track => track.stop());
      let camIndex = Math.min((this.state.camIndex + 1) % 2, this.state.cams.length);
      this.setState({camIndex: camIndex});
      let newStream = await this.getLocalStream(this.state.cams[camIndex]);
      this.setState({localStream: newStream});
      console.log('newStream', newStream);
      const [videoTrack] = newStream.getVideoTracks();
      let socketIds = Object.keys(this.state.peerConnections);
      
      socketIds.forEach((socketID) => {
        let pc = this.state.peerConnections[socketID];
        const sender = pc
          .getSenders()
          .find((s) => s.track.kind === videoTrack.kind);
        console.log("Found sender:", sender);
        sender.replaceTrack(videoTrack);
      });
    }
    catch (e) {
      console.error(e);
    }
  }
  whoisOnline = () => {
    // let all peers know I am joining
    try {
      this.sendToPeer('onlinePeers', { userId: this.props?.user?.id }, { local: this.socket.id })
    }
    catch (e) {
      console.error(e);
    }
  }

  sendToPeer = (messageType, payload, socketID) => {
    try {
      this.socket.emit(messageType, {
        socketID,
        payload
      })
    }
    catch (e) {
      console.error(e);
    }
  }

  sendEmoji = (emojiName) => {
    try {
      this.socket.emit('send-emoji', {
        emojiName,
        name: this.props?.user?.username,
        senderId: this.props?.user?.id
      });
      this.setState({ showEmoji: false });
    }
    catch (e) {
      console.error(e);
    }
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

  componentDidMount = async () => {
    try {
      const { roomId } = this.props;
      console.log('roomId', roomId);
      let listCam = await this.getVideoDevices();
      this.setState({ cams: listCam })
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
      this.socket.on('receive-emoji', data => {
        try {
          let container = document.getElementById("containerShowEmoji");
          let element = document.createElement('div');
          element.classList.add('showEmoji')
          let emoji = '';
          if (data.emojiName === 'smile') emoji = 'cười haha 😄';
          else if (data.emojiName === 'heart') emoji = 'thả tim ❤️';
          else if (data.emojiName === 'like') emoji = 'thích 👍';
          let name = data.name;
          console.log('this.props?.user', this.props?.user);
          console.log('data?.senderId', data?.senderId);
          if (this.props?.user?.id === data?.senderId) name = 'Bạn';
          element.innerHTML = `${name} đã ${emoji}`;
          container.append(element);
          element.addEventListener("animationend", function () {
            element.remove();
          });
        }
        catch (e) {
          console.error(e);
        }
      })
      this.socket.on('connection-success', async (data) => {
        try {

          let stream = await this.getLocalStream(this.state.cams[this.state.camIndex]);
          this.setState({
            localStream: stream
          })

          this.whoisOnline()

          // called when getUserMedia() fails - see below

          // console.log(data.success)
          const status = data.peerCount > 1 ? `Total Connected Peers to room ${this.state.roomId}: ${data.peerCount}` : `Waiting for other peers to connect ${this.state.roomId}`

          this.setState({
            status: status,
            messages: data.messages
          })
        }
        catch (e) {
          console.error(e)
        }
      })

      this.socket.on('joined-peers', data => {
        try {
          this.setState({
            status: data.peerCount > 1 ? `Total Connected Peers to room ${this.state.roomId}: ${data.peerCount}` : `Waiting for other peers to connect ${this.state.roomId}`
          })
        }
        catch (e) {
          console.error(e);
        }
      })

      // ************************************* //
      // ************************************* //
      this.socket.on('peer-disconnected', data => {
        try {
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
        }
        catch (e) {
          console.error(e);
        }
      })

      this.socket.on('online-peer', socketID => {
        try {
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
        }
        catch (e) {
          console.error(e);
        }
      })

      this.socket.on('offer', data => {
        try {
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
        }
        catch (e) {
          console.error(e);
        }
      })

      this.socket.on('answer', data => {
        try {
          // get remote's peerConnection
          const pc = this.state.peerConnections[data.socketID]
          // console.log(data.sdp)
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => { })
        }
        catch (e) {
          console.error(e);
        }
      })

      this.socket.on('candidate', (data) => {
        // get remote's peerConnection
        try {
          const pc = this.state.peerConnections[data.socketID]
          if (pc)
            pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        }
        catch (e) {
          console.error(e);
        }
      })
    }
    catch (e) {
      console.error(e);
    }
  }

  // ************************************* //
  // NOT REQUIRED
  // ************************************* //
  disconnectSocket = (socketToDisconnect) => {
    try {
      this.sendToPeer('socket-to-disconnect', null, {
        local: this.socket.id,
        remote: socketToDisconnect
      })
    }
    catch (e) {
      console.error(e);
    }
  }

  switchVideo = (_video) => {
    try {
      this.setState({
        selectedVideo: _video
      })
    }
    catch (e) {
      console.error(e);
    }
  }

  // ************************************* //
  // ************************************* //
  stopTracks = async (stream) => {
    try {
      stream.getTracks().forEach(track => track.stop())
    }
    catch (e) {
      console.error(e);
    }
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
      try {
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
      catch (e) {
        console.error(e);
      }
    }
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        zIndex: 100,
        height: this.state.expand ? '100vh' : '7vh',
        width: '100%',
        backgroundColor: 'black'
      }}>
        <div id="containerShowEmoji" style={{ zIndex: 10000, color: 'white', position: 'absolute', top: 100, left: 20 }}></div>
        <div onClick={(e) => {
          this.setState({ expand: !this.state.expand })
        }} style={{
          borderRadius: 20,
          width: 40,
          height: 40,
          margin: '5px 0px 0px 10px',
          display: this.state.expand ? '' : 'none',
          position: 'absolute',
          zIndex: 10000
        }}>
          <ExpandLessIcon style={{ fontSize: 25, color: 'white', marginTop: 7 }} />
        </div>
        <div onClick={(e) => {
          this.setState({ expand: !this.state.expand })
        }} style={{
          borderRadius: 20,
          width: 40,
          height: 40,
          margin: '5px 0px 0px 10px',
          display: !this.state.expand ? '' : 'none',
          position: 'absolute',
          zIndex: 10000
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
              borderRadius: 20
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

            <div onClick={(e) => {

            }} style={{
              borderRadius: 20,
              width: 40,
              height: 40,
              position: 'relative'
            }}>
              <div style={{ flexDirection: 'row', position: 'absolute', top: -50, display: this.state.showEmoji ? 'flex' : 'none' }}>
                <div onClick={(e) => {
                  this.sendEmoji('like');
                }} style={{ marginRight: 15 }}>
                  👍
                </div>
                <div onClick={(e) => {
                  this.sendEmoji('heart');
                }} style={{ marginRight: 15 }}>
                  ❤️
                </div>
                <div onClick={(e) => {
                  this.sendEmoji('smile');
                }} style={{ marginRight: 15 }}>
                  😄
                </div>
                {/* <div onClick={(e) => {

                }} style={{
                  borderRadius: 20,
                  width: 40,
                  height: 40,
                }}>
                  <PanToolIcon style={{ fontSize: 25, color: 'orange', marginTop: 7 }} />
                </div> */}
              </div>
              <MoodIcon onClick={() => this.setState({ showEmoji: !this.state.showEmoji })}
                style={{ fontSize: 25, color: 'white', marginTop: 7 }} />

            </div>
            <i onClick={() => this.setState({ muteMyMic: !this.state.muteMyMic })}
              style={{ cursor: 'pointer', padding: 5, fontSize: 25, color: 'white' }} className='material-icons'>{!this.state.muteMyMic && 'mic' || 'mic_off'}</i>
            <i onClick={() => this.setState({ muteMyCamera: !this.state.muteMyCamera })}
              style={{ cursor: 'pointer', padding: 5, fontSize: 25, color: 'white', marginTop: 2 }} className='material-icons'>{!this.state.muteMyCamera && 'videocam' || 'videocam_off'}</i>
            <div onClick={(e) => this.switchCam()} style={{
              borderRadius: 20,
              width: 40,
              height: 40,
            }}>
              <CameraswitchIcon style={{ fontSize: 25, color: 'white', marginTop: 7 }} />
            </div>
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
        <div style={{ display: this.state.expand ? '' : 'none' }}>
          <Videos
            switchVideo={this.switchVideo}
            remoteStreams={remoteStreams}
          />
        </div>
        <br />
      </div>
    )
  }
}

export default Room;


// const constraints = {
//   audio: true,
//   video: {
//     deviceId: {
//       exact: "b4da5ef104ce64f2d578e4ac48b91aa14e9467393d955d4c1fc79982b894ee69"
//     },
//     width: { ideal: 480 },
//     height: { ideal: 640 }
//   }
// }
// async function run (){
//   let x = await navigator.mediaDevices.getUserMedia(constraints);
//   console.log(x);
// }
// run()
