var aws = require('aws-sdk');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

function getAllFileMetadata(done) {
	aws.config.update( { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY } );
	aws.config.update( { region: 'us-east-1' } ); 
	var dynamodbDoc = new aws.DynamoDB.DocumentClient();
	var params = {
		TableName : "AutocareFiles"
	};
	dynamodbDoc.scan(params, done);
});

function addFileMetadata(filename) {
	aws.config.update( { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY } );
	aws.config.update( { region: 'us-east-1' } ); 
	var dynamodbDoc = new aws.DynamoDB.DocumentClient();
	var params = {
		TableName : "AutocareFiles",
		Item: {
			ObjectKey: filename
		}
	};
	dynamodbDoc.put(params, done);
});

function getUser(username) {
	aws.config.update( { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY } );
	aws.config.update( { region: 'us-east-1' } ); 
	var dynamodbDoc = new aws.DynamoDB.DocumentClient();
	var params = {
		TableName : "Users",
		Key : { 
			username : username
		}
	};
	dynamodbDoc.get(params, done);
}));

module.exports = {
	getAllFileMetadata: getAllFileMetadata,
	addFileMetadata: addFileMetadata
};
