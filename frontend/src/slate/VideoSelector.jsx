import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

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
		dialog: ''
	}

	handleClose () {

	}

	openNew () {
		this.setState({
			dialog: 'new'
		})
	}

	render () {
		return (
			<Dialog open={ true } maxWidth={ 'xl' } scroll="paper">
				<DialogTitle>Select Video</DialogTitle>

				{ this.state.dialog == 'new' && (
					<VideoSelectorNew />
				)}

				<DialogContent>
					<VideoThumbnailContainer>
						<VideoThumbnail thumbnail={ '/video/test.jpg'} title="Video Test" />
						<VideoThumbnail thumbnail={ '/video/test.jpg'} title="Video Test" />
						<VideoThumbnail thumbnail={ '/video/test.jpg'} title="Video Test" />

						<div className="video-thumbnail-video">
							<Button variant="outlined" onClick={ this.openNew.bind(this) }>
								<FontAwesomeIcon icon="plus" />
							</Button>
						</div>
					</VideoThumbnailContainer>
				</DialogContent>

				<DialogActions>
					<Button onClick={this.handleClose} color="secondary">
						Cancel
					</Button>
					<Button onClick={this.handleClose} color="secondary" autoFocus>
						Select
					</Button>
				</DialogActions>
			</Dialog>
		);
	}
}

export default VideoSelector;
