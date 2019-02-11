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
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import AbsoluteTimePicker from '../components/AbsoluteTimePicker';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


class VideoSelectorNew extends Component {

	state = {
		cuePoint: '1.0',
		name: '',
		file: null,
		uploading: false
	}

	handleClose () {
		this.props.onClose(undefined);
	}

	handleSelect (slate) {
		this.props.onClose(slate);
	}

	handleSelect (slate) {
		if (isNaN(parseFloat(this.state.cuePoint)) || !this.state.file || this.state.name.length < 4) {
			return;
		}

		this.setState({
			uploading: true
		});

		let airTower = AirTower.getInstance().core;
		airTower.uploadSlate(this.state.name, this.state.file, parseFloat(this.state.cuePoint))
			.then((slate) => this.handleSelect(slate))
	}

	selectFile (file) {
		this.setState({
			file: file
		})
	}

	setData (name, event) {
		this.setState({
			[name]: event.target.value
		})
	}

	render () {
		return (
			<Dialog open={ true } scroll="paper">
				<DialogTitle>Upload New Video</DialogTitle>

				<DialogContent>

					<TextField
						label="Name"
						onChange={ this.setData.bind(this, 'name') }
						value={ this.state.name }
						type="text" />
					<br />

					<input
						type="file"
						onChange={ (e) => this.selectFile(e.target.files[0]) } />
					<br />

					<TextField
						label="Cue Point"
						onChange={ this.setData.bind(this, 'cuePoint') }
						value={ this.state.cuePoint }
						type="text"
						placeholder="0.00"
						mask="[0-9]+(\.[0-9]{1,2})?" />

				</DialogContent>

				<DialogActions>
					<Button
							onClick={ this.handleClose.bind(this) }
							disabled={ this.state.uploading }
							color="secondary">
						Cancel
					</Button>
					<Button
							onClick={ this.handleSelect.bind(this) }
							disabled={ this.state.uploading }
							color="secondary"
							autoFocus>
						Upload
					</Button>
				</DialogActions>
			</Dialog>
		);
	}
}

export default VideoSelectorNew;
