var aws = require('aws-sdk'),
	config = require('./config');

function createClient() {
	aws.config.update( { accessKeyId: config.AWS_ACCESS_KEY, secretAccessKey: config.AWS_SECRET_KEY } );
	aws.config.update( { region: config.REGION } ); 
	return new aws.DynamoDB.DocumentClient();
}
	
function getAllFileMetadata(done) {
	var params = {
		TableName : "AutocareFiles"
	};
	client.scan(params, done);
});

function addFileMetadata(filename) {
	var params = {
		TableName : "AutocareFiles",
		Item: {
			ObjectKey: filename
		}
	};
	var client = createClient();
	client.put(params, done);
});

function getUser(username) {
	var params = {
		TableName : "Users",
		Key : { 
			username : username
		}
	};
	var client = createClient();
	client.get(params, done);
}));

module.exports = {
	getAllFileMetadata: getAllFileMetadata,
	addFileMetadata: addFileMetadata,
	getUser: getUser
};
