import React, { Component } from 'react';

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

import FacebookAuthorisation from './Facebook';

export default class InstagramAuthorisation extends FacebookAuthorisation {
	state = {
		connected: false,
		facebookPageID: 0,
		facebookPages: [],

		instagramPageID: 0,
		visiblePages: [],
	}

	findPages () {
		return new Promise((resolve, reject) => {
			window.FB.api('/me/accounts', (response) => {
				this.setState({
					facebookPages: response.data
				}, () => this.findInstagramPages())
			});
		});
	}

	findInstagramPages () {
		let visiblePages = [];

		this.state.facebookPages.forEach((page) => {
			window.FB.api('/' + page.id + '?fields=instagram_business_account', (response) => {
				if (response.instagram_business_account != null) {
					page.instagram_page_id = response.instagram_business_account.id;
					visiblePages.push(page);
					this.setState({
						visiblePages: visiblePages
					})
				}
			});
		});
	}

	connectPage () {
		let pageID = this.state.instagramPageID;
		let page = this.state.visiblePages.find((page) => page.id == pageID);

		if (!page) {
			throw new Error('User selected ');
		}

		// Access tokens do not expire. We can just POST this to the backend.
		let fbAccessToken = page.access_token;
		let description = page.name;

		let configuration = {
			page_id: pageID,
			instagram_page_id: page.instagram_page_id,
			access_token: fbAccessToken
		};

		this.props.createPlatform(
			'instagram',
			description,
			configuration
		);
	}

	renderPageSelection () {
		return (
			<div>
				<FormControl variant="outlined" fullWidth={ true }>
					<Select
						fullWidth={ true }
						value={ this.state.instagramPageID }
						variant="outlined"
						onChange={ this.updateLocalField.bind(this, 'instagramPageID') }
						input={ <OutlinedInput fullWidth={ true } /> }>
						{ this.state.visiblePages.map((page) => (
							<MenuItem value={ page.id }>{ page.name }</MenuItem>
						))}
					</Select>
				</FormControl>
				<Button variant="outlined" onClick={ this.connectPage.bind(this) }>
					Link Instagram
				</Button>
			</div>
		);
	}
}