import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

import {DateFormatInput, TimeFormatInput} from 'material-ui-next-pickers'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class TimeSelector extends Component {

	state = {
		date: null,
		time: null
	}

	componentWillMount () {
		this.setState({
			date: new Date(this.props.initial),
			time: new Date(this.props.initial)
		})
	}

	change (value, time) {
		this.setState({
			[value]: time
		})
	}

	handleClose () {
		this.props.onClose(undefined);
	}

	handleSelect () {
		this.props.onClose(this.getTime());
	}

	getTime () {
		let date = new Date(this.state.date.getTime());

		date.setHours(this.state.time.getHours())
		date.setMinutes(this.state.time.getMinutes())
		date.setSeconds(this.state.time.getSeconds())
		date.setMilliseconds(this.state.time.getMilliseconds())

		return date;
	}

	render () {
		return (
			<Dialog open={ true } maxWidth={ 'xl' } scroll="paper">
				<DialogTitle>Select Time</DialogTitle>

				<DialogContent style={{ minWidth: '300px', minHeight: '300px'}}>
					<DateFormatInput
						value={this.state.date}
						onChange={this.change.bind(this, 'date')} />
					<TimeFormatInput
						value={this.state.time}
						onChange={this.change.bind(this, 'time')} />
				</DialogContent>

				<DialogActions>
					<Button onClick={ this.handleClose.bind(this) } color="secondary">
						Cancel
					</Button>
					<Button onClick={ this.handleSelect.bind(this) } color="secondary">
						Go
					</Button>
				</DialogActions>
			</Dialog>
		);
	}
}

export default TimeSelector;
