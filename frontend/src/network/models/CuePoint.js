import Model from './Model';

/**
 * CuePoint keeps track of sections of video that might contain useful events. 
 *
 * Hence, it is immutable. 
 */
export default class CuePoint extends Model {

	constructor (data, serviceName) {
		super(data);

		this.attr_reader('service');
		this.attr_reader('start_time');
		this.attr_reader('end_time');
	}

	getThumbnailPath () {
		return '/api/ingest/' + this.get('service') + '/thumbnail.jpg?time=' + (this.get('start_time') + 5);
	}

}