/**
 * Google Buzz Service Object for the Honeybadger Translation Server
 * 
 * @todo Go through Google's reponse to make sure it conforms to AS
 * @author Chris Tankersley <chris@ctankersley.com>
 */

/**
 * Translates an ActivityStream into a GoogleBuzz object
 * Google Buzz's JSON format is already an ActivityStream, so just return the
 * element
 * 
 * @param object as
 * @return object
 */
exports.ASToGooglebuzzStatus = function(as) {
	return as;
}

/**
 * Returns only the elements that are needed for processing
 * 
 * @param object input
 * @return object
 */
exports.getFeed = function(input) {
	return input.data.items;
}

/**
 * Converts a Google Buzz status into an ActivityStream
 * Google Buzz's JSON format is already an ActivityStream, so just return the
 * element
 * 
 * @param object buzz
 * @return object
 */
exports.googlebuzzStatusToAS = function(buzz) {
	return buzz;	
}