import React, { Component } from 'react';

import TimelineComponent from '../components/Timeline';

import Video from '../components/Video';
import VideoControls from '../components/VideoControls';

import VideoSelectorDialog from './VideoSelector';

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

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Select from '@material-ui/core/Select';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
	},
});


class Slate extends Component {

	state = {
		'intro_slate_id': null,
		'outro_slate_id': null,
		'intro_slate_name': 'None',
		'outro_slate_name': 'None',

		dialog: null,

		videoSRC: '/slates/default/intro.mp4',
		video: {
			playing: false
		}
	}

	componentWillMount () {
		try {
			let initialStateData = JSON.parse(this.props.initialState);
			delete initialStateData.raw;
			this.setState(initialStateData);
		} catch (e) {
		}
	}


	onValueChange(control, modifier, event) {

		let value = (event.target.type == 'checkbox') ? event.target.checked : event.target.value;

		if (modifier != null) {
			value = modifier(value);
		}

		this.setState({
			[control]: value
		}, () => this.rerender());

	}

	exportData () {
		let data = {
			'intro_slate_id': this.state.intro_slate_id,
			'outro_slate_id': this.state.outro_slate_id,
			'intro_slate_name': this.state.intro_slate_name,
			'outro_slate_name': this.state.outro_slate_name
		}

		return JSON.stringify(data);
	}

	setVideo (video) {
		if (this.video) {
			return false;
		}
		this.video = video;
		this.forceUpdate();
	}

	setVideoState (state) {
		this.setState({
			video: state
		})
	}

	preview (type) {
		let id = this.state[type + '_slate_id'];

		this.setState({
			videoSRC: '/api/slates/' + id + '/download.mp4'
		}, () => this.video.play())
	}

	selectSlate (type) {
		this.setState({
			dialog: 'video_selector',
			dialogArg: type
		})
	}

	closeSlateView (saveData) {
		if (saveData != undefined) {
			this.setState({
				[this.state.dialogArg + '_slate_id']: saveData.id,
				[this.state.dialogArg + '_slate_name']: saveData.name,
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
								hls={ false }
								src={ this.state.videoSRC }
								segmentStart = { 0 }
								segmentEnd = { 999999999 } />
						</div>
					</div>

					<VideoControls video={ this.video } videoState={ this.state.video } />

				</div>

				<div class="video-side">

					<div class="video-selector">

						<AppBar position="static">
							<Toolbar>
								<div style={{ flex: 1 }}>{ this.props.coreImportObj.title }</div>
							</Toolbar>
						</AppBar>

						<div class="side-content">

							<FormControlLabel control={<Checkbox checked={ true } value="checkedC" />} label="Enable Intro & Outro" />

							<h2 class="side-title">Intro Video</h2>

							<div style={{ display: 'flex' }}>
								<Select
									open={ false }
									onOpen={ this.selectSlate.bind(this, 'intro') }
									fullWidth={ true }
									value={ 0 }>
									<MenuItem value={ 0 }>{ this.state.intro_slate_name }</MenuItem>
								</Select>
								<Button onClick={ this.preview.bind(this, 'intro') }>Preview</Button>
							</div>

							<h2 class="side-title">Outro Video</h2>

							<div style={{ display: 'flex' }}>
								<Select
									open={ false }
									onOpen={ this.selectSlate.bind(this, 'outro') }
									fullWidth={ true }
									value={ 0 }>
									<MenuItem value={ 0 }>{ this.state.outro_slate_name }</MenuItem>
								</Select>
								<Button onClick={ this.preview.bind(this, 'outro') }>Preview</Button>
							</div>


							<Button
									variant="contained"
									color="secondary"
									fullWidth={ true }
									onClick={ this.props.saveAndClose.bind(this, this.exportData.bind(this)) }
									className="padded-button">
								Save &amp; Return
							</Button>

							{ this.state.dialog == 'video_selector' && (
								<VideoSelectorDialog
									type={ this.state.dialogArg }
									onClose={ this.closeSlateView.bind(this) } />
							)}

						</div>

					</div>
				</div>

			</div>
		);
	}
}

export default withStyles(styles)(Slate);
