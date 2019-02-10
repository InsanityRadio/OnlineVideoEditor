import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';


class VideoThumbnailContainer extends Component {

	render () {
		return (
			<div className="video-thumbnail-container">
				{ this.props.children }
			</div>
		);
	}
}

export default VideoThumbnailContainer;
