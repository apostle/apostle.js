var assert = require("assert"),
	apostle = require("../../lib"),
	sinon = require("sinon")
	request = require("superagent");

describe("apostle", function(){
	describe("#mail", function(){
		it("creates a queue, adds itself, and delivers", function(){
			var queue = {push:function(){}, deliver:function(){}};

			stub = sinon.stub(apostle, "createQueue").returns(queue)
			push = sinon.stub(queue, "push")
			deliver = sinon.stub(queue, "deliver")
			apostle.deliver("asd", {email: "asd"})

			assert(push.called);
			assert(deliver.called);

			push.restore()
			deliver.restore()
			stub.restore()
		})
	})
	describe("Queue", function(){
		describe("#deliver", function(){
			it("validates template", function(done){
				queue = apostle.createQueue()
				queue.push(undefined, {})
				queue.deliver().then(false, function(message, data){
					assert.equal(message, "invalid")
					assert.equal(data[0].error, "No template provided")
					done()
				})

			})
			it("validates email", function(done){
				apostle.deliver("template", {}).then(false, function(message, data){
					assert.equal(message, "invalid")
					assert.equal(data[0].error, "No email provided")
					done()
				})
			})
			it("sends recipients to apostle#deliver", function(){
				var queue = apostle.createQueue(),
					send = sinon.stub(apostle, 'send');

				queue.push("template 1", {email: "1", replyTo: "reply", foo: "bar"})
				queue.push("template 2", {email: "2", replyTo: "reply", baz: "bar"})
				queue.deliver();

				assert(send.calledWith({ recipients: {
					"1": {
				   		data: { foo: "bar"},
						template_id: "template 1",
				   		reply_to: "reply"
					},
					"2": {
				   		data: { baz: "bar"},
						template_id: "template 2",
				   		reply_to: "reply"
					}
				}}))
			})
		})
	})
})
