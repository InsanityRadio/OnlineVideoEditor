import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import AirTower from '../network/AirTower';

import VideoThumbnail from '../components/VideoThumbnail.jsx';
import VideoThumbnailContainer from '../components/VideoThumbnailContainer.jsx';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
	},
});


class Imports extends Component {

	state = {
		imports: [],
		coreImports: [],
		queue: 2
	}

	componentWillMount () {
		this.loadImports()
	}

	getServiceName () {
		return 'video';
	}

	loadImports () {
		let airTower = AirTower.getInstance();
		airTower.ingest.findImports(this.getServiceName())
			.then((imports) => {
				this.setState({
					imports: imports,
					queue: this.state.queue - 1
				}, () => this.recoverMissing())
			});

		airTower.core.loadImports()
			.then((coreImports) => {
				this.setState({
					coreImports: coreImports,
					queue: this.state.queue - 1
				}, () => this.recoverMissing())
			});
	}

	findCoreImport (importObj) {
		let coreImport = this.state.coreImports.find((coreImp) => coreImp.uuid == importObj.uuid);

		return coreImport || {};
	}

	recoverMissing () {
		// Wait for all promises to resolve. 
		if (this.state.queue != 0) {
			return;
		}

		this.state.imports.forEach((importObj) => {
			let coreImport = this.state.coreImports.find((coreImp) => coreImp && coreImp.uuid == importObj.uuid);

			if (!coreImport) {
				this.createCoreImport(importObj);
			}
		})
	}

	createCoreImport (importObj) {
		let airTower = AirTower.getInstance();
		airTower.core.takeOwnership(importObj.service_name, importObj.uuid, '')
			.then((coreImportObj) => {
				// Add the new import object into the array! :-) 
				let newCoreImports = this.state.coreImports.slice(0);
				newCoreImports.push(coreImportObj);
				this.setState({
					coreImports: newCoreImports
				});
			})
	}

	handleSelect (importObj) {
		this.props.history.push('/import/' + importObj.uuid + '/edit');
	}

	openNew () {

	}

	/**
	 * Escape back to the main page
	 */
	handleClose () {
		this.props.history.push('/');
	}

	render () {
		return (

			<div class="fullpage home imports">

				<div class="main-navigation">

					<VideoThumbnailContainer>
						{ this.state.imports.map((importObj) => (
							<VideoThumbnail
								thumbnail={ this.findCoreImport(importObj).thumbnail }
								title={ this.findCoreImport(importObj).title }
								onClick={ this.handleSelect.bind(this, importObj) } />
						))}

						<div className="video-thumbnail-video">
							<Button variant="outlined" onClick={ this.openNew.bind(this) }>
								<FontAwesomeIcon icon="plus" />
							</Button>
						</div>
					</VideoThumbnailContainer>

				</div>

				<div className="video-side">
					<div className="video-selector">
						<AppBar position="static">
							<Toolbar>
								<IconButton color="inherit" aria-label="Return" onClick={ this.handleClose.bind(this) }>
									<FontAwesomeIcon icon="long-arrow-alt-left" />
								</IconButton>
								<div style={{ flex: 1 }}>
									<Typography variant="h5" component="h2">
										Saved Videos
									</Typography>
								</div>
							</Toolbar>
						</AppBar>

						<div className="side-content">
						</div>
					</div>
				</div>

			</div>

		);
	}
}

export default withStyles(styles)(Imports);
