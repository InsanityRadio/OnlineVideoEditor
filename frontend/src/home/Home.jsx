import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
	},
});


class Home extends Component {
	render () {
		return (<Redirect to="/import" />);
	}
}

export default withStyles(styles)(Home);
