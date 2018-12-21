import React, { Component } from 'react';

import TimelineComponent from '../components/Timeline';

import Video from '../components/Video';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';


import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
	},
});


class Import extends Component {

	state = {
		currentTime: 0
	}

	componentWillMount () {

		let topOfHour = (Date.now() / 1000 | 0); topOfHour = topOfHour - (topOfHour % 3600);

		// Show 5 minutes initially in our window 
		let topOfHourPlus = topOfHour + 3600;

		this.start = topOfHour - 3600*5;
		this.end = topOfHourPlus;

		setInterval(() => {

			if (!this.video) {
				return;
			}

			if (this.video.getTimecode() == 0) {
				return;
			}

			this.setState({
				currentTime: this.video.getTimecode()
			})

		}, 100);

	}

	setVideo (video) {
		this.video = video;
	}

	onTimelineUpdate (timecode) {
		console.log('time update', timecode)
		this.video.setTimecode(timecode);
	}

	render () {
		return (

			<div className="fullpage">

				<div className="video-container">

					<div className="video-player fit">
						<div className="video-player-video-element">
							<Video
								ref={ (v) => this.setVideo(v) }
								hls={ true }
								src="http://localhost:3000/api/ingest/video/preview.m3u8?start_time=1545354123&end_time=99999999999" />
						</div>
					</div>

					<div className="video-controls">
						PLAY / PAUSE / FORWARD / BACKWARDS 
					</div>

					<div className="video-timeline">
						
						<TimelineComponent
							start={this.start}
							end={this.end}
							offset={ this.state.currentTime }
							onChange={ this.onTimelineUpdate.bind(this) }
							initialOffset={ 0 } />

					</div>

				</div>

				<div className="video-side">

					<div className="video-selector">

						<AppBar position="static">
							<Toolbar>
								<div style={{ flex: 1 }}></div>
								<IconButton color="inherit" aria-label="Menu">
									S
								</IconButton>
							</Toolbar>
						</AppBar>

						<div className="side-content">

							<h1>Import Wizard.</h1>

							<h3>1. Find Content</h3>

							<Button variant="outlined" color="secondary">
								Search By Time
							</Button>

							<Button variant="outlined" color="secondary">
								Search By Clip
							</Button>

							<br /><br />
							<hr /><br />

							<Button variant="outlined" color="primary">
								Save For Later
							</Button>

							<br /><br />

							<h3>2. Options</h3>

						</div>

					</div>


				</div>

			</div>

		);
	}
}

export default withStyles(styles)(Import);
