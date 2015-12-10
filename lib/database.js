var aws = require('aws-sdk'),
	config = require('./config');

/**
 * Get the full list of all metadata from the DynamoDB S3 bucket index
 */
function getAllFileMetadata(done) {
	var params = {
		TableName : "AutocareFiles"
	};
	var client = createClient();
	client.scan(params, done);
}

/**
 * Add metadata for a file uploaded to S3 to the DynamodDB S3 bucket index
 */
function addFileMetadata(filename, done) {
	var params = {
		TableName : "AutocareFiles",
		Item: {
			ObjectKey: filename
		}
	};
	var client = createClient();
	client.put(params, done);
}

/**
 * Get the user record for the user with the given username
 */
function getUser(username, done) {
	var params = {
		TableName : "Users",
		Key : { 
			username : username
		}
	};
	var client = createClient();
	client.get(params, done);
}

function createClient() {
	aws.config.update( { accessKeyId: config.AWS_ACCESS_KEY, secretAccessKey: config.AWS_SECRET_KEY } );
	aws.config.update( { region: config.REGION } ); 
	return new aws.DynamoDB.DocumentClient();
}

module.exports = {
	getAllFileMetadata: getAllFileMetadata,
	addFileMetadata: addFileMetadata,
	getUser: getUser
};
