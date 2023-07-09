import React, { Component } from 'react'
import Video from './video'

const perVideoPage = 6;
class Videos extends Component {

  constructor(props) {
    super(props)

    this.state = {
      rVideos: [],
      remoteStreams: [],
      selectedVideo: null,
      videoVisible: false,
      currentPage: 1,
      totalPage: 1
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
      let cntVideos = this.props.remoteStreams?.length || 0;
      let tmpTotalPage = cntVideos % perVideoPage === 0 ? Math.floor(cntVideos / perVideoPage) : Math.floor(cntVideos / perVideoPage) + 1;
      this.setState({ totalPage: tmpTotalPage });
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
              // float: 'left', 
              display: 'flex',
              flexDirection: 'row',
              padding: 2
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
              // cursor: 'pointer', display: 'inline-block', width: '50%'
              width: '100%'
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
    console.log('cntVideos', this.state.currentPage);
    console.log('tmpTotalPage', this.state.totalPage);
    return (
      <div style={{
        position: 'absolute',
        height: '100vh',
        width: '100%',
        top: 0
      }}>
        <div style={{
          marginTop: 200,
          position: 'relative'
        }}>
          <div
            style={{
              overflowX: 'scroll',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              height: this.state.rVideos.slice(perVideoPage * (this.state.currentPage - 1), perVideoPage * this.state.currentPage)?.length >= 2 ? '100%' : 300,
              display: this.state.rVideos.slice(perVideoPage * (this.state.currentPage - 1), perVideoPage * this.state.currentPage)?.length >= 2 ? 'grid' : '',
              gridTemplateColumns: 'auto auto'
            }}
          >
            {this.state.rVideos.slice(perVideoPage * (this.state.currentPage - 1), perVideoPage * this.state.currentPage)}

            {
              this.state.totalPage > 1 && <div style={{
                position: 'absolute', bottom: -80,
                justifyContent: 'center',
                width: '100%',
                color: 'white',
                display: 'flex',
                flexDirection: 'row'
              }}>
                <p onClick={() => this.setState({currentPage: Math.max(--this.state.currentPage, 1)})}>⏪</p>
                <p style={{marginLeft: 40, marginRight: 40}}>{`${this.state.currentPage} / ${this.state.totalPage}`}</p>
                <p onClick={() => this.setState({currentPage: Math.min(++this.state.currentPage, this.state.totalPage)})}>⏩</p>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }

}

export default Videos
