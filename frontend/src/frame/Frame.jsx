import React, { Component } from 'react';

import TimelineComponent from '../components/Timeline';

import Video from '../components/Video';
import VideoControls from '../components/VideoControls';

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
				x: (state) => state['layers.logo'] ? 350 : 512,
				y: 155,
				w: (state) => state['layers.logo'] ? 600 : 915,
				h: 125,
				maxFont: 80,
				wrap: {
					minFont: 40
				},
				textAlign: (state) => state['layers.logo'] ? 'start' : 'middle',
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

	state = {
		'line1': '',
		'line2': '',
		'layers.logo': true,
		'layers.background': false,
		'layers.foreground': true,
		video: {
			playing: false
		}
	}

	componentWillMount () {
		try {
			let initialStateData = JSON.parse(this.props.initialState);
			delete initialStateData.raw;
			this.setState(initialStateData);
		} catch (e) {
		}
	}

	setLayer (canvas, layer) {

		if (this.canva[layer]) {
			return;
		}

		this.canva[layer] = canvas;

		canvas.width = canvas.height = 1024;

		if (layer == 'text') {
			this.rerender();
			return;
		}

		var image = new Image();
		image.onload = () => {
			canvas.getContext('2d').drawImage(image, 0, 0, 1024, 1024);
		}

		image.src = '/frames/demo/' + layer + '.png';

	}

	clearText () {
		let canvas = this.canva['text'];
		let context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);

	}

	/**
	 * Evaluates the configuration given the current state. Useful for dynamic width/heights
	 */
	evaluateConfig (config) {

		let newConfig = Object.assign({}, config);

		for (var i in newConfig) {
			if (typeof newConfig[i] == 'function') {
				newConfig[i] = newConfig[i](this.state);
			}
		}

		return newConfig;

	}

	/**
	 * Draws the given line of text.
	 */
	drawText (config, line) {

		config = this.evaluateConfig(config);
		let context = this.canva['text'].getContext('2d');

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

		let i = 0;

		let BREAK_CHARACTER = '^';

		let words = line.split(' ');

		if (line.indexOf(BREAK_CHARACTER) == -1) {
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

			for (i = words.length; i > 0; i--) {
				let phrase = words.slice(0, i).join(' ');
				if (context.measureText(phrase).width < config.w) {
					break;
				}
			}

		} else {
			i = 1;
			words = line.split(BREAK_CHARACTER);
		}
		
		size = config.wrap.minFont;


		context.font = "bold " + size + "px Bebas Neue";
		context.fillText(words.slice(0, i).join(' '), config.x, config.y - size * 0.7);
		context.fillText(words.slice(i, words.length).join(' '), config.x, config.y + size * 0.7);

	}

	onValueChange(control, modifier, event) {

		let value = (event.target.type == 'checkbox') ? event.target.checked : event.target.value;

		if (modifier != null) {
			value = modifier(value);
		}

		this.setState({
			[control]: value
		}, () => this.rerender());

	}

	rerender () {
		this.clearText();
		this.drawText(this.themeConfig.text.line1, this.state.line1);
		this.drawText(this.themeConfig.text.line2, this.state.line2);
	}

	getStyleForLayer (layer) {

		if (typeof this.state['layers.' + layer] != 'undefined') {
			return this.state['layers.' + layer] ? {} : { display: 'none'}
		}

		return {};

	}

	exportData () {
		let background = this.mergeLayers(['background'], '#000000');
		let foreground = this.mergeLayers(['text', 'logo', 'foreground']);

		let data = {
			'line1': this.state.line1,
			'line2': this.state.line2,
			'layers.logo': this.state['layers.logo'],
			'layers.background': this.state['layers.background'],
			'layers.foreground': this.state['layers.foreground'],
			raw: {
				background: background,
				foreground: foreground
			}
		}

		return JSON.stringify(data);
	}

	mergeLayers (layers, backgroundColour) {

		let canvas = document.createElement('canvas');
		canvas.width = canvas.height = this.canva[layers[0]].width;
		let context = canvas.getContext('2d');

		if (backgroundColour != undefined) {
			context.fillStyle = backgroundColour;
			context.fillRect(0, 0, canvas.width, canvas.height);
		}

		for (var i = 0; i < layers.length; i++) {
			context.drawImage(this.canva[layers[i]], 0, 0);
		}

		return canvas.toDataURL();
	}

	setVideo (video) {
		if (this.video) {
			return false;
		}
		this.video = video;
		this.forceUpdate();
	}

	setVideoState (state) {
		this.setState({
			video: state
		})
	}

	render () {
		return (

			<div class="fullpage">

				<div class="video-container">

					<div class="video-preview-square">

						<canvas ref={ (r) => this.setLayer(r, 'background') } className="layer-0" style={ this.getStyleForLayer('background') } />
						<div className={ this.state['layers.background'] ? "layer-1 video-layer" : "layer-1 video-layer video-layer-stretch"} >
							<Video
								ref={ (v) => this.setVideo(v) }
								hls={ true }
								src={ this.props.previewSRC}
								style={ this.getStyleForLayer('video') } 
								onStateChange={ (state) => this.setVideoState(state) }
								segmentStart = { 0 }
								segmentEnd = { 10 } />

						</div>
						<canvas ref={ (r) => this.setLayer(r, 'text') } className="layer-2" style={ this.getStyleForLayer('text') } />
						<canvas ref={ (r) => this.setLayer(r, 'logo') } className="layer-3" style={ this.getStyleForLayer('logo') } />
						<canvas ref={ (r) => this.setLayer(r, 'foreground') } className="layer-4" style={ this.getStyleForLayer('foreground') } />

					</div>

					<VideoControls video={ this.video } videoState={ this.state.video } />

				</div>


				<div class="video-side">

					<div class="video-selector">

						<AppBar position="static">
							<Toolbar>
								<div style={{ flex: 1 }}>{ this.props.coreImportObj.title }</div>
							</Toolbar>
						</AppBar>

						<div class="side-content">

							<FormControlLabel control={<Checkbox checked={ true } value="checkedC" />} label="Enable Frame" />

							<br />

							<FormControlLabel
								control={<Checkbox checked={ this.state['layers.logo'] }
								onChange={ this.onValueChange.bind(this, 'layers.logo', null) }
								value="true" />} label="Show Logo" />

							<h2 class="side-title">Text Settings</h2>

							<TextField
								value={ this.state.line1 }
								onChange={ this.onValueChange.bind(this, 'line1', null) }
								label="Show Title Text (Top Line)"
								style={{ width: '100%'}} />

							<TextField
								value={ this.state.line2 }
								onChange={ this.onValueChange.bind(this, 'line2', null) }
								label="Segment Title Text (Bottom Line)"
								style={{ width: '100%'}} />

							<h2 class="side-title">Frame Settings</h2>

							<FormControlLabel
								control={<Checkbox checked={ this.state['layers.foreground'] }
								onChange={ this.onValueChange.bind(this, 'layers.foreground', null) }
								value="true" />} label="Foreground Graphics" />
							<Button color="secondary">
								Browse
							</Button>


							<p class="label-hint">(Check me to enable the graphics in the theme that can overlap the video)</p>

							<RadioGroup
								onChange={ this.onValueChange.bind(this, 'layers.background', (value) => value == 'true')}
								value={ this.state['layers.background'] }>

								<FormControlLabel control={ <Radio color="primary" /> } label={ <div>Background Graphic&nbsp;&nbsp;
									<Button color="secondary">
										Browse
									</Button>
								</div> } value={ true } />

								<p class="label-hint"></p>

								<FormControlLabel control={ <Radio color="primary" /> } label="Fit To Screen" value={ false } />

							</RadioGroup>

							<Button
									variant="contained"
									color="secondary"
									fullWidth={ true }
									onClick={ this.props.saveAndClose.bind(this, this.exportData.bind(this)) }
									className="padded-button">
								Save &amp; Return
							</Button>

						</div>

					</div>
				</div>

			</div>

		);
	}
}

export default withStyles(styles)(Frame);
	