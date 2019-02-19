import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import AirTower from '../network/AirTower';
import FacebookAuthorisation from './authorisation/Facebook';
import CreatePlatform from './CreatePlatform';
import EditPlatform from './EditPlatform';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const styles = theme => ({
	heading: {
		fontSize: theme.typography.pxToRem(15),
		fontWeight: theme.typography.fontWeightRegular,
	},
});

class Config extends Component {

	state = {
		platforms: []
	}

	componentWillMount () {
		this.reload();
	}

	reload () {
		let airTower = AirTower.getInstance().core;

		airTower.loadPlatforms()
			.then((platforms) => this.setState({ platforms }));
	}

	renderPlatform (platform) {
		return (
			<ExpansionPanel>
				<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
					<Typography className={ this.props.classes.heading }>
						<div class="icon-container">
							<FontAwesomeIcon prefix="fab" icon={ platform.icon } />
						</div>
						{ platform.name }
					</Typography>
				</ExpansionPanelSummary>
				<ExpansionPanelDetails>
					<EditPlatform platform={ platform } change={ this.reload.bind(this) } />
				</ExpansionPanelDetails>
			</ExpansionPanel>
		);
	}

	renderNew () {
		return (
			<ExpansionPanel>
				<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
					<Typography className={ this.props.classes.heading }>
						Add New
					</Typography>
				</ExpansionPanelSummary>
				<ExpansionPanelDetails>
					<CreatePlatform embedded={ true } change={ this.reload.bind(this) } />
				</ExpansionPanelDetails>
			</ExpansionPanel>
		);
	}

	render () {
		return (
			<div className="fullpage home one-page">
				<div className="platform-menu-selector">
					{ this.state.platforms.map((platform) => this.renderPlatform(platform)) }
					<Divider />
					{ this.renderNew() }
				</div>
			</div>
		);
	}
}

export default withStyles(styles)(Config);