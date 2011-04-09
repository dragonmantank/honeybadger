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
var googlebuzzService = require('./services/googlebuzz.js');
var request			= '';
var response		= '';
var req_query		= '';

/**
 * List of services that Honeybadger will support
 */
var registeredServices = {'twitter': twitterService, 'googlebuzz': googlebuzzService};

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
	dl.asString(process_request);
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
function process_request() {
	if(req_query.debug === undefined) {
		response.writeHead(200, {'Content-Type': 'application/json'});
	} else {
		response.writeHead(200, {'Content-Type': 'text/plain'});
	}
	
	var inputResponse = process_input(arguments[1]);
	var outputResponse = process_output(inputResponse);
	
	response.write(JSON.stringify(outputResponse));
	response.end();
	
	inputResponse = null;
	outputResponse = null;
}

/**
 * Processes the incoming text as an Activity Stream
 * If no input is supplied, the string is just translated into an array and 
 * returned
 * 
 * @param string inputResponse
 * @return array
 */
function process_input(rawInput) {
	var inputJSON = JSON.parse(rawInput);
	
	if(req_query.input === undefined) {
		return inputJSON;
	} else {
		var inputServiceName = req_query.input;
		var inputService = get_service(inputServiceName);
		var input = inputService.getFeed(inputJSON);
		
		var translatedInput = [];
		for(var i in input) {
			var as = inputService[inputServiceName + 'StatusToAS'](input[i]);
			translatedInput.push(as);
		}
		
		return translatedInput;
	}
}

/**
 * Translates an AS to a different format
 * If no output is defined in the main query, then the data is just returned
 * 
 * @param array as
 * @return array
 */
function process_output(as) {
	if(req_query.output === undefined) {
		return as;
	} else {
		var outputServiceName = req_query.output;
		var outputService = get_service(outputServiceName);
		
		var output = [];
		// Uppercase the first letter of the service name
		outputServiceName = outputServiceName.charAt(0).toUpperCase() + outputServiceName.slice(1);
		for(var i in as) {
			var rawOutput = outputService['ASTo' + outputServiceName + 'Status'](as[i]);
			output.push(rawOutput);
		}
		
		return output;
	}
}