/**
 * JavaScript client library for Apostle.io
 *
 * @package apostle
 * @author Mal Curtis <mal@apostle.io>
 */
/**
apostle.mail("welcome-email", {
	email: "mal@apostle.io",
	username: "Mal Curtis",
}, function(res){});

queue = new apostle.Queue()
queue.add({
	email: "mal@apostle.io",
	username: "Mal Curtis"
})

queue.deliver(success, failure)
*/

/**
 * Dependencies
 */

if (typeof require !== 'undefined')
	var request = require("superagent")

/**
 * Delivery the JSON payload to the delivery endpoint via Request.
 *
 * @param {object} Recipient Payload
 * 		- recipients {object} Email => data object of recipient information
 * @param {function} Callback
 *
 * @return {null}
 */
function deliver(payload, cb) {
	request
		.post(apostle.deliveryEndpoint)
		.type('json')
		.send(payload)
		.set('Authorization', 'Bearer ' + apostle.domainKey)
		.end(function(res){
			if(res.ok){
				cb(true, undefined, res);
			}else{
				cb(false, res.body["message"], res)
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
var mail = function(template, options, cb) {
	queue = apostle.createQueue();
	queue.add(template, options);
	queue.deliver(cb);
};

var	rootAttributes = {
	email: 'email',
	headers: 'headers',
	layoutId: 'layout_id',
	name: 'name',
	replyTo: 'reply_to'
};

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
		add: function(template, options){
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
		 * @param {string} template id
		 * @param {object} payload data, including email address
		 *
		 * @return {null}
		 */
		deliver: function(cb){
			var payload = { recipients: {} },
				invalid = [];
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
				cb && cb(false, 'Validation failed', invalid);
				return;
			}
			apostle.deliver(payload, cb);
		}
	}
};

var apostle = {
	createQueue: queue,
	deliveryEndpoint: 'http://deliver.apostle.io',
	deliver: deliver,
	mail: mail
};

/**
 * Export
 */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = apostle

else
window.apostle = {};
