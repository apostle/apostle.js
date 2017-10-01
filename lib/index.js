(function(){
/**
 * JavaScript client library for Apostle.io
 *
 * @package apostle
 * @author Mal Curtis <mal@apostle.io>
 */

/**
 * Dependencies
 */

if (typeof require !== 'undefined')
	var request = require("superagent");

/**
 * Delivery the JSON payload to the delivery endpoint via Request.
 *
 * @param {object} Recipient Payload
 * 		- recipients {object} Email => data object of recipient information
 * @param {promise} Deferred promise object
 *
 * @return {null}
 */
function send(payload, promise) {
	if (typeof apostle.domainKey == 'undefined'){
		promise.reject('invalid', [{error: 'No domain key defined. Please set a domain key with `apostle.domainKey = "abc123"`'}])
		return;
	}
	(request || superagent)
		.post(apostle.deliveryEndpoint)
		.type('json')
		.send(payload)
		.set('Authorization', 'Bearer ' + apostle.domainKey)
		.set('Apostle-Client', 'JavaScript/v0.1.1')
		.end(function(err, res){
			if(res.ok){
				promise.fulfill()
			}else{
				promise.reject('error', res)
			}
		})
}


/**
 * Delivers a single email.
 *
 * @param {string} template id
 * @param {object} payload data, including email address
 * @param {function} callback
 *
 * @return {null}
 */
var deliver = function(template, options) {
	queue = apostle.createQueue();
	queue.push(template, options);
	return queue.deliver();
};

/**
 *	Provides a promise object for immediate or eventual callbacks
 *
 */
var Promise = function(){}
Promise.prototype.error = function(){};
Promise.prototype.success = function(){};
Promise.prototype.state = null;
Promise.prototype.args = null;
Promise.prototype.reject = function(){
	this.args = arguments;
	this.state = false;
	this.error.apply(false, arguments);
};
Promise.prototype.fulfill = function(){
	this.args = arguments;
	this.state = true;
	this.success.apply(false, arguments);
};
Promise.prototype.then = function(success, error){
	if(success) this.success = success;
	if(error) this.error = error;
	if(this.state === true){
		this.success.apply(null, this.args);
	}
	if(this.state === false){
		this.error.apply(null, this.args);
	}
	return this;
};



// Attributes that remain on the root of the json payload for a recipient
var	rootAttributes = {
	email: 'email',
	headers: 'headers',
	layoutId: 'layout_id',
	name: 'name',
	replyTo: 'reply_to',
	attachments: 'attachments'
};

// Add attachment
var attachments = []
var add_attachments = function(name, content){
	/**
	* Adds a single attachment to the list.
	*
	* @param {string} name, name of the file with or without extension
	* @param {string} content , content of the file
	*
	* @return list of attachments
	*/
	attachments.push({'name':name,'data':window.btoa(content)})
	return attachments;
}

var queue = function(){
	return {
		mails: [],
		/**
		 * Adds a single email to the queue.
		 *
		 * @param {string} template id
		 * @param {object} payload data, including email address
		 *
		 * @return {null}
		 */
		push: function(template, options){
			var payload = { data: {}, template_id: template };

			// Add root attributes to the payload root
			for(var attr in rootAttributes){
				if(!rootAttributes.hasOwnProperty(attr)){
					continue;
				}
				if(typeof options[attr] === 'undefined'){
					continue;
				}
				var key = rootAttributes[attr],
					val = options[attr];
				payload[key] = val;
				delete options[attr];
			}

			// Add any left over attribtues to the data object
			for(attr in options){
				if(!options.hasOwnProperty(attr)){
					continue;
				}
				payload.data[attr] = options[attr]
			}

			// Add to the list of emails
			this.mails.push(payload);
		},

		/**
		 * Delivers all the emails on the queue.
		 *
		 * @return {promise} An promise object
		 */
		deliver: function(){
			var payload = { recipients: {} },
				invalid = [],
				promise = new Promise();
			for(var i=0, j=this.mails.length; i < j; i++){
				var data = this.mails[i],
					email = data.email;

					if(!data.template_id){
						invalid.push(data)
						data.error = "No template provided"
						continue;
					}

					if(typeof data.email === 'undefined'){
						invalid.push(data)
						data.error = "No email provided"
						continue;
					}


				delete data['email'];

				payload.recipients[email] = data
			}
			if(invalid.length > 0){
				promise.reject('invalid', invalid);
			}else{
				apostle.send(payload, promise);
			}
			return promise;
		}
	}
};


var apostle = {
	createQueue: queue,
	deliveryEndpoint: 'https://deliver.apostle.io',
	deliver: deliver,
	send: send,
	attachment: add_attachments
};

/**
 * Export
 */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = apostle

else
window.apostle = apostle;
})();
