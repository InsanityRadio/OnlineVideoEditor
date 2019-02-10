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
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import AbsoluteTimePicker from '../components/AbsoluteTimePicker';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


class VideoSelectorNew extends Component {

	state = {
		cuePoint: '1.0'
	}

	handleClose () {

	}

	setCuePoint (event) {
		this.setState({
			cuePoint: event.target.value
		})
	}

	render () {
		return (
			<Dialog open={ true } scroll="paper">
				<DialogTitle>Upload New Video</DialogTitle>

				<DialogContent>
					<input type="file" />

					<Typography variant="h6" component="h6">
						Cue Point
					</Typography>
					<TextField
						onChange={ this.setCuePoint.bind(this) }
						value={ this.cuePoint }
						type="text"
						placeholder="0.00"
						mask="[0-9]+(\.[0-9]{1,2})?" />

				</DialogContent>

				<DialogActions>
					<Button onClick={this.handleClose} color="secondary">
						Cancel
					</Button>
					<Button onClick={this.handleClose} color="secondary" autoFocus>
						Upload
					</Button>
				</DialogActions>
			</Dialog>
		);
	}
}

export default VideoSelectorNew;
