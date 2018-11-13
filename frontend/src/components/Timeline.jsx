import React, { Component } from 'react';
import moment from 'moment';

import TimelineComponent from '../components/Timeline';

import { withStyles } from '@material-ui/core/styles';

class Timeline extends Component {

	state = {
		cursorPosition: 60,
		viewportStart: 0
	}

	shouldComponentUpdate (nextProps, nextState) {

		if (this.viewportStart != nextState.viewportStart) {

			// Force a full re-render if viewportStart changes (i.e. we've either scrolled out of view, etc)
			// React's state is slow so we copy out of the state object to improve efficiency
			this.viewportStart = nextState.viewportStart;
			return true;

		}

		this.rerender();

		return false;
	}

	componentWillMount () {

		this.start = this.props.start;
		this.end = this.props.end;
		this.setState({
			cursorPosition: this.props.initialOffset,
			viewportStart: this.props.initialOffset
		});

		console.log(this.props.initialOffset)

		this.viewportStart = this.props.initialOffset;

		/*setInterval( () => {

			this.setState({
				cursorPosition: this.state.cursorPosition + 0.1
			})

		}, 100); */
	}

	setCanvas (c) {

		if (this.canvas) {
			return;
		}
		this.canvas = c;

		this.resizeCanvas()

		// 2x lets us 

		this.canvasContext = c.getContext('2d');

		this.canvasContext.fillStyle = '#FF0000'
		this.canvasContext.fillRect(0, 0, c.width, c.height)

		this.canvasContext.fillStyle = '#FFF'
		this.canvasContext.fillText('test', 20, 20)

		this.drawFullGrid();
		this.drawPlayhead();

	}

	componentDidUpdate () {

		this.drawFullGrid();

	}

	resizeCanvas () {

		var dpr = window.devicePixelRatio || 1;
		this.canvas.width = this.canvas.offsetWidth * dpr;
		this.canvas.height = this.canvas.offsetHeight * dpr;

		this.canvas.getContext('2d').scale(dpr, dpr);

		this.canvasWidth = this.canvas.offsetWidth;


	}

	getCanvasState () {
		// 150px = 1 unit, based on zoom level
		// 1 unit = 10 seconds
		let unitMap = 150, unit = 60;
		return {
			unitMap: unitMap,
			unit: unit,
			offset: 0,
			// visible seconds
			cursorPosition: this.state.cursorPosition,
			// minor units per major unit (10 minor steps (inclusive) every 1 step)
			steps: 10,
			viewportStart: this.viewportStart - 2,
			viewportWidth: this.canvasWidth / unitMap * unit,
		}
	}

	/**
	 * Draws the timeline base grid, between props.start and props.end. 
	 */
	drawFullGrid () {

		let myDuration = this.end - this.start;

		this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

		let state = this.getCanvasState();

		this.drawLine(0, 40, this.canvas.width, 40);

		let fullWidth = Math.ceil(state.viewportWidth + state.viewportStart);

		for (var i = Math.floor(state.viewportStart); i < fullWidth; i++) {

			let x = (i - state.viewportStart) * state.unitMap / state.unit;

			let mySeconds = i;
			let amIMaj = (i % state.unit) == 0;

			// draw major steps
			if ((i % (state.unit / state.steps)) == 0) {
				this.drawLine(x, 40, x, amIMaj ? 30 : 37);
			}

			// draw time code every interval
			if (amIMaj) {
				let timecode = this.timecode(mySeconds);
				this.drawText(x, 15, timecode[0]);
				this.drawText(x, 30, timecode[1]);
			}

		}

		this.saveCanvas();

		this.drawPlayhead()

	}

	/**
	 * Back-up the pixel data so it can be quickly restored without redrawing everything
	 * This makes redrawing the canvas much faster
	 */
	saveCanvas () {
		this.canvasState = this.canvasContext.getImageData(0,0, this.canvas.width, this.canvas.height);
	}

	restoreCanvas () {
		this.canvasContext.putImageData(this.canvasState, 0, 0);
	}

	rerender () {
		if (!this.canvasContext) {
			return;
		}

		let state = this.getCanvasState();

		if (state.cursorPosition > state.viewportStart + state.viewportWidth) {
			console.log('full rerender')
			this.setState({
				viewportStart: state.cursorPosition - 2
			})
			return this.fullRender();
		} else {
			this.fastRender();
		}
	}

