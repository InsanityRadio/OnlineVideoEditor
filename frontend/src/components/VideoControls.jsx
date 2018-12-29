import React, { Component } from 'react';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * VideoControls is a simple stepped component to allow a specified video to be controlled.
 * 
 * It is used to allow very simple external control of a video
 */
class VideoControls extends Component {

	componentWillMount () {

	}

	playPause () {
		this.props.videoState.playing ? this.props.video.pause() : this.props.video.play();
	}

	seekStart () {
		this.props.video.seekStart();
	}

	seekEnd () {
		this.props.video.seekEnd();
	}

	stepBackwards () {
		this.props.video.stepBackwards();
	}

	stepForwards () {
		this.props.video.stepForwards();
	}

	render () {

		return (
			<div className="video-controls">
				<div className="video-controls-toolbar ">
					<Button variant="outlined" color="white" onClick={ this.playPause.bind(this) }>
						<FontAwesomeIcon icon={ this.props.videoState.playing ? 'pause' : 'play' } />
					</Button>
				</div>
				<div className="video-controls-toolbar flex-right">
					<Button variant="outlined" color="white" onClick={ this.seekStart.bind(this) }>
						<b>{ '{' }</b> <FontAwesomeIcon icon="long-arrow-alt-left" />
					</Button>
					<Button variant="outlined" color="white" onClick={ this.stepBackwards.bind(this) }>
						<FontAwesomeIcon icon="step-backward" />
					</Button>
					<Button variant="outlined" color="white" onClick={ this.stepForwards.bind(this) }>
						<FontAwesomeIcon icon="step-forward" />
					</Button>
					<Button variant="outlined" color="white" onClick={ this.seekEnd.bind(this) }>
						<FontAwesomeIcon icon="long-arrow-alt-right" /> <b>{ '}' }</b>
					</Button>
				</div>
			</div>
		);
	}

}

export default VideoControls;