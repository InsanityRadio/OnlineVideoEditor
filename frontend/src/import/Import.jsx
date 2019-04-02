import React, { Component } from 'react';

import AirTower from '../network/AirTower';

import AbsoluteTimePicker from '../components/AbsoluteTimePicker';
import CuePointSelector from './CuePointSelector';
import Video from '../components/Video';
import VideoControls from '../components/VideoControls';
import TimeSelector from './TimeSelector';
import TimelineComponent from '../components/Timeline';

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

		dialog: null,
		segmentStart: -1,
		segmentEnd: -1
	}

	componentWillMount () {

		let topOfHour = (Date.now() / 1000 | 0); topOfHour = topOfHour - (topOfHour % 3600);

		this.start = topOfHour - 3600*5;

		this.interval = setInterval(() => {

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

	componentWillUnmount () {
		clearInterval(this.interval);
	}

	getServiceName () {
		return 'video';
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

	/**
	 * Import the selected video and return a promise that resolves once complete.
	 */
	importVideo () {
		let data = this.serialize();
		let airTower = AirTower.getInstance();

		return airTower.ingest.importVideo(this.getServiceName(), data.startTime, data.endTime);
	}

	/**
	 * Imports video and, upon completion, redirects to the homepage
	 */
	saveForLater () {
		this.importVideo()
			.then((importObj) => {
				console.log('IMPORT OBJECT', importObj)
			});
	}

	/**
	 * Imports video and, upon completion, redirects to the editor
	 */
	saveAndAdvance () {
		this.importVideo()
			.then((importObj) => {
				console.log('IMPORT OBJECT 2', importObj)
				this.props.history.push('/import/' + importObj.uuid + '/edit');
			});
	}

	/**
	 * Quickly download video between two specified times. 
	 * This call is deferred to the backend! 
	 */
	quickDownload () {
		window.open('/api/ingest/'
			+ this.getServiceName()
			+ '/download.mp4?start_time='
			+ this.state.segmentStart
			+ '&end_time=' + this.state.segmentEnd,
			'_blank')
	}

	/**
	 * Escape back to the main page
	 */
	handleClose () {
		this.props.history.push('/');
	}

	selectCuePoint (type) {
		this.setState({
			dialog: 'cue_point',
			dialogArg: 'cue_point'
		})
	}

	selectTime (type) {
		this.setState({
			dialog: 'time',
			dialogArg: 'time'
		})
	}

	closeSlateView (saveData) {
		if (saveData != undefined && this.state.dialog == 'cue_point') {
			this.setState({
				segmentStart: saveData.start_time,
				segmentEnd: saveData.end_time
			}, () => {
				this.video.seekStart();
			})
		}
		if (saveData != undefined && this.state.dialog == 'time') {
			this.setState({
				segmentStart: saveData / 1000 | 0,
				segmentEnd: (saveData / 1000 | 0) + 30
			}, () => {
				this.video.seekStart();
			})
		}
		this.setState({
			dialog: null
		})
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
								src={ "/api/ingest/" + this.getServiceName() + "/preview.m3u8?start_time=1545354123&end_time=99999999999" }
								segmentStart = { this.state.segmentStart }
								segmentEnd = { this.state.segmentEnd } />
						</div>
					</div>

					<VideoControls video={ this.video } videoState={ this.state.video } />

					<div className="video-timeline">
						
						<TimelineComponent
							start={ this.start }
							end={ this.state.currentEdge }
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
								<IconButton
										color="inherit"
										aria-label="Save For Later"
										onClick={ this.handleClose.bind(this) } >
									<FontAwesomeIcon icon="long-arrow-alt-left" />
								</IconButton>

								<div style={{ flex: 1 }}></div>
							</Toolbar>
						</AppBar>

						<div className="side-content import-wizard">

							<h1>Import Wizard.</h1>

							<h3>1. Find Content</h3>

							<div class="row">
								<Button 
										variant="contained"
										color="secondary"
										fullWidth={ true }
										onClick={ this.selectTime.bind(this) }>
									<FontAwesomeIcon icon="stopwatch" />&nbsp;Search By Time
								</Button>

								<Button
										variant="contained"
										color="secondary"
										fullWidth={ true }
										onClick={ this.selectCuePoint.bind(this) }>
									<FontAwesomeIcon icon="file-video" />&nbsp;Search By Clip
								</Button>
							</div>

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

							<br /><br />

							<h3>3. Import</h3>

							<div class="row">
								<Button
										variant="contained"
										color="primary"
										fullWidth={ true }
										className="padded-button"
										onClick={ this.saveForLater.bind(this) }>
									Save For Later
								</Button>
								<Button
										variant="contained"
										color="primary"
										fullWidth={ true }
										className="padded-button"
										onClick={ this.quickDownload.bind(this) }>
									Quick Download
								</Button>
							</div>
							<Button
									variant="contained"
									color="secondary"
									fullWidth={ true }
									className="padded-button"
									onClick={ this.saveAndAdvance.bind(this) }>
								Next: Edit Video
							</Button>


						</div>
					</div>
				</div>

				{ this.state.dialog == 'cue_point' && (
					<CuePointSelector onClose={ this.closeSlateView.bind(this) } /> 
				)}

				{ this.state.dialog == 'time' && (
					<TimeSelector initial={ this.state.currentTime * 1000 } onClose={ this.closeSlateView.bind(this) } /> 
				)}
			</div>

		);
	}
}

export default withStyles(styles)(Import);
