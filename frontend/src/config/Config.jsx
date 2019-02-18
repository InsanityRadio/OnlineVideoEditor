import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import AirTower from '../network/AirTower';
import FacebookAuthorisation from './authorisation/Facebook';

import Button from '@material-ui/core/Button';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class Config extends Component {

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
			<div className="fullpage home one-page">
				<Paper className="platform-menu-selector">
					<MenuList fullWidth={ true } className="platform-menu-list">
					{ this.state.platforms.map((platform) => (
						<MenuItem component={ Link } to={ "/config/platform/" + platform.id }>
							<ListItemIcon>
								<FontAwesomeIcon prefix="fab" icon={ platform.icon } />
							</ListItemIcon>
							<ListItemText primary={ platform.name } />
						</MenuItem>
					))}

						<MenuItem component={ Link } to="/config/platform/new">
							<ListItemIcon>
								<FontAwesomeIcon icon="plus" />
							</ListItemIcon>
							<ListItemText primary="Link New Page" />
						</MenuItem>
					</MenuList>
				</Paper>
			</div>
		);
	}
}