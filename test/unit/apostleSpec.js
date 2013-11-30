var assert = require("assert"),
	apostle = require("../../lib"),
	sinon = require("sinon")
	request = require("superagent");

describe("apostle", function(){
	describe("#mail", function(){
		it("creates a queue, adds itself, and delivers", function(){
			var queue = {add:function(){}, deliver:function(){}};

			stub = sinon.stub(apostle, "createQueue").returns(queue)
			add = sinon.stub(queue, "add")
			deliver = sinon.stub(queue, "deliver")
			apostle.mail("asd", {email: "asd"})

			
			assert(add.called);
			assert(deliver.called);

			add.restore()
			deliver.restore()
			stub.restore()
		})
	})
	describe("Queue", function(){
		describe("#deliver", function(){
			it("validates template", function(done){
				queue = apostle.createQueue()
				queue.add(undefined, {})
				queue.deliver(function(success, message, data){
					assert.equal(success, false)
					assert.equal(message, "Validation failed")
					assert.equal(data[0].error, "No template provided")
					done()
				})
			
			})
			it("validates email", function(done){
				apostle.mail("template", {}, function(success, message, data){
					assert.equal(success, false)
					assert.equal(message, "Validation failed")
					assert.equal(data[0].error, "No email provided")
					done()
				})
			})
			it("sends recipients to apostle#deliver", function(){
				var queue = apostle.createQueue(),
					deliver = sinon.stub(apostle, 'deliver');
				
				queue.add("template 1", {email: "1", replyTo: "reply", foo: "bar"})
				queue.add("template 2", {email: "2", replyTo: "reply", baz: "bar"})
				queue.deliver();

				assert(deliver.calledWith({ recipients: {
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
