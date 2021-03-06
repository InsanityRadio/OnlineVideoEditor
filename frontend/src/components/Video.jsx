import React, { Component } from 'react';
import moment from 'moment';

import Hls from 'hls.js';

import { withStyles } from '@material-ui/core/styles';

/**
 * Video is a very simple wrapper of the built-in HTML5 video.
 * 
 * It is used to allow very simple external control of a video
 */
class Video extends Component {

	state = {
		loading: true,
		timecodeBase: 0,
		discontinuity: false
	}

	shouldComponentUpdate (nextProps, nextState) {

		// If the SRC updates anywhere, we need to update.
		if (this.state.src != nextState.src || this.props.src != nextProps.src) {
			return true;
		}

		return false;
	}

	componentWillMount () {

		this.setSRC();

		if (this.props.hls) {
			// We can't use web workers with WebPack/create-react-app.
			// Setting a large maxBufferHole makes HLS.JS buffer video instead of skipping over anything missing
			// it is VERY annoying on slow connections!
			this.hls = new Hls({ enableWorker: false, maxBufferHole: 10 });
			this.registerEvents();
		}

	}

	componentDidUpdate (prevProps) {

		if (this.props.src != prevProps.src || this.props.hls != this.props.hls) {
			this.setSRC();
		}

	}

	registerEvents () {

		this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
			this.setState({
				loading: false,
				discontinuity: false
			})
		});

		this.hls.on(Hls.Events.ERROR, (e, data) => {
			console.warn('HLS error', e, data)
		})

		this.hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
			let rawDateTime = data.details.fragments[0].programDateTime;
			let syncOffset = data.details.fragments[0].start * 1000;

			//console.log('setting sync offset', rawDateTime - syncOffset, rawDateTime, syncOffset);

			//this.state.discontinuity || this.setState({
				//timecodeBase: rawDateTime - syncOffset
			//});
		});

		this.hls.on(Hls.Events.FRAG_CHANGED, (event, data) => {
			this.currentFrag = data.frag;

			// 1. find the LATEST fragment
			// 2. work out the currentTime of the start of that fragment
			// 3. discontinuity = that currentTime - expected currentTime

			//let fragmentTime = data.frag.programDateTime;
			//let expectedFragmentTime = this.state.timecodeBase + this.video.currentTime * 1000;

			console.log('CHANGE IN FRAG', data); //, data.frag);

			let discont = data.frag.programDateTime - data.frag.start * 1000;
			console.log('discont?', discont)

			if (true) {
				console.log('found discontinuity', discont);
				this.setState({
					timecodeBase: discont,
					discontinuity: true
				})
			}


		});

	}

	getTimecode () {

		if (!this.state.timecodeBase || !this.video) {
			return 0;
		}

		return (this.state.timecodeBase / 1000) + this.video.currentTime;

	}

	setTimecode (timecode) {
		
		// If this timecode isn't loaded, return false.
		// It's the responsibility of our parent element to try and load the manifest at that point.
		if (timecode < this.state.timecodeBase / 1000) {
			console.error('Tried to seek to timecode that isn\'t loaded');
			return false;
		}

		this.video.currentTime = timecode - this.state.timecodeBase / 1000;
		return true;

	}

	getEdgeTimecode () {
		return this.state.timecodeBase / 1000 + this.hls.liveSyncPosition;
	}

	setSRC () {

		this.setState({
			src: this.props.hls ? '' : this.props.src,
			hls: this.props.hls,
		}, () => {
			this.forceUpdate();
			this.state.hls && this.loadHLS();
		});

	}

	loadHLS () {

		if (!this.video) {
			this.pendingLoadHLS = true;
		}

		// TODO
		console.error('HLS NOT IMPLEMENTED YET')

		this.hls.loadSource(this.props.src);
		this.hls.attachMedia(this.video);

	}

	setVideo (v) {

		if (this.video) {
			return;
		}
		this.video = v;

		if (this.pendingLoadHLS) {
			this.pendingLoadHLS = false;
			this.loadHLS();
		}

	}

	play () {
		this.video.play();
	}

	pause () {
		this.video.pause();
	}

	getFrameRate () {
		return 25;
	}

	stepBackwards () {
		let frameRate = this.getFrameRate();
		this.video.currentTime -= 1/frameRate;
	}

	stepForwards () {
		let frameRate = this.getFrameRate();
		this.video.currentTime += 1/frameRate;
	}

	seekStart () {
		this.setTimecode(this.props.segmentStart);
	}

	seekEnd () {
		this.setTimecode(this.props.segmentEnd);
	}

	onVideoStateChange (event) {
		let target = event.target;

		let loadingState = (!this.state.hls && event.type == 'canplay') ? false : this.state.loading;

		this.setState({
			loading: loadingState,
			videoState: {
				playing: (!target.paused && !target.ended && !loadingState && target.currentTime >= 0)
			}
		}, () => this.props.onStateChange && this.props.onStateChange(this.state.videoState));
	}

	render () {

		let props = Object.assign({}, this.props);
		props.src = this.state.src;

		return <video
			ref={ (v) => this.setVideo(v) }
			onPlay={ this.onVideoStateChange.bind(this) }
			onCanPlay={ this.onVideoStateChange.bind(this) }
			onPause={ this.onVideoStateChange.bind(this) }
			onEnded={ this.onVideoStateChange.bind(this) }
			{...props} />;
	}

}

export default Video;