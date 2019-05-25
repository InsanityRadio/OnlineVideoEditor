import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import AppBar from '@material-ui/core/AppBar';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import AirTower from '../network/AirTower';

import FrameComponent from '../frame/Frame';
import SlateComponent from '../slate/Slate';

import EditVideoType from './EditVideoType';

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
		lastSaveTime: 0,
		video: {
			playing: false
		},
		slate: false,
		frame: false,
		videoTitle: null,
		platforms: {},
		platformState: {},
		subview: null,
		renderState: []
	}

	providers = {
		youtube: {
			slate: true,
			frame: false
		},
		facebook: {
			slate: true,
			frame: true
		},
		twitter: {
			slate: true,
			frame: true
		},
		instagram: {
			slate: false,
			frame: true
		}
	}

	componentWillMount () {
		this.loadImport();
		this.loadRenderState();
		this.loadPlatforms();

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

	getImportID () {
		return this.props.match.params.id;
	}

	loadImport () {
		let airTower = AirTower.getInstance();
		airTower.ingest.findImportByID(this.getServiceName(), this.getImportID())
			.then((importObj) => {
				this.setState({
					importObj: importObj
				})
			})

		airTower.core.findImportByID(this.getImportID())
			.then((coreImportObj) => {
				this.setState({
					coreImportObj: coreImportObj,
					videoTitle: coreImportObj.title
				}, () => this.checkForVideos());
			})
			.catch((error) => {
				console.log('error finding', error)
				airTower.core.takeOwnership(this.getServiceName(), this.getImportID(), this.state.videoTitle)
					.then((coreImportObj) => {
						this.setState({
							coreImportObj: coreImportObj
						}, () => this.checkForVideos());
					})
			})
	}

	loadPlatforms () {
		let airTower = AirTower.getInstance();
		airTower.core.loadPlatforms()
			.then((platforms) => this.setState({ platforms }));
	}

	loadRenderState () {
		let airTower = AirTower.getInstance();

		airTower.core.loadRenderState(this.getImportID())
			.then((renderState) => {
				this.setState({
					renderState: renderState
				});
				if (renderState.length > 0) {
					setTimeout(this.loadRenderState.bind(this), 5000);
				}
			});
	}

	// Based on what videos exist on the backend, check the relevant boxes to show that they exist. 
	checkForVideos () {
		let videos = this.state.coreImportObj.videos;

		let enabledState = {};
		for (var i = 0; i < videos.length; i++) {
			enabledState[videos[i].type] = true;
		}

		this.setState(enabledState);
	}

	getEnabledVideoTypes () {
		let types = ['default', 'slate', 'frame'];
		return types.filter((a) => this.state[a] == true);
	}

	checkAndCreateVideos () {
		let required = this.getEnabledVideoTypes(); 
		let videos = this.state.coreImportObj.videos;

		let airTower = AirTower.getInstance();
		for (var i = 0; i < videos.length; i++) {
			if (required.includes(videos[i].type)) {
				required = required.filter((a) => a != videos[i].type)
			} else {
				// no longer required, delete this!
				airTower.core.deleteVideoById(this.getImportID(), videos[i].id)
					.then((coreImportObj) => {
						this.setState({
							coreImportObj: coreImportObj
						})
					});
			}
		}

		for (var i = 0; i < required.length; i++) {
			airTower.core.createVideoByType(this.getImportID(), required[i])
				.then((coreImportObj) => this.setState({ coreImportObj }));
		}
	}

	findVideoForType (type) {
		return this.state.coreImportObj.videos.find((video) => video.type == type);
	}

	updatePlatform (platform, videoType, enabled, configuration) {
		// if enabled, create platform for video type. otherwise, find it & delete it
		let share = this.findShareForPlatformAndType(platform, videoType);
		let video = this.findVideoForType(videoType);
		let airTower = AirTower.getInstance();

		if (share) {
			if (!enabled) {
				airTower.core.deleteShare(this.getImportID(), video.id, share.id)
					.then((coreImportObj) => this.setState({ coreImportObj }))
			} else {
				airTower.core.updateShare(
					this.getImportID(),
					video.id,
					share.id,
					configuration.title,
					configuration.description,
					configuration.configuration
				)
					.then((coreImportObj) => this.setState({ coreImportObj }))
					.then(() => configuration.immediate && this.publishShare(video, share))
			}
		} else {
			if (enabled) {
				airTower.core.createShare(
					this.getImportID(),
					video.id,
					platform.id,
					configuration.title,
					configuration.description,
					configuration.configuration
				)
					.then((coreImportObj) => this.setState({ coreImportObj }))
			}
		}
	}

	publishShare (video, share) {
		let airTower = AirTower.getInstance();
		console.log('Publishing share', share);
		airTower.core.publishShare(this.getImportID(), video.id, share.id)
			.then((resp) => console.log(resp));
	}

	findShareForPlatformAndType (platform, videoType) {
		let video = this.findVideoForType(videoType);

		if (!video) {
			return null;
		}

		let shares = video.shares;
		let share = shares.find((share) => share.platform.id == platform.id);

		return share;
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
		});
	}

	getVideoSRC () {
		return this.state.importObj.getPreviewPath();
	}

	updateLocalField (field, event, callback) {
		this.setState({
			[field]:  event.target[event.target.hasOwnProperty('checked') ? 'checked' : 'value']
		}, () => (typeof callback == 'function' && callback()) || this.checkAndCreateVideos());
	}

	updateLocalFieldAndSave (field, event) {
		this.updateLocalField(field, event, () => {
			this.rateLimitSave();
			return this.checkAndCreateVideos();
		});
	}

	openSubView (url) {
		if (this.props.location.pathname.substr(-1, 1) == '/') {
			this.props.history.replace(this.props.location.pathname + url)
		} else {
			this.props.history.replace(this.props.location.pathname + '/' + url)
		}
	}

	closeSubView (type, saveData) {
		if (saveData != undefined) {
			let data = saveData();
			this.saveConfiguration(type, data);
		}

		this.props.history.replace(this.props.location.pathname + '/..');
	}

	rateLimitSave () {
		if (this.saveTimer) {
			return;
		}
		this.saveTimer = setTimeout(this.save.bind(this), 500);
	}

	save () {
		this.saveTimer = null;

		let airTower = AirTower.getInstance();
		airTower.core.takeOwnership(this.getServiceName(), this.getImportID(), this.state.videoTitle)
		/*	.then((coreImportObj) => {
				coreImportObj.set('title', this.state.videoTitle);
				this.setState({
					coreImportObj: this.state.coreImportObj
				});
			});*/
	}

	sendRender () {
		let videosToSendForRender = this.getEnabledVideoTypes().map((type) => this.findVideoForType(type));

		videosToSendForRender.forEach((video) => this.sendVideoForRender(video));
	}

	sendVideoForRender (video) {
		let airTower = AirTower.getInstance();
		airTower.core.renderVideo(this.getImportID(), video.id)
			.then((coreImportObj) => {
				coreImportObj.set('title', this.state.videoTitle);
				this.setState({
					coreImportObj: this.state.coreImportObj
				})
				this.loadRenderState();
			});
	}

	downloadRawVideo () {
		window.open(this.state.importObj.getPreviewPath(), '_blank');
	}

	downloadVideo (videoType) {
		window.open(this.findVideoForType(videoType).getDownloadPath(), '_blank');
	}

	/**
	 * For a child video, save its configuration
	 */
	saveConfiguration (type, data) {
		let airTower = AirTower.getInstance();
		let videoID = this.findVideoForType(type).id;

		airTower.core.updateVideo(this.getImportID(), videoID, data)
			.then((coreImportObj) => {
				this.setState({
					coreImportObj: coreImportObj
				})
			})
	}

	getRenderState (videoType) {
		let video = this.findVideoForType(videoType);
		if (!video) {
			return null;
		}
		return this.state.renderState.find((state) => state.video_id == video.id);
	}

	/**
	 * Escape back to the main page
	 */
	handleClose () {
		this.props.history.push('/imports');
	}

	deleteClip () {
		if (!confirm('Really delete video clip?')) {
			return;
		}

		let airTower = AirTower.getInstance();
		airTower
	}
	
	render () {

		if (!this.state.importObj || !this.state.coreImportObj) {
			return (<b>loading</b>);
		}

		let urlParamArgument = this.props.location.pathname.split('/').pop()

		switch (urlParamArgument) {
			case 'frame':
				return <FrameComponent
					importObj={ this.state.importObj }
					coreImportObj={ this.state.coreImportObj }
					previewSRC={ this.getVideoSRC() }
					initialState={ this.findVideoForType('frame').configuration }
					saveAndClose={ this.closeSubView.bind(this, 'frame') } />;

			case 'slate':
				return <SlateComponent
					importObj={ this.state.importObj }
					coreImportObj={ this.state.coreImportObj }
					previewSRC={ this.getVideoSRC() }
					initialState={ this.findVideoForType('slate').configuration }
					saveAndClose={ this.closeSubView.bind(this, 'slate') } />;

		}

		let trusted = true;

		return (

			<div className="fullpage">
				<div className="video-container">
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

				<div className="video-side">
					<div className="video-selector">
						<AppBar position="static">
							<Toolbar>
								<div style={{ flex: 1 }}>
									<TextField
										fullWidth={ true }
										placeholder={ 'Untitled' }
										value={ this.state.videoTitle }
										onChange={ this.updateLocalFieldAndSave.bind(this, 'videoTitle') }
										margin="normal" />
								</div>
								<IconButton
									onClick={ this.deleteClip.bind(this) }>
									<FontAwesomeIcon icon="trash" size="sm" />
								</IconButton>

							</Toolbar>
						</AppBar>

						<div className="side-content">

							<Typography variant="h5" component="h2">
								Target Platforms
							</Typography>

							{ [['slate', 'Linear Video'], ['frame', 'Square Video']].map((videoType) => 
								<EditVideoType 
									videoType={ videoType[0] }
									description={ videoType[1] }
									platforms={ this.state.platforms }
									enabledProviders={ this.providers }
									enabled={ this.state[videoType[0]] }
									updatePlatform={ this.updatePlatform.bind(this) }
									openSubView={ this.openSubView.bind(this, videoType[0]) }
									updateState={ this.updateLocalField.bind(this, videoType[0]) }
									downloadVideo={ this.downloadVideo.bind(this, videoType[0]) }
									renderState={ this.getRenderState(videoType[0]) }
									video={ this.findVideoForType(videoType[0]) } />
								)
							}

							<Button
									variant="contained"
									color="secondary"
									fullWidth={ true }
									onClick={ this.sendRender.bind(this) }
									className="padded-button">
								Export &amp; Share
							</Button>

							<p className="small-text">Rendering may take a few minutes and is dependent on available server resources</p>

							<p className="small-text">{ trusted ? "Video will be immediately shared" : "Video will be sent for approval before it is shared" }</p>

							<Button
									variant="contained"
									color="primary"
									fullWidth={ true }
									onClick={ this.downloadRawVideo.bind(this) }
									className="padded-button">
								Download Raw Video
							</Button>

						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(styles)(Edit);
