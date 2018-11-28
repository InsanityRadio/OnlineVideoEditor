import React, { Component } from 'react';
import moment from 'moment';

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

		/*setInterval( () => {

			this.setState({
				cursorPosition: this.state.cursorPosition + 0.1
			})

		}, 100); */
	}

	componentDidUpdate (prevProps) {

		if (this.props.src != prevProps.src || this.props.hls != this.props.hls) {
			this.setSRC();
		}

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