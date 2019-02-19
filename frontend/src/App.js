import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import './App.css';
import logo from './logo.svg';

import AirTower from './network/AirTower';

import ConfigComponent from './config/Config';
import CreatePlatformComponent from './config/CreatePlatform';
import EditPlatformComponent from './config/EditPlatform';

import EditComponent from './edit/Edit';
import HomeComponent from './home/Home';
import ImportComponent from './import/Import';
import ImportsComponent from './imports/Imports';
import PreloadComponent from './Preload';

import Header from './navigation/Header';
import Navigation from './navigation/Navigation';

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
	faPlus,
	faFileVideo,
	faTrash,
	faDownload,
	faPencilAlt,
	faStopwatch
} from '@fortawesome/free-solid-svg-icons';

import {
	faFacebookF,
	faTwitter,
	faInstagram,
	faYoutube
} from '@fortawesome/free-brands-svg-icons';

library.add(
	faPlay,
	faPause,
	faLongArrowAltLeft,
	faLongArrowAltRight,
	faStepBackward,
	faStepForward,
	faSave,
	faPlus,
	faFileVideo,
	faPencilAlt,
	faTrash,
	faDownload,
	faStopwatch,
	faFacebookF,
	faTwitter,
	faInstagram,
	faYoutube
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
			return <PreloadComponent />
		}

		return (
			<BrowserRouter>
				<MuiThemeProvider theme={theme}>
					<div className="page-master">
						<div className="page-container">
							<Navigation />
							<div className="page-outlet">
								<Route exact path="/" component={ HomeComponent } />
								<Route exact path="/import" component={ ImportComponent } />
								<Route exact path="/imports" component={ ImportsComponent } />
								<Route path="/import/:id/edit" component={ EditComponent } />
								<Route exact path="/config" component={ ConfigComponent } />
								<Route path="/config/platform/:id" component={ EditPlatformComponent } />
								<Route exact path="/config/platform/new" component={ CreatePlatformComponent } />
							</div>
						</div>
					</div>
				</MuiThemeProvider>
			</BrowserRouter>
		);
	}
}

export default App;
