import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import FacebookConfig from './config/Facebook';
import YouTubeConfig from './config/YouTube';
import TwitterConfig from './config/Twitter';
import InstagramConfig from './config/Instagram';

let platformNames = {
	facebook: 'Facebook',
	twitter: 'Twitter',
	instagram: 'Instagram',
	youtube: 'YouTube'
}


class EditVideoType extends Component {

	state = {
		platformConfig: {},

		// Contains a mapping of backend share IDs for each platform, allowing configurability. 
		share: {
		}
	}

	componentWillMount () {

		let videoType = this.props.videoType;

		// Convert big platforms object into an array of platforms we have available for this video type. 
		let enabledProviders = Object.entries(this.props.enabledProviders).map((plat) => plat[1][videoType] ? plat[0] : null);
		enabledProviders = enabledProviders.filter((a) => a != null);

		this.setState({
			enabledProviders: enabledProviders
		})
	}

	getStyle () {
		let styles = ['selectionCardContainer'], video = this.props.video;

		if (video != null && (video.queued || video.rendered)) {
			styles.push('rendering');
			styles.push('render-state-' + this.getRenderStateClass(video.id));
		}

		return styles.join(' ');
	}

	getRenderStateClass (videoID) {
		let renderState = this.props.renderState;

		if (!renderState) {
			return 'none';
		}

		return renderState.status;
	}

	getRenderProgressPC () {
		let renderState = this.props.renderState;

		if (!renderState) {
			return 0;
		}

		return renderState.level;
	}

	getRenderProgress (videoType) {
		let renderState = this.props.renderState, video = this.props.video;

		if (video == null || (!video.queued && !video.rendered)) {
			return null;
		}

		if (renderState && (renderState.status == 'completed') || this.props.video.rendered == true) {
			return (
				<div className="rendering-progress">
					<Button onClick={ this.props.downloadVideo.bind(this, videoType) } variant="outlined">
						Download
					</Button>
				</div>
			);
		}

		return (
			<div className="rendering-progress">
				<div
					className="rendering-progress-element"
					style={{ width: this.getRenderProgressPC() + '%' }}>
				</div>
				<p>{ renderState ? renderState.state : 'N/A' }</p>
			</div>
		);
	}

	findShareForPlatform (platform) {
		let video = this.props.video;

		if (!video) {
			return null;
		}

		let shares = video.shares;
		let share = shares.find((share) => share.platform.id == platform.id);

		return share;
	}

	// If a box is checked for the first time, open the configuration window for the platform
	updatePlatform (platform, event) {

		if (!this.isPlatformEnabled(platform) && event.target.checked) {
			return this.configurePlatform(platform);
		}

		let videoType = this.props.videoType;
		this.props.updatePlatform(platform, videoType, event);
	}

	// Callback to specifically open a configuration window for a platform
	configurePlatform (platform) {
		this.openSubView(platform.platform_type, this.findShareForPlatform(platform), platform);
	}

	saveConfiguration (platform, data) {
		let videoType = this.props.videoType;
		this.props.updatePlatform(platform, videoType, { target: { checked: true }}, data);
	}

	openSubView (view, argument, stateData) {
		this.setState({
			subview: view,
			subviewArgument: argument,
			subviewState: stateData
		})
	}

	closeSubView (platform, saveData) {
		if (saveData != undefined) {
			this.saveConfiguration(this.state.subviewState, saveData);
		}

		this.setState({
			subview: null
		})
	}

	getPlatforms () {
		return this.props.platforms.filter((a) => this.state.enabledProviders.indexOf(a.platform_type) > -1);
	}

	isPlatformEnabled (platformID) {
		for (var i in this.props.video.shares) {
			let share = this.props.video.shares[i];
			if (share.platform.id == platformID) {
				return true;
			}
		}
		return false;
	}

	render () {
		let videoType = this.props.videoType;

		return (
			<Card className={ this.getStyle() }>
				{ this.renderDialog() }
				<div className="selectionCard">
					{ this.getRenderProgress() }
					<CardActions>
						<Checkbox
							checked={ this.props.enabled }
							onChange={ this.props.updateState.bind(this) }
							color="primary" />
					</CardActions>
					<CardContent>
						<Typography variant="h5" component="h2">
							{ this.props.description }
							&nbsp;&nbsp;
							<Button onClick={ this.props.openSubView.bind(this) }>
								Edit
							</Button>
						</Typography>

						<p>
							Select platforms to share on
						</p>

						<FormGroup>
							{ this.getPlatforms().map((platform) => 
								<FormControlLabel
									control={
										<Checkbox
											checked={ this.isPlatformEnabled(platform.id) }
											onChange={ this.updatePlatform.bind(this, platform) } />
									}
									label={
										<div>
											<FontAwesomeIcon icon={ platform.icon } />
											&nbsp;&nbsp;
											{ platform.name }
											&nbsp;&nbsp;
											<IconButton onClick={ this.configurePlatform.bind(this, platform) }>
												<FontAwesomeIcon icon="pencil-alt" className="small-icon" />
											</IconButton>
										</div>
									} />
							)}
						</FormGroup>

					</CardContent>
				</div>
			</Card>
		);
	}

	renderDialog () {

		switch (this.state.subview) {
			case 'youtube':
				return <YouTubeConfig
					share={ this.state.subviewArgument }
					saveAndClose={ this.closeSubView.bind(this, 'youtube') } />;
			case 'facebook':
				return <FacebookConfig
					share={ this.state.subviewArgument }
					saveAndClose={ this.closeSubView.bind(this, 'facebook') } />;
			case 'twitter':
				return <TwitterConfig
					share={ this.state.subviewArgument }
					saveAndClose={ this.closeSubView.bind(this, 'twitter') } />;
			case 'instagram':
				return <InstagramConfig
					share={ this.state.subviewArgument }
					saveAndClose={ this.closeSubView.bind(this, 'instagram') } />;
			default:
				return null;
		}
	}
}

export default EditVideoType;