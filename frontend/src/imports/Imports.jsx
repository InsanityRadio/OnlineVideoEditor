import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import AirTower from '../network/AirTower';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
	},
});


class Imports extends Component {

	state = {
		imports: []
	}

	componentWillMount () {
		this.loadImports()
	}

	getServiceName () {
		return 'video';
	}

	loadImports () {
		let airTower = AirTower.getInstance();
		airTower.ingest.findImports(this.getServiceName())
			.then((imports) => {
				this.setState({
					imports: imports
				})
			});
	}

	render () {
		return (

			<div class="fullpage home imports">

				<div class="main-navigation">

					{ this.state.imports.map((importObj) => (
						<Link to={ "/import/" + importObj.uuid + "/edit" }>{ importObj.uuid }</Link>
					)) }

				</div>

			</div>

		);
	}
}

export default withStyles(styles)(Imports);
