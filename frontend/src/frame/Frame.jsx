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

import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
	},
});


class Frame extends Component {

	themeConfig = {
		text: {
			line1: {
				x: 350,
				y: 155,
				w: 600,
				h: 125,
				maxFont: 80,
				wrap: false,
				textAlign: 'start',
				textBaseline: 'middle'
			},
			line2: {
				x: 512,
				y: 900,
				w: 915,
				h: 175,
				maxFont: 70,
				wrap: {
					minFont: 40
				},
				textAlign: 'center',
				textBaseline: 'middle'
			}
		}
	}

	canva = {};

	componentWillMount () {
	}

	setLayer (canvas, layer) {

		if (this.canva[layer]) {
			return;
		}

		this.canva[layer] = canvas;

		canvas.width = canvas.height = 1024;

		var image = new Image();
		image.onload = () => {
			canvas.getContext('2d').drawImage(image, 0, 0, 1024, 1024);

			if (layer == 'logo') {
				this.drawText(this.themeConfig.text.line2, 'wrap text wrap text wrap text wrap text wrap text wrap text wrap text wrap text wrap text wrap text');
			}
		}

		image.src = '/frames/demo/' + layer + '.png';

	}

	drawText (config, line) {

		let context = this.canva['logo'].getContext('2d');
		context.fillStyle = 'white';
		context.textAlign = config.textAlign;
		context.textBaseline = config.textBaseline;

		var size = config.maxFont;

		if (config.wrap == false) {

			do {
				context.font = "bold " + size + "px Bebas Neue";
				size -= 5;
			} while (context.measureText(line).width > config.w);

			context.fillText(line, config.x, config.y);
			return;

		}

		while (true) {

			context.font = "bold " + size + "px Bebas Neue";
			size -= 5;

			if (context.measureText(line).width <= config.w) {
				// Single line!
				context.fillText(line, config.x, config.y);
				return;
			}

			if (size <= config.wrap.minFont) {
				break;
			}

		}

		let words = line.split(' ');
		size = config.wrap.minFont;

		for (var i = words.length; i > 0; i--) {
			let phrase = words.slice(0, i).join(' ');
			if (context.measureText(phrase).width < config.w) {
				break;
			}
		}

		context.font = "bold " + size + "px Bebas Neue";
		context.fillText(words.slice(0, i).join(' '), config.x, config.y - size * 0.7);
		context.fillText(words.slice(i, words.length).join(' '), config.x, config.y + size * 0.7);

	}

	render () {
		return (

			<div class="fullpage">

				<div class="video-container">

					<div class="video-preview-square">

						<canvas ref={ (r) => this.setLayer(r, 'background') } className="layer-0" />
						<video className="layer-1" src="/video/test.mp4" />
						<canvas ref={ (r) => this.setLayer(r, 'logo') } className="layer-2" />
						<canvas ref={ (r) => this.setLayer(r, 'foreground') } className="layer-3" />

					</div>


				</div>


				<div class="video-side">

					<div class="video-selector">

						<AppBar position="static">
							<Toolbar>
								<div style={{ flex: 1 }}>{ '{videoFileName}' }</div>
								<IconButton color="inherit" aria-label="Menu">
									S
								</IconButton>
							</Toolbar>
						</AppBar>

						<div class="side-content">

							<FormControlLabel control={<Checkbox checked={ true } value="checkedC" />} label="Enable Frame" />

							<h2 class="side-title">Text Settings</h2>

							<TextField label="Show Title Text (Top Line)" style={{ width: '100%'}} />

							<TextField label="Segment Title Text (Bottom Line)" style={{ width: '100%'}} />

							<h2 class="side-title">Frame Settings</h2>

							<FormControlLabel control={<Checkbox checked={ true } value="checkedC" />} label="Foreground Graphics" />
							<Button color="secondary">
								Browse
							</Button>


							<p class="label-hint">(Check me to enable the graphics in the theme that can overlap the video)</p>

							<RadioGroup name="video-style" value="true">

								<FormControlLabel control={ <Radio color="primary" />} label={ <div>Background Graphic&nbsp;&nbsp;<Button color="secondary">
									Browse
								</Button>
</div> } value="true" />
							<p class="label-hint"></p>


								<FormControlLabel control={ <Radio color="primary" />} label="Fit To Screen" value="false" />

							</RadioGroup>

						</div>

					</div>
				</div>

			</div>

		);
	}
}

export default withStyles(styles)(Frame);
	