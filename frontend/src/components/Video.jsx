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

	shouldComponentUpdate (nextProps, nextState) {

		// If the SRC updates anywhere, we need to update.
		if (this.state.src != nextState.src ) {
			return true;
		}

		return false;
	}

	componentWillMount () {

		this.setSRC();

		// We can't use web workers with WebPack/create-react-app.
		this.hls = new Hls({ enableWorker: false });
		console.log('HLS:', this.hls)

		this.registerEvents();

	}

	componentDidUpdate (prevProps) {

		if (this.props.src != prevProps.src || this.props.hls != this.props.hls) {
			this.setSRC();
		}

	}

	registerEvents () {

		this.hls.on(Hls.Events.MANIFEST_PARSED, function () {
		});

		this.hls.on(Hls.Events.ERROR, (e, data) => {
			console.warn('HLS error', e, data)
		})

		this.hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
			let rawDateTime = data.details.fragments[0].programDateTime;

			this.setState({
				timecodeBase: rawDateTime
			});
		});

		this.hls.on(Hls.Events.FRAG_CHANGED, (event, data) => {
			this.currentFrag = data.frag;
		});

	}

	getTimecode () {

		if (!this.state.timecodeBase || !this.video) {
			return 0;
		}

		return (this.state.timecodeBase / 1000) + this.video.currentTime;

	}

	setTimecode (timecode) {
		
		if (timecode < this.state.timecodeBase / 1000) {
			console.error('Tried to seek to timecode that isn\'t loaded');
			return;
		}

		this.video.currentTime = timecode - this.state.timecodeBase / 1000;

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

	render () {

		let props = Object.assign({}, this.props);
		props.src = this.state.src;

		return <video ref={ (v) => this.setVideo(v) } {...props} />;
	}

}

export default Video;