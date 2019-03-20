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

		airTower.createPlatform(type, name, JSON.stringify(configuration))
			.then((platform) => this.props.change())
	}

	render () {
		if (this.props.embedded) {
			return this.renderBody();
		}
		return (
			<div className="fullpage home one-page">
				<Paper className="platform-container">
					{ this.renderBody() }
				</Paper>
			</div>
		);
	}

	renderBody () {
		switch (this.state.platform) {
			case 'facebook':
				return (
					<FacebookAuthorisation createPlatform={ this.createPlatform.bind(this)} />
				);
			case 'instagram':
				return (
					<InstagramAuthorisation createPlatform={ this.createPlatform.bind(this) } />
				);
		}

		return (
			<div className="platform-list-container">
				<Button variant="outlined" onClick={ this.selectPlatform.bind(this, 'facebook') }>
					Connect Facebook
				</Button>
				<Button variant="outlined" onClick={ this.selectPlatform.bind(this, 'instagram') }>
					Connect Instagram
				</Button>
				<Button variant="outlined" disabled onClick={ this.selectPlatform.bind(this, 'twitter') }>
					Connect Twitter
				</Button>
				<Button variant="outlined" disabled onClick={ this.selectPlatform.bind(this, 'youtube') }>
					Connect YouTube
				</Button>
			</div>
		);
	}
}