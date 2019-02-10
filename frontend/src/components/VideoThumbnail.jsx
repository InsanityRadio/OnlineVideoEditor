import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

class VideoThumbnail extends Component {

	render () {
		return (
			<div className="video-thumbnail-video">
				<Button variant="outlined">
					<div>
						<img src={ this.props.thumbnail} />
						<p>{ this.props.title }</p>
					</div>
				</Button>
			</div>
		);
	}
}

export default VideoThumbnail;
