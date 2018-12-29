import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import './App.css';
import logo from './logo.svg';

import HomeComponent from './home/Home';
import FrameComponent from './frame/Frame';
import ImportComponent from './import/Import';

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
	render () {
		return (
			<BrowserRouter>
				<MuiThemeProvider theme={theme}>
					<Route path="/" component={ HomeComponent } />
					<Route exact path="/import" component={ ImportComponent } />
					<Route path="/import/:id/edit" component={ FrameComponent } />
				</MuiThemeProvider>
			</BrowserRouter>
		);
	}
}

export default App;
