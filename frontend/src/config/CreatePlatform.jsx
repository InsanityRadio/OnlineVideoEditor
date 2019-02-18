import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import AirTower from '../network/AirTower';
import FacebookAuthorisation from './authorisation/Facebook';
import InstagramAuthorisation from './authorisation/Instagram';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

export default class CreatePlatform extends Component {

	state = {
		platforms: []
	}

	componentWillMount () {
		let airTower = AirTower.getInstance().core;

		airTower.loadPlatforms()
			.then((platforms) => this.setState({ platforms }))
	}

	selectPlatform (platform) {
		this.setState({
			platform: platform
		})
	}

	createPlatform (type, name, configuration) {
		let airTower = AirTower.getInstance().core;

		airTower.createPlatform(type, name, JSON.stringify(configuration));
	}

	render () {
		return (
			<div className="fullpage home one-page">
				{ this.renderBody() }
			</div>
		);
	}

	renderBody () {
		switch (this.state.platform) {
			case 'facebook':
				return (
					<Paper className="platform-container">
						<FacebookAuthorisation createPlatform={ this.createPlatform.bind(this)} />
					</Paper>
				);
			case 'instagram':
				return (
					<Paper className="platform-container">
						<InstagramAuthorisation createPlatform={ this.createPlatform.bind(this) } />
					</Paper>
				);
		}

		return (
			<Paper className="platform-container">
				<Button variant="contained" onClick={ this.selectPlatform.bind(this, 'facebook') }>
					Facebook Page
				</Button>
				<Button variant="contained" onClick={ this.selectPlatform.bind(this, 'instagram') }>
					Instagram Business
				</Button>
				<Button variant="contained" disabled onClick={ this.selectPlatform.bind(this, 'twitter') }>
					Twitter Account
				</Button>
				<Button variant="contained" disabled onClick={ this.selectPlatform.bind(this, 'youtube') }>
					YouTube Account
				</Button>
			</Paper>
		);
	}
}