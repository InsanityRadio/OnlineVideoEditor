import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import OutlinedInput from '@material-ui/core/OutlinedInput';

import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

export default class DefaultConfig extends Component {

	state = {
		title: '',
		description: '',
		visibility: 'public'
	}

	componentWillMount () {
		let share = this.props.share;

		this.setState({
			title: share.title,
			description: share.description, 
			... share.configuration
		})
	}

	handleClose () {
		this.props.saveAndClose(undefined);
	}

	handleSave () {
		this.props.saveAndClose({
			title: this.state.title,
			description: this.state.description,
			configuration: JSON.stringify(this.state)
		})
	}

	updateLocalField (field, event) {
		this.setState({
			[field]:  event.target[event.target.hasOwnProperty('checked') ? 'checked' : 'value']
		});
	}

	renderWindow () {
		return (
			<div className="form-container">
			</div>
		);
	}

	wordCount (field, max) {
		let length = typeof field == 'string' ? field.length : 0;

		return (
			<FormHelperText className="form-helper">
				{ length + '/' + max }
			</FormHelperText>
		)
	}

	render () {
		return (
			<Dialog open={ true } maxWidth={ 'xl' } fullWidth={ true } scroll="paper">
				<DialogTitle>{ this.platformName }</DialogTitle>

				<DialogContent>
					{ this.renderWindow() }
				</DialogContent>

				<DialogActions>
					<Button onClick={ this.handleClose.bind(this) } color="secondary">
						Cancel
					</Button>
					<Button onClick={ this.handleSave.bind(this) } color="secondary" autofocus>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		);
	}
}