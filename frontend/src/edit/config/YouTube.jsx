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

export default class YouTubeConfig extends DefaultConfig {

	platformName = 'YouTube';

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
						fullWidth={ true }
						variant="outlined"
						helperText={ this.wordCount(this.state.title, 100) }
						rows={ 2 } rowsMax={ 2 }
						onChange={ this.updateLocalField.bind(this, 'title') }
						value={ this.state.title }
						label="Title" />

					<TextField
						multiline
						fullWidth={ true }
						variant="outlined"
						helperText={ this.wordCount(this.state.description, 5000) }
						rows={ 10 } rowsMax={ 10 }
						onChange={ this.updateLocalField.bind(this, 'description') }
						value={ this.state.description }
						label="Video Description" />
				</div>
				<div className="form-column">
					<FormControl variant="outlined" fullWidth={ true }>
						<Select
							fullWidth={ true }
							value={ this.state.visibility }
							variant="outlined"
							onChange={ this.updateLocalField.bind(this, 'visibility') }
							input={ <OutlinedInput fullWidth={ true } /> }>
							<MenuItem value="public">Public</MenuItem>
							<MenuItem value="unlisted">Unlisted</MenuItem>
							<MenuItem value="private">Private</MenuItem>
						</Select>
					</FormControl>
				</div>
			</div>
		);
	}
}