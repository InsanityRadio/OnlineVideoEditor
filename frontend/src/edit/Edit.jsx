import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';

import AirTower from '../network/AirTower';

import TimelineComponent from '../components/Timeline';
import Video from '../components/Video';
import VideoControls from '../components/VideoControls';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
	},
});


class Edit extends Component {

	state = {
		importObj: null,
		currentTime: 0,
		video: {
			playing: false
		}
	}

	componentWillMount () {
		this.loadImport();

		this.interval = setInterval(() => {

			if (!this.video) {
				return;
			}

			if (this.video.getTimecode() == 0) {
				return;
			}

			if (this.video.getTimecode() >= this.state.importObj.end_time) {
				this.video.pause();
				this.video.seekStart();
			}

			this.setState({
				currentTime: this.video.getTimecode(),
			});


		}, 100);
	}

	componentWillUnmount () {
		clearInterval(this.interval);
	}

	getServiceName () {
		return 'video';
	}

	getVideoID () {
		return this.props.match.params.id;
	}

	loadImport () {
		let airTower = AirTower.getInstance();
		airTower.ingest.findImportByID(this.getServiceName(), this.getVideoID())
			.then((importObj) => {
				this.setState({
					importObj: importObj
				})
			});
	}

	onTimelineUpdate (timecode) {
		this.video.setTimecode(timecode);
	}

	setVideo (video) {
		this.video = video;
	}

	setVideoState (state) {
		this.setState({
			video: state
		})
	}

	getVideoSRC () {
		return this.state.importObj.getPreviewPath();
	}

	render () {

		if (!this.state.importObj) {
			return (<b>loading</b>);
		}
		return (

			<div class="fullpage">
				<div class="video-container">
					<div className="video-player fit">
						<div className="video-player-video-element">
							<Video
								ref={ (v) => this.setVideo(v) }
								onStateChange={ (state) => this.setVideoState(state) }
								hls={ true }
								src={ this.getVideoSRC() }
								segmentStart = { this.state.importObj.start_time }
								segmentEnd = { this.state.importObj.end_time } />
						</div>
					</div>

					<VideoControls video={ this.video } videoState={ this.state.video } />

					<div className="video-timeline">
						
						<TimelineComponent
							start={ this.state.importObj.start_time }
							end={ this.state.importObj.end_time }
							offset={ this.state.currentTime }
							onChange={ this.onTimelineUpdate.bind(this) }
							segmentStart = { this.state.importObj.start_time }
							segmentEnd = { this.state.importObj.end_time }
							autoUpdateViewport={ true }
							readOnly={ true }
							initialOffset={ 0 } />

					</div>

				</div>

				<div class="video-side">
					<div class="video-selector">
						<AppBar position="static">
							<Toolbar>
								<div style={{ flex: 1 }}>{ '{videoFileName}' }</div>
								<IconButton color="inherit" aria-label="Menu">
									S
								</IconButton>
							</Toolbar>
						</AppBar>

						<div class="side-content">
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(styles)(Edit);
