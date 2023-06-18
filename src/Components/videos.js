import React, { Component } from 'react'
import Video from './video'

class Videos extends Component {
  constructor(props) {
    super(props)

    this.state = {
      rVideos: [],
      remoteStreams: [],
      selectedVideo: null,
      videoVisible: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.remoteStreams !== nextProps.remoteStreams) {

      const NoOfRemoteStreams = nextProps.remoteStreams.length

      let selectedVideo = {}

      if (NoOfRemoteStreams === 1)
        selectedVideo = { selectedVideo: nextProps.remoteStreams[0] }
      else {
        selectedVideo = this.state.selectedVideo && nextProps.remoteStreams.filter(stream => stream.id === this.state.selectedVideo.id) || []

        selectedVideo = selectedVideo.length ? {} : { selectedVideo: nextProps.remoteStreams[NoOfRemoteStreams - 1] }
      }

      let _rVideos = nextProps.remoteStreams.map((rVideo, index) => {
        console.log('nextProps.remoteStreams', nextProps.remoteStreams);
        const _videoTrack = rVideo.stream.getTracks().filter(track => track.kind === 'video')
        // if (_videoTrack.length)
        //   _videoTrack[0].onmute = () => {
        //     alert('muted')
        //   }

        let video = _videoTrack && (
          <Video
            videoMuted={this.videoMuted}
            videoType='remoteVideo'
            videoStream={rVideo.stream}
            frameStyle={{
              backgroundColor: '#ffffff12',
              borderRadius: 5,
              float: 'left', 
              margin: '0 3px'
            }}
            videoStyles={{
              objectFit: 'cover',
              borderRadius: 5,
              width: '100%', height: '100%'
            }}
          />
        ) || <div></div>

        return (
          <div
            id={rVideo.name}
            onClick={() => this.switchVideo(rVideo)}
            style={{
              cursor: 'pointer', display: 'inline-block', width: '100%'
            }}
            key={index}
          >
            {video}
          </div>
        )
      })

      this.setState({
        remoteStreams: nextProps.remoteStreams,
        rVideos: _rVideos,
        ...selectedVideo,
      })
    }
  }

  videoMuted = (rVideo) => {
    const muteTrack = rVideo.getVideoTracks()[0]
    const isSelectedVideo = rVideo.id === this.state.selectedVideo.stream.id
    if (isSelectedVideo) {
      this.setState({
        videoVisible: !muteTrack.muted
      })
    }
  }

  switchVideo = (_video) => {
    const muteTrack = _video.stream.getVideoTracks()[0]
    this.setState({
      selectedVideo: _video,
      videoVisible: !muteTrack.muted
    })
  }

  render() {
    return (
      <div style={{
        height: '100vh', position: 'absolute',
        top: 0
      }}>
        {/* <Video
          videoType='previewVideo'
          frameStyle={{
            zIndex: 1,
            position: 'fixed',
            bottom: 0,
            minWidth: '100%', minHeight: '100%',
            backgroundColor: 'black'
          }}
          videoStyles={{
            minWidth: '100%', minHeight: '100%',
            visibility: this.state.videoVisible && 'visible' || 'hidden',
          }}
          videoStream={this.state.selectedVideo && this.state.selectedVideo.stream}
        /> */}
        <div
          style={{
            overflowX: 'scroll',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            height: '100%'
          }}
        >
          {this.state.rVideos}
        </div>
      </div>
    )
  }

}

export default Videos
