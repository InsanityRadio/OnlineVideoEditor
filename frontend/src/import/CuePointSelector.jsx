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

import Moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class CuePointSelector extends Component {

	state = {
		dialog: '',
		points: []
	}

	componentWillMount () {
		this.loadCuePoints()
	}

	loadCuePoints () {
		let airTower = AirTower.getInstance().ingest;
		airTower.loadCuePoints().then((points) => this.setState({ points: points.reverse() }));
	}

	handleClose () {
		this.props.onClose(undefined);
	}

	handleSelect (point) {
		this.props.onClose(point)
	}

	formatTime (point) {
		return this.formatHMS(new Date(point.start_time * 1000)) + " - " + this.formatHMS(new Date(point.end_time * 1000));
	}

	formatHMS (time) {
		return time.toISOString().substr(11, 8);
	}

	render () {
		return (
			<Dialog open={ true } maxWidth={ 'xl' } scroll="paper">
				<DialogTitle>Select Video</DialogTitle>

				<DialogContent>
					<VideoThumbnailContainer>

						{ this.state.points.map((point) => (
							<VideoThumbnail
								thumbnail={ point.getThumbnailPath() }
								title={ this.formatTime(point) }
								onClick={ this.handleSelect.bind(this, point) } />
						))}

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

export default CuePointSelector;
