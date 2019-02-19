import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import OutlinedInput from '@material-ui/core/OutlinedInput';

import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';

import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

export default class FacebookAuthorisation extends Component {
	state = {
		connected: false,
		facebookPageID: 0,
		facebookPages: [],
		visiblePages: [],
	}

	componentWillMount () {
		if (!window.FB) {
			let asyncInit = window.fbAsyncInit;
			window.fbAsyncInit = function () {
				asyncInit();
				this.facebookReady();
			}
		}
		this.facebookReady();
	}

	facebookReady () {
		window.FB.getLoginStatus((response) => {
		})
	}

	facebookLogin () {
		window.FB.login((response) => {
			if (response.status == 'connected') {
				this.setState({
					connected: true
				}, () => this.findPages());
			}
		}, { auth_type: 'reauthenticate', scope: ['instagram_basic', 'manage_pages', 'publish_pages'] })
	}

	findPages () {
		return new Promise((resolve, reject) => {
			window.FB.api('/me/accounts', (response) => {
				this.setState({
					facebookPages: response.data
				}); //, () => this.findInstagramPages())
			});
		});
	}

	findInstagramPages () {
		let visiblePages = [];

		this.state.facebookPages.forEach((page) => {
			window.FB.api('/' + page.id + '?fields=instagram_business_account', (response) => {
				if (response.instagram_business_account != null) {
					visiblePages.push(page)
					this.setState({
						visiblePages: visiblePages
					})
				}
			});
		});
	}

	componentWillUnmount () {

	}

	render () {
		return (
			<div style={{ width: '100%' }}>
				{ this.state.connected ? this.renderPageSelection() : this.renderAuthentication() }
			</div>
		);
	}

	updateLocalField (field, event) {
		this.setState({
			[field]:  event.target[event.target.hasOwnProperty('checked') ? 'checked' : 'value']
		});
	}

	connectPage () {
		let pageID = this.state.facebookPageID;
		let page = this.state.facebookPages.find((page) => page.id == pageID);

		if (!page) {
			throw new Error('User selected ');
		}

		// Access tokens do not expire. We can just POST this to the backend.
		let fbAccessToken = page.access_token;
		let description = page.name;

		let configuration = {
			page_id: pageID,
			user_access_token: window.FB.getAuthResponse()['accessToken'],
			page_access_token: fbAccessToken
		};

		this.props.createPlatform(
			'facebook',
			description,
			configuration
		);
	}

	renderPageSelection () {
		return (
			<div style={{ width: '100%' }}>
				<FormControl variant="outlined" fullWidth={ true }>
					<Select
						fullWidth={ true }
						value={ this.state.facebookPageID }
						variant="outlined"
						onChange={ this.updateLocalField.bind(this, 'facebookPageID') }
						input={ <OutlinedInput fullWidth={ true } /> }>
						{ this.state.facebookPages.map((page) => (
							<MenuItem value={ page.id }>{ page.name }</MenuItem>
						))}
					</Select>
				</FormControl>
				<Divider />
				<ExpansionPanelActions>
					<Button onClick={ this.connectPage.bind(this) }>
						{ this.props.instagram ? 'Link Instagram' : 'Connect Page' }
					</Button>
				</ExpansionPanelActions>
			</div>
		);
	}

	renderAuthentication () {
		return (
			<Button variant="outlined" onClick={ this.facebookLogin.bind(this) }>
				Authorize Account
			</Button>
		);
	}
}