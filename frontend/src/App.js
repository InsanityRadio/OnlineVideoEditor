import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import logo from './logo.svg';

import HomeComponent from './home/Home';
import FrameComponent from './frame/Frame';
import ImportComponent from './import/Import';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import './App.css';

const theme = createMuiTheme({
	palette: {
		type: 'dark'
	},
});

class App extends Component {
	render () {
		return (
			<BrowserRouter>
				<MuiThemeProvider theme={theme}>
					<Route path="/" component={ HomeComponent } />
					<Route path="/import" component={ ImportComponent } />
					<Route path="/import/:id/edit" component={ FrameComponent } />
				</MuiThemeProvider>
			</BrowserRouter>
		);
	}
}

export default App;
