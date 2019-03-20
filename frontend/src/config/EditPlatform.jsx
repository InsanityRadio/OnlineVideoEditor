import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import AirTower from '../network/AirTower';
import FacebookAuthorisation from './authorisation/Facebook';
import InstagramAuthorisation from './authorisation/Instagram';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

export default class EditPlatform extends Component {

	state = {
		platforms: []
	}

	componentWillMount () {
	}

	updatePlatform (type, name, configuration) {
		let airTower = AirTower.getInstance();
		airTower.core.updatePlatform(this.props.platform.id, name, JSON.stringify(configuration))
			.then((platform) => this.props.change())
	}

	reauthenticate () {
		this.setState({
			reauthenticate: true
		})
	}

	removePlatform () {
		let airTower = AirTower.getInstance();
		airTower.core.deletePlatform(this.props.platform.id)
			.then((platform) => this.props.change())
	}

	render () {
		switch (this.state.reauthenticate && this.props.platform.platform_type) {
			case 'facebook':
				return (
					<FacebookAuthorisation createPlatform={ this.updatePlatform.bind(this)} />
				);
			case 'instagram':
				return (
					<InstagramAuthorisation createPlatform={ this.updatePlatform.bind(this) } />
				);
		}
		return (
			<div class="platform-list-container">
				<Button variant="outlined" onClick={ this.reauthenticate.bind(this) }>
					Re-Authenticate
				</Button>
				<Button variant="outlined" onClick={ this.removePlatform.bind(this) }>
					Remove
				</Button>
			</div>
		);
	}
}