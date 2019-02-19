import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router';
import { BrowserRouter, Link } from 'react-router-dom';
import classNames from 'classnames';

import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import HomeIcon from '@material-ui/icons/Home';
import MenuIcon from '@material-ui/icons/Menu';
import PublicIcon from '@material-ui/icons/Public';
import QueuePlayNextIcon from '@material-ui/icons/QueuePlayNext';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';

const drawerWidth = 240;

const styles = (theme) => ({
	drawerBase: {
		width: drawerWidth,
		flexShrink: 0,
		whiteSpace: 'nowrap'
	},
	drawerOpen: {
		overflowX: 'hidden',
		width: drawerWidth,
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen
		})
	},
	drawerClose: {
		overflowX: 'hidden',
		width: theme.spacing.unit * 7 + 1,
		[theme.breakpoints.up('sm')]: {
			width: theme.spacing.unit * 8 + 7,
		},
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		})
	},
	menu: {
		paddingTop: 0
	},

	userBox: {
		height: '0px',
		overflowY: 'hidden',
		opacity: 0,
		visibility: 'hidden',
		transition: theme.transitions.create('height', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		})
	},
	userBoxVisible: {
		height: '100px',
		opacity: 1,
		visibility: 'visible'
	},

	hideState: {
		opacity: '0',
		transition: theme.transitions.create('opacity', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		})
	},
	showState: {
		opacity: '1'
	}
})

class Navigation extends Component {

	state = {
		open: false
	}

	toggle () {
		this.setState({
			open: !this.state.open 
		}, () => {
			setTimeout(() => {
				window.dispatchEvent(new Event('resize'));
			}, 295);
		})
	}

	close () {
		this.setState({
			open: false
		}, () => {
			setTimeout(() => {
				window.dispatchEvent(new Event('resize'));
			}, 295);
		})
	}

	render () {
		const { classes } = this.props;

		const drawerClasses = classNames(classes.drawerBase, {
			[classes.drawerOpen]: this.state.open,
			[classes.drawerClose]: !this.state.open,
		})

		const userBoxClasses = classNames(classes.userBox, {
			[classes.userBoxVisible]: this.state.open
		})

		const hideOnOpen = classNames({
			[classes.hideState]: this.state.open,
			[classes.showState]: !this.state.open
		})

		return (
			<Drawer open={ this.state.open } anchor="left" variant="permanent" className={ drawerClasses } classes={{ paper: drawerClasses }}>
				<List className={ classes.menu }>
					<ListItem button={ !this.state.open } onClick={ this.toggle.bind(this) }>
						<ListItemIcon>
							<MenuIcon className={ hideOnOpen } />
						</ListItemIcon>
						<ListItemText primary={""} />
						<IconButton>
							<ChevronLeftIcon />
						</IconButton>
					</ListItem>

					<div className={ userBoxClasses }>
						{ '{ user.name }' }
					</div>
					<Divider />

					<ListItem component={ Link } button to="/" onClick={ this.close.bind(this) }>
						<ListItemIcon>
							<HomeIcon />
						</ListItemIcon>
						<ListItemText primary="Home" />
					</ListItem>

					<ListItem component={ Link } button to="/import" onClick={ this.close.bind(this) }>
						<ListItemIcon>
							<QueuePlayNextIcon />
						</ListItemIcon>
						<ListItemText primary="New Import" />
					</ListItem>

					<ListItem component={ Link } button to="/imports" onClick={ this.close.bind(this) }>
						<ListItemIcon>
							<VideoLibraryIcon />
						</ListItemIcon>
						<ListItemText primary="Import Library" />
					</ListItem>

					<ListItem component={ Link } button to="/config" onClick={ this.close.bind(this) }>
						<ListItemIcon>
							<PublicIcon />
						</ListItemIcon>
						<ListItemText primary="Platform Settings" />
					</ListItem>

				</List>
			</Drawer>
		);
	}
}

export default withStyles(styles, { withTheme: true })(Navigation);