import React, { Component } from 'react';

import TimelineComponent from '../components/Timeline';

import AbsoluteTimePicker from '../components/AbsoluteTimePicker';

import Video from '../components/Video';
import VideoControls from '../components/VideoControls';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
	},
});


class Import extends Component {

	state = {
		currentTime: 0,
		ready: false,
		video: {
			playing: false
		},

		segmentStart: -1,
		segmentEnd: -1
	}

	componentWillMount () {

		let topOfHour = (Date.now() / 1000 | 0); topOfHour = topOfHour - (topOfHour % 3600);

		this.start = topOfHour - 3600*5;

		setInterval(() => {

			if (!this.video) {
				return;
			}

			if (this.video.getTimecode() == 0) {
				return;
			}

			let ready = this.state.ready

			this.setState({
				currentTime: this.video.getTimecode(),
				currentEdge: this.video.getEdgeTimecode(),
				ready: true
			}, () => ready || this.videoLoaded())

		}, 100);

	}

	// videoLoaded is called when the video has loaded sufficiently that we can begin
	videoLoaded () {
		this.setState({
			segmentStart: (Date.now() / 1000 | 0) - 660,
			segmentEnd: (Date.now() / 1000 | 0) - 60
		})
	}

	setVideo (video) {
		this.video = video;
	}

	onTimelineUpdate (timecode) {
		this.video.setTimecode(timecode);
	}

	setVideoState (state) {
		this.setState({
			video: state
		})
	}

	setSegmentStart (value) {

		console.log('request set segment start', value)

		let segmentEnd = this.state.segmentEnd;

		if (segmentEnd <= value) {
			segmentEnd = value + 30;
		}

		this.setState({
			segmentStart: value,
			segmentEnd: segmentEnd
		})

	}

	setSegmentEnd (value) {

		let segmentStart = this.state.segmentStart;

		if (segmentStart >= value) {
			segmentStart = value - 30;
		}

		this.setState({
			segmentStart: segmentStart,
			segmentEnd: value
		})

	}

	serialize () {
		return {
			name: this.state.name,
			startTime: this.state.segmentStart,
			endTime: this.state.segmentEnd
		}
	}

	render () {
		return (

			<div className="fullpage">

				<div className="video-container">

					<div className="video-player fit">
						<div className="video-player-video-element">
							<Video
								ref={ (v) => this.setVideo(v) }
								onStateChange={ (state) => this.setVideoState(state) }
								hls={ true }
								src="/api/ingest/video/preview.m3u8?start_time=1545354123&end_time=99999999999"
								segmentStart = { this.state.segmentStart }
								segmentEnd = { this.state.segmentEnd } />
						</div>
					</div>

					<VideoControls video={ this.video } videoState={ this.state.video } />

					<div className="video-timeline">
						
						<TimelineComponent
							start={this.start}
							end={this.state.currentEdge }
							offset={ this.state.currentTime }
							onChange={ this.onTimelineUpdate.bind(this) }
							segmentStart = { this.state.segmentStart }
							segmentEnd = { this.state.segmentEnd }

							autoUpdateViewport={ true || this.state.video.playing }

							onSegmentStart={ this.setSegmentStart.bind(this) }
							onSegmentEnd={ this.setSegmentEnd.bind(this) }
							initialOffset={ 0 } />

					</div>

				</div>

				<div className="video-side">

					<div className="video-selector">

						<AppBar position="static">
							<Toolbar>
								<div style={{ flex: 1 }}></div>
								<IconButton color="inherit" aria-label="Save For Later">
									<FontAwesomeIcon icon="save" />
								</IconButton>

								<IconButton color="inherit" aria-label="Go">
									<FontAwesomeIcon icon="step-forward" />
								</IconButton>
							</Toolbar>
						</AppBar>

						<div className="side-content">

							<h1>Import Wizard.</h1>

							<h3>1. Find Content</h3>

							<Button variant="contained" color="secondary">
								<FontAwesomeIcon icon="stopwatch" />{' '} Search By Time
							</Button>

							<Button variant="contained" color="secondary">
								<FontAwesomeIcon icon="file-video" /> Search By Clip
							</Button>

							<br /><br />
							<hr /><br />

							<Button variant="outlined" color="primary" onClick={ () => console.log(this.serialize()) }>
								Save For Later
							</Button>

							<br /><br />

							<h3>2. Fine Tune</h3>

							<AbsoluteTimePicker
								label="Start"
								video={ this.video }
								onChange={ this.setSegmentStart.bind(this) }
								value={ this.state.segmentStart } />

							<AbsoluteTimePicker
								label="End"
								video={ this.video }
								onChange={ this.setSegmentEnd.bind(this) }
								value={ this.state.segmentEnd } />

						</div>

					</div>


				</div>

			</div>

		);
	}
}

export default withStyles(styles)(Import);
