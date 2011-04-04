/**
 * Honeybadger Server for node.js
 * Really simple server for Honeybadger that runs under node.js. Useful only as
 * a proof of concept. 
 * 
 * To run, call:
 * $ node honeybadger_server_node.js <ip-to-bind> <port-to-bind>
 * 
 * @todo Does not do any error handling and 
 * @author Chris Tankersley <chris@ctankersley.com>
 */

var http			= require('http');
var url				= require('url');
var querystring		= require('querystring');
var node_get		= require('node-get');
var twitterService	= require('./twitter_to_asjson.js');
var request			= '';
var response		= '';
var req_query		= '';

/**
 * List of services that Honeybadger will support
 */
var registeredServices = {'twitter': twitterService};

http.createServer(function (req, res) {
	request = req;
	response = res;
	req_query = querystring.parse(url.parse(request.url).query);
	
	switch(url.parse(req.url).pathname) {
		case '/get':
			dispatch_get(req, res);
			break;
	}
}).listen(process.argv[3], process.argv[2]);
console.log('Server running at http://'+process.argv[2]+':'+process.argv[3]+'/');

/**
 * Calls the external resource
 * @param object req Request object from the http server
 * @param object res Response object for the http server
 */
function dispatch_get(req, res) {
	
	var dl = new node_get(req_query.resource);
	dl.asString(process_input);
}

/**
 * Returns the service object from the list of registered services
 * If the service is not registered, then it throws an error
 * 
 * @throws Error
 * @param string name Service to return
 * @return function
 */
function get_service(name) {
	if(registeredServices[name] === undefined) {
		throw new Error(name + ' is not a valid service');
	} else {
		return registeredServices[name];
	}
}

/**
 * Deals with the input when it comes back from the remote service
 */
function process_input() {
	if(req_query.debug === undefined) {
		response.writeHead(200, {'Content-Type': 'text/plain'});
	} else {
		response.writeHead(200, {'Content-Type': 'application/json'});
	}
	
	var inputServiceName = req_query.input;
	var inputService = get_service(inputServiceName);
	
	var inputResponse = JSON.parse(arguments[1]);
	var output = [];
	for(var i in inputResponse) {
		var tweet = inputResponse[i];
		var as = inputService[inputServiceName + 'StatusToAS'](tweet);
		output.push(as);
	}
	
	if(req_query.output === undefined) {
		response.write(JSON.stringify(output));
	} else {
		var outputServiceName = req_query.output;
		var outputService = get_service(outputServiceName);
	}
	
	inputResponse = null;
	output = null;
	
	response.end();
}