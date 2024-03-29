import Model from './Model';
import Platform from './Platform';

/**
 * Import is a model that represents an import object, as generated by the server.
 *
 * Hence, it is immutable. 
 */
export default class CoreShare extends Model {

	constructor (data, serviceName) {
		super(data);

		this.attr_reader('id');
		this.attr_reader('platform', Platform);
		this.attr_reader('configuration');
		this.attr_reader('title');
		this.attr_reader('description');
		this.attr_reader('publish_on');
		this.attr_reader('shared');
	}

}