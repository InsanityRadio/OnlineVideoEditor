import React, { Component } from 'react';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

let styles = {
	textField: {
		fontSize: '10pt'
	},
	topRowButton: {
		minWidth: '30px'
	}
}

/**
 * AbsoluteTimePicker renders all the necessary bits to select a cue point with very high accuracy.
 */
class AbsoluteTimePicker extends Component {

	componentWillMount () {

	}

	playPause () {
		this.props.videoState.playing ? this.props.video.pause() : this.props.video.play();
	}

	seekStart () {

	}

	seekEnd () {

	}

	stepBackwards () {
		this.props.video.stepBackwards();
	}

	stepForwards () {
		this.props.video.stepForwards();
	}

	format (dateTime) {
		return dateTime;
	}

	timecode (seconds) {
		let date = moment.unix(seconds).local();
		return [date.format('DD/MM/YYYY HH:mm:ss.SSS Z')];
	}

	setBackwards () {
		this.triggerOnChange(this.props.value - (1 / this.props.video.getFrameRate()));
	}

	setForwards () {
		this.triggerOnChange(this.props.value + (1 / this.props.video.getFrameRate()));
	}

	setNow () {
		this.triggerOnChange(this.props.video.getTimecode());
	}

	triggerOnChange (value) {
		console.log('trigger on change', value, this.props.onChange)
		this.props.onChange && this.props.onChange(value);
	}

	render () {

		return (
			<div className="absolute-time-container">

				<TextField
					variant="outlined"
					margin="normal"
					style={{ width: '270px', flex: '1' }}
					InputProps={{
						classes: {
							input: this.props.classes.textField
						}
					}}
					label={ this.props.label }
					value={ this.timecode(this.props.value)[0] }
					onChange={ (a) => '' } />

				<div class="absolute-time-button-array">
					<Button
							onClick={ this.setBackwards.bind(this) }
							variant="outlined"
							color="white"
							size="small"
							className={ this.props.classes.topRowButton }>
						<FontAwesomeIcon icon="step-backward" />
					</Button>
					<Button
							onClick={ this.setNow.bind(this) }
							variant="outlined"
							color="white"
							size="small"
							className={ this.props.classes.topRowButton }>
						<FontAwesomeIcon icon="stopwatch" />
					</Button>
					<Button
							onClick={ this.setForwards.bind(this) }
							variant="outlined"
							color="white"
							size="small"
							className={ this.props.classes.topRowButton }>
						<FontAwesomeIcon icon="step-forward" />
					</Button>
				</div>

			</div>
		);
	}

}

export default withStyles(styles)(AbsoluteTimePicker);