# apostle.js

[![Build Status](https://travis-ci.org/apostle/apostle.js.png?branch=master)](https://travis-ci.org/apostle/apostle.js)
[![NPM version](https://badge.fury.io/js/apostle.png)](http://badge.fury.io/js/apostle)

Node.js and JavaScript bindings for [Apostle.io](http://apostle.io).

You can use this library to send emails via Apostle.io from both the server and the client. The Apostle.io delivery API supports Cross Origin Resource Sharing (CORS).

## Node Installation

### Installing via NPM

```
npm install apostle.io
```

In your code

```
var apostle = require("apostle");
```

## Browser Installation

### Installing via Bower

```
bower install apostle
```

### Installing manually

Download the latest code from GitHub, and include `lib/index.js` in your html.

Apostle.js depends on [Superagent](https://github.com/visionmedia/superagent), which you will need to make available to the browser too.


## Usage

### Domain Key

You will need to provide your apostle domain key to send emails.

```js
apostle.domainKey = "Your domain key";
```

### Sending Email

Sending an email is easy, a minimal example may look like this.

```js
apostle.deliver('welcome_email', {email: 'mal@apostle.io'});
```

You can pass any information that your Apostle.io template might need.


```js
var order = {
	items: ['Widget frame', 'Widget chain', 'Widget seat'],
	id: "abc123"
};

apostle.deliver('order_complete', {
	email: 'mal@apostle.io',
	replyTo: 'support@apostle.io',
	order: order
});
```

### Promises
`apostle.deliver` returns a promise that you can attach success and error callbacks to.

```js
var success = function(){},
	error = function(message, response){};
	
apostle.deliver(…).then(success, error);
```

* Success does not receive any arguments.
* In the case of invalid details being passed, no external request will be made and the promise will be rejected. `message` will be `"invalid"`, and `response` will be an array of mail messages with an error property.
* In the case of delivery failure, the promise will be rejected. `message` will be `"error"`, and `response`  will be a [Superagent Response Object](http://visionmedia.github.io/superagent/#response-properties). See below for error status codes and their meanings.


```js
var success = function(){},
	error = function(message, response){};

// Invalid Template
apostle.mail(false, {email: 'mal@apostle.io'}).then(success, error);
/**
 * error will receive
 * message: 'invalid'
 * response: [{ email: 'mal@apostle.io', error: 'No template provided'}]
 */
 
// Invalid Email
apostle.mail('welcome_email', {}).then(success, error);
/**
 * error will receive
 * message: 'invalid'
 * response: [{ template_id: 'welcome_email', error: 'No email provided'}]
 */

// In the case of a server error
apostle.mail('welcome_email', {email: 'mal@apostle.io'}).then(success, error);
/**
 * error will receive
 * message: 'error'
 * response: Superagent Response Object
 */
 
// Success
apostle.mail('welcome_email', {email: 'mal@apostle.io'}).then(success, error);
/**
 * success will be called with no arguments
 */

```

### Sending multiple emails

You can send multiple emails at once by using a queue. If any of the emails fail validation, no emails will be sent.

```js
var queue = apostle.createQueue();

queue.push('welcome_email', {email: 'mal@apostle.io'});
queue.push('order_email', {email: 'mal@apostle.io', order: order})

queue.deliver().then(success, error);
```

### Failure Responses

When recieving an error callback with `message == 'error'`, it means that the delivery to Apostle.io has failed. There are several circumstances where this might occur. You should check the `response.status` value to determine your next action. Any 2xx status code is considered a success, and will resolve the returned promise. Shortcut methods are available for some responses. In all cases, except a server error,  you can check `response.body.message` for more information.

* `response.unauthorized`, `response.status == 401` – Authorization failed. Either no domain key, or an invalid domain key was supplied.
* `response.badRequest`, `response.status == 400` – Either no json, or invalid json was supplied to the delivery endpoint. This should not occur when using the library correctly.
* `response.status == 422` – Unprocessable entitity. An invalid payload was supplied, usually a missing email or template id, or no recipients key. `Apostle.js` should validate before sending, so it is unlikely you will see this response.
* `response.serverError`, `response.status == 500` – Server error occured. Something went wrong at the Apostle API, you should try again with exponential backoff.


## Who
Created with ♥ by [Mal Curtis](http://github.com/snikch) ([@snikchnz](http://twitter.com/snikchnz))


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request







