import React, { Component } from 'react';
import logo from './logo.svg';

import ImportComponent from './import/Import';
import FrameComponent from './frame/Frame';

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

			<MuiThemeProvider theme={theme}>
				<FrameComponent />
			</MuiThemeProvider>

		);
	}
}

export default App;
