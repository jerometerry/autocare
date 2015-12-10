var aws = require('aws-sdk'),
	config = require('./config');

/**
 * Get a signed S3 URL that can be used in the browser to directly upload to S#, 
 * bypssing our own app server.
 */
function getUploadUrl(filename, filetype, done) {
	var params = {
		Bucket: config.S3_BUCKET,
		Key: filename,
		Expires: config.URL_EXPIRY,
		ContentType: filetype,
		ACL: 'public-read'
	};
	var client = createClient();
	client.getSignedUrl('putObject', params, done);
}

/**
 * Get a signed S3 URL that can be used in the browser to directly download from S#,
 * bypassing our own app server
 */
function getDownloadUrl(filename, done) {
	var params = {
		Bucket: config.S3_BUCKET,
		Key: filename,
		Expires: config.URL_EXPIRY
	};
	var client = createClient();
	client.getSignedUrl('getObject', params, done);
}

function createClient() {
	aws.config.update({accessKeyId: config.AWS_ACCESS_KEY, secretAccessKey: config.AWS_SECRET_KEY});
	return new aws.S3();
}

module.exports = {
	getUploadUrl: getUploadUrl,
	getDownloadUrl: getDownloadUrl
};
