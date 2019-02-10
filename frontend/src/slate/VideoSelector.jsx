import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import AirTower from '../network/AirTower';

import VideoThumbnail from '../components/VideoThumbnail.jsx';
import VideoThumbnailContainer from '../components/VideoThumbnailContainer.jsx';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

import VideoSelectorNew from './VideoSelectorNew';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class VideoSelector extends Component {

	state = {
		dialog: '',
		slates: []
	}

	componentWillMount () {
		this.loadSlates();
	}

	loadSlates () {
		let airTower = AirTower.getInstance().core;

		airTower.loadSlates().then((slates) => this.setState({ slates }))
	}

	handleClose () {
		this.props.onClose(undefined);
	}

	handleSelect (slate) {
		this.props.onClose(slate)
	}

	openNew () {
		this.setState({
			dialog: 'new'
		})
	}

	closeSlateView (saveData) {
		this.props.onClose(saveData);
	}

	render () {
		return (
			<Dialog open={ true } maxWidth={ 'xl' } scroll="paper">
				<DialogTitle>Select Video</DialogTitle>

				{ this.state.dialog == 'new' && (
					<VideoSelectorNew
						onClose={ this.closeSlateView.bind(this) } />
				)}

				<DialogContent>
					<VideoThumbnailContainer>
						{ this.state.slates.map((slate) => (
							<VideoThumbnail
								thumbnail={ slate.getThumbnailPath() }
								title={ slate.name }
								onClick={ this.handleSelect.bind(this, slate) } />
						))}

						<div className="video-thumbnail-video">
							<Button variant="outlined" onClick={ this.openNew.bind(this) }>
								<FontAwesomeIcon icon="plus" />
							</Button>
						</div>
					</VideoThumbnailContainer>
				</DialogContent>

				<DialogActions>
					<Button onClick={ this.handleClose.bind(this) } color="secondary">
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		);
	}
}

export default VideoSelector;
