import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
	},
});


class Home extends Component {

	render () {
		return (

			<div class="fullpage home">

				<div class="main-navigation">

					<div class="button">

						<Link to="/import">New Video</Link>
						<Link to="/imports">My Drafts</Link>
						<Link to="/download">Quick Download</Link>

					</div>

				</div>

			</div>

		);
	}
}

export default withStyles(styles)(Home);
