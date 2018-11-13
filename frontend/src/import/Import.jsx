import React, { Component } from 'react';

import TimelineComponent from '../components/Timeline';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';


import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
	},
});


class Import extends Component {

	componentWillMount () {

		let topOfHour = (Date.now() / 1000 | 0); topOfHour = topOfHour - (topOfHour % 3600);

		// Show 5 minutes initially in our window 
		let topOfHourPlus = topOfHour + 300;

		this.start = topOfHour;
		this.end = topOfHourPlus;

	}

	render () {
		return (

			<div class="fullpage">

				<div class="video-container">

					<div class="video-player">
						<video class="video-player-video-element" controls />
					</div>

					<div class="video-controls">
						PLAY / PAUSE / FORWARD / BACKWARDS 
					</div>

					<div class="video-timeline">
						
						<TimelineComponent start={this.start} end={this.end} initialOffset={ this.start + 5 } />

					</div>

				</div>

				<div class="video-side">

					<div class="video-selector">

						<AppBar position="static">
							<Toolbar>
								<div style={{ flex: 1 }}></div>
								<IconButton color="inherit" aria-label="Menu">
									S
								</IconButton>
							</Toolbar>
						</AppBar>

						<h1>Import Wizard.</h1>

						<h3>1. Find Content</h3>

						<Button variant="outlined" color="secondary">
							Search By Time
						</Button>

						<Button variant="outlined" color="secondary">
							Search By Clip
						</Button>

						<br /><br />
						<hr /><br />

						<Button variant="outlined" color="primary">
							Save For Later
						</Button>

						<br /><br />

						<h3>2. Options</h3>

<RadioGroup
            aria-label="gender"
            name="gender2"
            style={{ color: '#FFF' }}
          >
            <FormControlLabel
              value="female"
              control={<Radio color="primary" />}
              label="Female"
              labelPlacement="start"
            />
            <FormControlLabel
              value="male"
              control={<Radio color="primary" />}
              label="Male"
              labelPlacement="start"
            />
            <FormControlLabel
              value="other"
              control={<Radio color="primary" />}
              label="Other"
              labelPlacement="start"
            />
            <FormControlLabel
              value="disabled"
              disabled
              control={<Radio />}
              label="(Disabled option)"
              labelPlacement="start"
            />
          </RadioGroup>

					</div>


				</div>

			</div>

		);
	}
}

export default withStyles(styles)(Import);
