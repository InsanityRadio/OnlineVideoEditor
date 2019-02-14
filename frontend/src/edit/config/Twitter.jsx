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

import DefaultConfig from './Default';

export default class TwitterConfig extends DefaultConfig {

	platformName = 'Twitter';

	state = {
		title: '',
		description: '',
		visibility: 'public'
	}

	renderWindow () {
		return (
			<div className="form-container">
				<div className="form-column">
					<TextField
						multiline
						fullWidth={ true }
						variant="outlined"
						helperText={ this.wordCount(this.state.tweet, 280) }
						rows={ 2 } rowsMax={ 10 }
						onChange={ this.updateLocalField.bind(this, 'tweet') }
						value={ this.state.tweet }
						label="Tweet" />
				</div>
			</div>
		);
	}
}