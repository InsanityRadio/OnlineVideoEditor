import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import './App.css';
import logo from './logo.svg';

import AirTower from './network/AirTower';

import EditComponent from './edit/Edit';
import HomeComponent from './home/Home';
import ImportComponent from './import/Import';
import ImportsComponent from './imports/Imports';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

// Set up Font Awesome icons.
// We only import what we need to ensure that we don't use crazy resources.

import { library } from '@fortawesome/fontawesome-svg-core';

import {
	faPlay,
	faPause,
	faLongArrowAltLeft,
	faLongArrowAltRight,
	faStepBackward,
	faStepForward,
	faSave,
	faFileVideo,
	faStopwatch
} from '@fortawesome/free-solid-svg-icons';

library.add(
	faPlay,
	faPause,
	faLongArrowAltLeft,
	faLongArrowAltRight,
	faStepBackward,
	faStepForward,
	faSave,
	faFileVideo,
	faStopwatch
);


const theme = createMuiTheme({
	palette: {
		type: 'dark',
	},
});

class App extends Component {
	state = {
		ready: false
	}
	componentWillMount () {
		AirTower.getInstance().bootstrap().then((a) => {
			this.setState({
				ready: true
			})
		})
	}
	render () {

		if (!this.state.ready) {
			return null;
		}

		return (
			<BrowserRouter>
				<MuiThemeProvider theme={theme}>
					<Route exact path="/" component={ HomeComponent } />
					<Route exact path="/import" component={ ImportComponent } />
					<Route exact path="/imports" component={ ImportsComponent } />
					<Route path="/import/:id/edit" component={ EditComponent } />
				</MuiThemeProvider>
			</BrowserRouter>
		);
	}
}

export default App;