	fullRender () {
		this.drawFullGrid();
	}

	fastRender () {
		this.restoreCanvas();
		this.drawPlayhead();
	}

	drawPlayhead () {

		let state = this.getCanvasState();
		let posX = (state.cursorPosition - state.viewportStart) * state.unitMap / state.unit;

		this.drawLine(posX, 30, posX, 99);

		this.canvasContext.fillRect(posX - 7.5, 28, 15, 12);

	}

	drawLine (x1, y1, x2, y2) {
		this.canvasContext.beginPath();
		this.canvasContext.moveTo(x1, y1);
		this.canvasContext.lineTo(x2, y2);
		this.canvasContext.stroke();
	}

	drawText (x1, y1, text) {
		this.canvasContext.textAlign = 'center';
		this.canvasContext.textBaseline = 'bottom';

		this.canvasContext.fillStyle='#000';
		this.canvasContext.fillText(text, x1, y1);
	}

	/**
	 * Return mouse X/Y. DPI scaling is irrelevant in our logic
	 */
	getMousePosition (event) {
		let rect = this.canvas.getBoundingClientRect();
		return [event.clientX - rect.left, event.clientY - rect.top]
	}

	mouseDown (event) {
		let state = this.getCanvasState(), mousePosition = this.getMousePosition(event);

		// did we click the 
		let playheadX = (state.cursorPosition - state.viewportStart) * state.unitMap / state.unit;

		if (mousePosition[0] > playheadX - 10
			&& mousePosition[0] < playheadX + 10
			&& mousePosition[1] > 28
			&& mousePosition[1] < 40) {

			this.dragging = true;

			console.log('dragging')

		}

	}

	mouseMove (event) {

		if (!this.dragging) {
			return;
		}

		let state = this.getCanvasState(), mousePosition = this.getMousePosition(event);
		let playheadX = (state.cursorPosition - state.viewportStart) * state.unitMap / state.unit;
		let cursorPosition = this.state.cursorPosition;

		// is mouse to left of playhead? move back
		// is mouse to right of playhead? move forward

		if (mousePosition[0] > this.canvasWidth - 20) {

			let velocity = 1 - (this.canvasWidth - mousePosition[0]) / 20;

			this.setState({
				viewportStart: this.state.viewportStart + velocity,
				cursorPosition: Math.max(Math.min(cursorPosition + velocity, this.end), this.start)
			}, () => {
				this.rerender();
			})

		} else if (mousePosition[0] < 20) {

			let velocity = mousePosition[0] / 20;

			this.setState({
				viewportStart: this.state.viewportStart - velocity,
				cursorPosition: Math.max(Math.min(cursorPosition - velocity, this.end), this.start)
			}, () => {
				this.rerender();
			})

		} else {

			// Mouse hasn't moved to an extreme
			let finalCursorPosition = (mousePosition[0] * state.unit / state.unitMap) + state.viewportStart;

			finalCursorPosition = Math.max(Math.min(finalCursorPosition, this.end), this.start);

			this.setState({
				cursorPosition: finalCursorPosition
			}, () => {
				this.rerender();
			})
		}

		// velocity = distance we've moved mouse (even if it's off canvas)

	}

	mouseUp (event) {

		if (!this.dragging) {
			return;
		}

		let state = this.getCanvasState(), mousePosition = this.getMousePosition(event);

		// where did we set it down??
		this.dragging = false;

		let playheadX = mousePosition[0];

		let finalCursorPosition = (playheadX * state.unit / state.unitMap) + state.viewportStart;

			finalCursorPosition = Math.max(Math.min(finalCursorPosition, this.end), this.start);

		/*this.setState({
			cursorPosition: finalCursorPosition
		})*/

		console.log('no drags', finalCursorPosition)

	}

	timecode (seconds) {
		let date = moment.unix(seconds).local();
		return [date.format('DD/MM/YYYY'), date.format('HH:mm:ss')];
	}

	render () {

		return <canvas
			className="timeline-canvas"
			ref={ (c) => this.setCanvas(c) }
			onMouseDown={ this.mouseDown.bind(this) }
			onMouseMove={ this.mouseMove.bind(this) }
			onMouseUp={ this.mouseUp.bind(this) } ></canvas>

	}

}

export default Timeline;