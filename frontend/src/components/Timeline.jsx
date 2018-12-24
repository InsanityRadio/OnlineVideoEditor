import React, { Component } from 'react';
import moment from 'moment';

import { Slider } from 'material-ui-slider';
import { withStyles } from '@material-ui/core/styles';

const styles = {
	slider: {
		color: '#C00',
		width: '50px',
		float: 'right',
		padding: '22px 0px',
	},
};

class Timeline extends Component {

	state = {
		cursorPosition: 60,
		zoom: 8,
		viewportStart: 0
	}

	shouldComponentUpdate (nextProps, nextState) {

		this.start = nextProps.start;
		this.end = nextProps.end;

		if (this.state.zoom != nextState.zoom) {
			return true;
		}

		if (!this.draggingPlayhead && this.props.offset != nextProps.offset) {

			// Will updating the offset scroll us out of view?
			let state = this.getCanvasState();

			if (nextProps.offset < state.viewportStart || nextProps.offset > state.viewportStart + state.viewportWidth) {
				nextState.viewportStart = nextProps.offset - state.viewportWidth / 3;
			}

			this.setState({
				cursorPosition: nextProps.offset,
				viewportStart: nextState.viewportStart
			})

			return true;

		}

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
			cursorPosition: this.props.offset || this.props.initialOffset,
			viewportStart: this.props.offset || this.props.initialOffset
		});

		this.viewportStart = this.props.offset || this.props.initialOffset;

	}

	setCanvas (c) {

		if (this.canvas) {
			return;
		}
		this.canvas = c;

		this.resizeCanvas()

		// 2x lets us 

		this.canvasContext = c.getContext('2d');

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

	getZoom (level) {
		// 150
		let unitMap = (this.state.zoom || 150), unit = 60, steps = 10;

		if (level < 2) {
			return [level * 50 + 10, 1800, 6];
		} else if (level < 4) {
			return [(level - 2) * 50 + 100, 600, 10];
		} else if (level < 6) {
			return [(level - 4) * 50 + 100, 300, 10];
		} else if (level < 9) {
			// 100 - 200
			return [(level - 6) * 25 + 100, 60, 10];
		} else {
			return [(level - 6) * 25 + 100, 30, 60];
		}

		return [150, 60, 10];
	}

	getCanvasState () {
		// 150px = 1 unit, based on zoom level
		// 1 unit = 10 seconds

		let zoomLevels = this.getZoom(this.state.zoom);

		let unitMap = zoomLevels[0], unit = zoomLevels[1], steps = zoomLevels[2];

		return {
			unitMap: unitMap,
			unit: unit,
			offset: 0,
			// visible seconds
			cursorPosition: this.state.cursorPosition,
			// minor units per major unit (10 minor steps (inclusive) every 1 step)
			steps: steps,
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

				this.canvasContext.strokeStyle = amIMaj ?  '#CCC' : 'rgba(255, 255, 255, 0.3)';


				this.drawLine(x, 80, x, amIMaj ? 30 : 37);
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
		this.drawSegments();
		this.drawPlayhead();
	}

	drawPlayhead () {

		let state = this.getCanvasState();
		let posX = (state.cursorPosition - state.viewportStart) * state.unitMap / state.unit;

		this.canvasContext.strokeStyle = '#EEE';
		this.canvasContext.fillStyle = '#EEE';

		this.drawLine(posX, 30, posX, 99);

		this.canvasContext.fillRect(posX - 7.5, 28, 15, 12);

	}

	drawSegments () {
		this.drawSegment({
			start: this.props.segmentStart,
			end: this.props.segmentEnd
		})
	}

	drawSegment (segment) {

		let state = this.getCanvasState();

		let startX = (segment.start - state.viewportStart) * state.unitMap / state.unit;
		let endX = (segment.end - state.viewportStart) * state.unitMap / state.unit;

		// No point drawing it if it's really far off screen.
		if (startX > this.canvasWidth + 40 || endX < -40) {
			return;
		}

		this.canvasContext.strokeStyle = 'rgba(200, 0, 0, 0.4)';
		this.canvasContext.fillStyle = 'rgba(200, 0, 0, 0.7)';

		this.canvasContext.fillRect(startX, 40, endX - startX, 40);

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

		this.canvasContext.fillStyle = '#FFF';
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

		if (mousePosition[1] >= 40) {
			return;
		}

		this.draggingStartX = mousePosition[0];
		this.draggingViewportStart = this.state.viewportStart;
		this.draggingTimeline = true;
		this.hasMovedTimeline = false;

		if (mousePosition[1] <= 28) {
			return;
		}

		if (mousePosition[0] > playheadX - 10
			&& mousePosition[0] < playheadX + 10) {

			this.draggingTimeline = false;
			this.draggingPlayhead = true;

		}

	}

	mouseMove (event) {

		let state = this.getCanvasState(), mousePosition = this.getMousePosition(event);

		if (this.draggingTimeline) {

			let newX = (this.draggingStartX - mousePosition[0]) * state.unit / state.unitMap;

			if (newX != 0) {
				this.hasMovedTimeline = true;
			}

			this.setState({
				viewportStart: this.draggingViewportStart + newX
			}, () => {
				this.rerender();
			})

			return;
		}

		if (!this.draggingPlayhead) {
			return;
		}

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
				this.props.onChange && this.props.onChange(this.state.cursorPosition);
			})

		} else if (mousePosition[0] < 20) {

			let velocity = mousePosition[0] / 20;

			this.setState({
				viewportStart: this.state.viewportStart - velocity,
				cursorPosition: Math.max(Math.min(cursorPosition - velocity, this.end), this.start)
			}, () => {
				this.rerender();
				this.props.onChange && this.props.onChange(this.state.cursorPosition);
			})

		} else {

			// Mouse hasn't moved to an extreme
			let finalCursorPosition = (mousePosition[0] * state.unit / state.unitMap) + state.viewportStart;

			finalCursorPosition = Math.max(Math.min(finalCursorPosition, this.end), this.start);

			this.setState({
				cursorPosition: finalCursorPosition
			}, () => {
				this.rerender();
				this.props.onChange && this.props.onChange(this.state.cursorPosition);
			})
		}

		// velocity = distance we've moved mouse (even if it's off canvas)

	}

	mouseUp (event) {

		let state = this.getCanvasState(), mousePosition = this.getMousePosition(event);

		if (!this.draggingPlayhead && !this.hasMovedTimeline) {

			this.draggingTimeline = false;

			if (mousePosition[1] <= 28 || mousePosition[1] >= 40) {
				return;
			}

			// User clicked timeline without moving it

			let finalCursorPosition = (mousePosition[0] * state.unit / state.unitMap) + state.viewportStart;

			finalCursorPosition = Math.max(Math.min(finalCursorPosition, this.end), this.start);

			this.setState({
				cursorPosition: finalCursorPosition
			}, () => {
				this.rerender();
				this.props.onChange && this.props.onChange(this.state.cursorPosition);
			})

			return;
		}

		if (this.draggingTimeline) {
			// User dragged timeline, we don't want to register their drop position as we don't care.
			this.draggingTimeline = false;
			return;
		}

		this.draggingPlayhead = false;

		// User dragged playhead

		// where did we set it down??
		let playheadX = mousePosition[0];

		let finalCursorPosition = (playheadX * state.unit / state.unitMap) + state.viewportStart;
		finalCursorPosition = Math.max(Math.min(finalCursorPosition, this.end), this.start);

		this.setState({
			cursorPosition: finalCursorPosition
		}, () => {
			// Invoke the onChange event to allow appropriate action
			this.props.onChange && this.props.onChange(finalCursorPosition);
		})

	}

	timecode (seconds) {
		let date = moment.unix(seconds).local();
		return [date.format('DD/MM/YYYY'), date.format('HH:mm:ss')];
	}

	setZoom (value) {
		// given the zoom level, work out where the cursor is in pixels & align it properly

		let state = this.getCanvasState();
		let posX = (state.cursorPosition - state.viewportStart) * state.unitMap / state.unit;

		let newZoom = this.getZoom(value);
		let newUnitMap = newZoom[0], newUnit = newZoom[1];

		let viewportStart = this.viewportStart = state.cursorPosition - (posX * newUnit / newUnitMap);

		this.setState({
			zoom: value,
			viewportStart: viewportStart
		}, () => this.fullRender())
	}

	render () {

		return <div style={{ textAlign: 'right' }}>
			<div style={ styles.slider }>
				<Slider
					color={ styles.slider.color }
					value={ this.state.zoom }
					min={ 1 }
					max={ 10 }
					onChange={ (value) => this.setZoom(value) }></Slider>
			</div>
			<canvas
				className="timeline-canvas"
				ref={ (c) => this.setCanvas(c) }
				onMouseDown={ this.mouseDown.bind(this) }
				onMouseMove={ this.mouseMove.bind(this) }
				onMouseUp={ this.mouseUp.bind(this) } ></canvas>
		</div>;

	}

}

export default withStyles(styles)(Timeline);