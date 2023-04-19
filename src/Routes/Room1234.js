import React, { Component, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { io } from 'socket.io-client'

import Video from '../Components/video'
import Videos from '../Components/videos'
import CallEndIcon from '@mui/icons-material/CallEnd';
import Draggable from '../Components/draggable'
import { useLocation } from 'react-router-dom/cjs/react-router-dom';

const Room = (props) => {
  const serviceIP = 'http://localhost:8080/webrtcPeer';
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [peerConnections, setPeerConnections] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [status, setStatus] = useState('Please wait...');
  const [pcConfig, setPcConfig] = useState({
    "iceServers": [
      {
        urls: 'stun:stun.l.google.com:19302'
      }
    ]
  });
  const [sdpConstraints, setSdpConstraints] = useState({
    'mandatory': {
      'OfferToReceiveAudio': true,
      'OfferToReceiveVideo': true
    }
  });
  const [messages, setMessages] = useState([]);
  const [sendChannels, setSendChannels] = useState([]);
  const [disconnected, setDisconnected] = useState(false);

  const getLocalStream = () => {
    const success = (stream) => {
      window.localStream = stream
      // console.log('stream', stream);
      setLocalStream(stream);
      whoisOnline()
    }
    const failure = (e) => {
      console.log('getUserMedia Error: ', e)
    }
    const constraints = {
      audio: true,
      video: true,
      // video: {
      //   width: 1280,
      //   height: 720
      // },
      // video: {
      //   width: { min: 1280 },
      // }
      options: {
        mirror: true,
      }
    }

    navigator.mediaDevices.getUserMedia(constraints)
      .then(success)
      .catch(failure)
  }

  const whoisOnline = () => {
    // let all peers know I am joining
    sendToPeer('onlinePeers', null, { local: socket.id })
  }

  const sendToPeer = (messageType, payload, socketID) => {
    socket.emit(messageType, {
      socketID,
      payload
    })
  }

  const createPeerConnection = (socketID) => {

    try {
      let pc = new RTCPeerConnection(pcConfig)

      // add pc to peerConnections object 
      let tmp = { ...peerConnections, [socketID]: pc };
      console.log(tmp);
      setPeerConnections(tmp);

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendToPeer('candidate', e.candidate, {
            local: socket.id,
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
        let remoteVideo = {}
        // 1. check if stream already exists in remoteStreams
        const rVideos = remoteStreams.filter(stream => stream.id === socketID)

        // 2. if it does exist then add track
        if (rVideos.length) {
          _remoteStream = rVideos[0].stream
          _remoteStream.addTrack(e.track, _remoteStream)

          remoteVideo = {
            ...rVideos[0],
            stream: _remoteStream,
          }
          setRemoteStreams(remoteStreams.map(_remoteVideo => {
            return _remoteVideo.id === remoteVideo.id && remoteVideo || _remoteVideo
          }));
        } else {
          // 3. if not, then create new stream and add track
          _remoteStream = new MediaStream()
          _remoteStream.addTrack(e.track, _remoteStream)

          remoteVideo = {
            id: socketID,
            name: socketID,
            stream: _remoteStream,
          }
          setRemoteStreams([...remoteStreams, remoteVideo])
        }

        // const remoteVideo = {
        //   id: socketID,
        //   name: socketID,
        //   stream: e.streams[0]
        // }
        setRemoteStream(remoteStreams.length > 0 ? {} : { remoteStream: _remoteStream });
        let selectedVideoTmp = remoteStreams.filter(stream => stream.id === selectedVideo.id);
        setSelectedVideo(selectedVideoTmp.length ? {} : { selectedVideo: remoteVideo });
      }

      pc.close = () => {
        console.log("pc closed");
      }

      if (localStream)
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream)
        })
      return pc;

    } catch (e) {
      console.log('Something went wrong! pc not created!!', e)
      // return;
      return null;
    }
  }
  const location = useLocation();
  useEffect(() => {
    if (!location.state?.roomId) {
      window.location.href = '/';
      return;
    }
    setRoomId(location.state?.roomId);
  }, [location])
  useEffect(() => {
    setSocket(io(
      serviceIP,
      {
        path: '/io/webrtc',
        query: {
          room: roomId,
        }
      }
    ))
  }, [roomId])
  useEffect(() => {
    getLocalStream();
  }, [socket])
  useEffect(() => {
    if (!socket) return;
    socket.on('answer', data => {
      // get remote's peerConnection
      const pc = peerConnections[data.socketID]
      // console.log(data.sdp)
      if (pc)
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => { })
    })

    socket.on('candidate', (data) => {
      // get remote's peerConnection
      const pc = peerConnections[data.socketID]

      if (pc)
        pc.addIceCandidate(new RTCIceCandidate(data.candidate))
    })
  }, [socket, peerConnections])
  useEffect(() => {
    if (!socket || !localStream) return;
    socket.on('connection-success', data => {
      // console.log(data.success)
      const statusTmp = data.peerCount > 1 ? `Total Connected Peers to room ${roomId}: ${data.peerCount}` : `Waiting for other peers to connect ${roomId}`
      setStatus(statusTmp);
      setMessages(data.messages);
    })
    socket.on('joined-peers', data => {
      const statusTmp = data.peerCount > 1 ? `Total Connected Peers to room ${roomId}: ${data.peerCount}` : `Waiting for other peers to connect ${roomId}`
      setStatus(statusTmp);
    })
    // ************************************* //
    // ************************************* //
    socket.on('peer-disconnected', data => {

      // close peer-connection with this peer
      let peerConnectionsTmp = JSON.parse(JSON.stringify(peerConnections));
      peerConnectionsTmp[data.socketID].close();
      console.log('peerConnectionsTmp', peerConnectionsTmp);
      setPeerConnections(peerConnectionsTmp);

      // get and stop remote audio and video tracks of the disconnected peer
      const rVideo = remoteStreams.filter(stream => stream.id === data.socketID)
      rVideo && stopTracks(rVideo[0]?.stream)

      // filter out the disconnected peer stream
      setRemoteStreams(remoteStreams.filter(stream => stream.id !== data.socketID));

      let selectedVideoTmp = selectedVideo.id === data.socketID && remoteStreams.length ? { selectedVideo: remoteStreams[0] } : null
      setSelectedVideo(selectedVideoTmp);
      let statusTmp = data.peerCount > 1 ? `Total Connected Peers to room ${roomId}: ${data.peerCount}` : `Waiting for other peers to connect room ${roomId}`
      setStatus(statusTmp);
    })
    socket.on('online-peer', socketID => {
      let pc = createPeerConnection(socketID);
      if (!pc) return;
      // 2. Create Offer

      // Send Channel
      const handleSendChannelStatusChange = (event) => {
        // console.log('send channel status: ' + sendChannels[0].readyState)
      }

      const sendChannel = pc.createDataChannel('sendChannel')
      sendChannel.onopen = handleSendChannelStatusChange
      sendChannel.onclose = handleSendChannelStatusChange
      setSendChannels([...sendChannels, sendChannel]);


      // Receive Channels
      const handleReceiveMessage = (event) => {
        const message = JSON.parse(event.data)
        setMessages([...messages, message]);
      }

      const handleReceiveChannelStatusChange = (event) => {
        if (this.receiveChannel) {
          // console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
        }
      }

      const receiveChannelCallback = (event) => {
        const receiveChannel = event.channel
        receiveChannel.onmessage = handleReceiveMessage
        receiveChannel.onopen = handleReceiveChannelStatusChange
        receiveChannel.onclose = handleReceiveChannelStatusChange
      }

      pc.ondatachannel = receiveChannelCallback


      pc.createOffer(sdpConstraints)
        .then(sdp => {
          pc.setLocalDescription(sdp)

          sendToPeer('offer', sdp, {
            local: socket.id,
            remote: socketID
          })
        })
    })

    socket.on('offer', data => {
      let pc = createPeerConnection(data.socketID);
      if (!pc) return;
      // console.log('localStream', localStream);
      pc.addStream(localStream)

      // Send Channel
      const handleSendChannelStatusChange = (event) => {
        console.log('send channel status: ' + sendChannels[0].readyState)
      }

      const sendChannel = pc.createDataChannel('sendChannel')
      sendChannel.onopen = handleSendChannelStatusChange
      sendChannel.onclose = handleSendChannelStatusChange
      setSendChannels([...sendChannels, sendChannel]);

      // Receive Channels
      const handleReceiveMessage = (event) => {
        const message = JSON.parse(event.data)
        setMessages([...messages, message]);
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
        pc.createAnswer(sdpConstraints)
          .then(sdp => {
            pc.setLocalDescription(sdp)

            sendToPeer('answer', sdp, {
              local: socket.id,
              remote: data.socketID
            })
          })
      })

    })
    
  }, [socket, localStream])



  const disconnectSocket = (socketToDisconnect) => {
    sendToPeer('socket-to-disconnect', null, {
      local: socket.id,
      remote: socketToDisconnect
    })
  }

  const switchVideo = (_video) => {
    setSelectedVideo(_video);

  }
  const stopTracks = (stream) => {
    stream.getTracks().forEach(track => track.stop())
  }


  // if (disconnected) {
  //   // disconnect socket
  //   this.socket.close()
  //   // stop local audio & video tracks
  //   this.stopTracks(localStream)

  //   // stop all remote audio & video tracks
  //   remoteStreams.forEach(rVideo => this.stopTracks(rVideo.stream))

  //   // stop all remote peerconnections
  //   peerConnections && Object.values(peerConnections).forEach(pc => pc.close())

  //   return;
  // }

  // const statusText = <div style={{ color: 'yellow', padding: 5 }}>{status}</div>
  // console.log('peerConnections', peerConnections);
  return (
    <div>
      <Draggable style={{
        zIndex: 101,
        position: 'absolute',
        right: 0,
        cursor: 'move'
      }}>
        <Video
          videoType='localVideo'
          videoStyles={{
            // zIndex:2,
            // position: 'absolute',
            // right:0,
            width: 200,
            height: 200,
            // margin: 5,
            // backgroundColor: 'black'
          }}
          frameStyle={{
            width: 200,
            margin: 5,
            borderRadius: 5,
            backgroundColor: 'black',
          }}
          showMuteControls={true}
          // ref={this.localVideoref}
          videoStream={localStream}
          autoPlay muted>
        </Video>
      </Draggable>
      {/* <Video
          frameStyle={{
            zIndex: 1,
            position: 'fixed',
            bottom: 0,
            minWidth: '100%', minHeight: '100%',
            backgroundColor: 'black'
          }}
        videoStyles={{
          // zIndex: 1,
          // position: 'fixed',
          // bottom: 0,
          minWidth: '100%',
          minHeight: '100%',
          // backgroundColor: 'black'
        }}
        // ref={ this.remoteVideoref }
        videoStream={this.state.selectedVideo && this.state.selectedVideo.stream}
        // autoPlay
      ></Video> */}
      <br />
      <div style={{
        zIndex: 3,
        position: 'absolute',
        bottom: 20,
        textAlign: 'center',
        left: `50%`, transform: `translate(-50%, -50%)`
      }}>
        {/* <i onClick={(e) => {this.setState({disconnected: true})}} style={{ cursor: 'pointer', paddingLeft: 15, color: 'red' }} className='material-icons'>highlight_off</i> */}
        <div onClick={(e) => { setDisconnected(true) }} style={{

        }}> <CallEndIcon style={{ fontSize: 50, color: 'red' }} /> </div>
      </div>
      <div>
        <Videos
          switchVideo={switchVideo}
          remoteStreams={remoteStreams}
        // videoStream={this.state.selectedVideo && this.state.selectedVideo.stream}
        ></Videos>
      </div>
      <br />

      {/* <div style={{zIndex: 1, position: 'fixed'}} >
          <button onClick={this.createOffer}>Offer</button>
          <button onClick={this.createAnswer}>Answer</button>

          <br />
          <textarea style={{ width: 450, height:40 }} ref={ref => { this.textref = ref }} />
        </div> */}
      {/* <br />
        <button onClick={this.setRemoteDescription}>Set Remote Desc</button>
        <button onClick={this.addCandidate}>Add Candidate</button> */}
    </div>
  )
}


export default Room;