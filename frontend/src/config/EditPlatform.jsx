import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import AirTower from '../network/AirTower';
import FacebookAuthorisation from './authorisation/Facebook';

export default class CreatePlatform extends Component {

	state = {
		platforms: []
	}

	componentWillMount () {
		let airTower = AirTower.getInstance().core;

		airTower.loadPlatforms()
			.then((platforms) => this.setState({ platforms }))
	}

	render () {
		return (
			<div class="fullpage home">
				<div>
				</div>
			</div>
		);
	}
}