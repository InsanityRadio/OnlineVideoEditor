import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';

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

		let renderType = this.props.videoType;

		// Convert big platforms object into an array of platforms we have available for this video type. 
		let enabledPlatforms = Object.entries(this.props.enabledPlatforms).map((plat) => plat[1][renderType] ? plat[0] : null);
		enabledPlatforms = enabledPlatforms.filter((a) => a != null);

		this.setState({
			enabledPlatforms: enabledPlatforms
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

	getRenderProgress (renderType) {
		let renderState = this.props.renderState, video = this.props.video;

		if (video == null || (!video.queued && !video.rendered)) {
			return null;
		}

		if (renderState && (renderState.status == 'completed') || this.props.video.rendered == true) {
			return (
				<div className="rendering-progress">
					<Button onClick={ this.props.downloadVideo.bind(this, renderType) } variant="outlined">
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

	// If a box is checked for the first time, open the configuration window for the platform
	updatePlatform (platform, event) {

		if (!this.state.platformConfig[platform] && event.target.checked) {
			return this.configurePlatform(platform);
		}

		let renderType = this.props.videoType;
		this.props.updatePlatform(platform, renderType, event);
	}

	// Callback to specifically open a configuration window for a platform
	configurePlatform (platform) {
		this.openSubView(platform);
	}

	saveConfiguration (platform, data) {
		this.setState({
			platformConfig: Object.assign({}, this.state.platformConfig, { 
				[platform]: data
			})
		}, () => {
			let renderType = this.props.videoType;
			this.props.updatePlatform(platform, renderType, { target: { checked: true }});
		})
	}

	openSubView (view) {
		this.setState({
			subview: view
		})
	}

	closeSubView (platform, saveData) {
		if (saveData != undefined) {
			this.saveConfiguration(platform, saveData);
		}

		this.setState({
			subview: null
		})
	}

	render () {
		let renderType = this.props.videoType;

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
							{ this.state.enabledPlatforms.map((platform) => 
								<FormControlLabel
									control={
										<Checkbox
											checked={ this.props.platforms[platform][renderType] }
											onChange={ this.updatePlatform.bind(this, platform) } />
									}
									label={
										<div>
											{ platformNames[platform] } &nbsp;&nbsp;
											<Button onClick={ this.configurePlatform.bind(this, platform) }>
												Edit
											</Button>
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
					share={ this.state.share['youtube']}
					saveAndClose={ this.closeSubView.bind(this, 'youtube') } />;
			case 'facebook':
				return <FacebookConfig
					share={ this.state.share['facebook']}
					saveAndClose={ this.closeSubView.bind(this, 'facebook') } />;
			case 'twitter':
				return <TwitterConfig
					share={ this.state.share['twitter']}
					saveAndClose={ this.closeSubView.bind(this, 'twitter') } />;
			case 'instagram':
				return <InstagramConfig
					share={ this.state.share['instagram']}
					saveAndClose={ this.closeSubView.bind(this, 'instagram') } />;
			default:
				return null;
		}
	}
}

export default EditVideoType;