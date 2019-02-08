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

let platformNames = {
	facebook: 'Facebook',
	twitter: 'Twitter',
	instagram: 'Instagram',
	youtube: 'YouTube'
}


class EditVideoType extends Component {

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

	getRenderProgress () {
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
					style={{ width: this.getRenderProgress() + '%' }}>
				</div>
				<p>{ renderState ? renderState.state : 'N/A' }</p>
			</div>
		);
	}

	render () {
		let renderType = this.props.videoType;

		return (
			<Card className={ this.getStyle() }>
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
											onChange={ this.props.updatePlatform.bind(this, platform, renderType) } />
									}
									label={ platformNames[platform] } />
							)}
						</FormGroup>

					</CardContent>
				</div>
			</Card>
		);
	}
}

export default EditVideoType;