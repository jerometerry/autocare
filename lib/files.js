var aws = require('aws-sdk'),
	config = require('./config');

function createClient() {
	aws.config.update({accessKeyId: config.AWS_ACCESS_KEY, secretAccessKey: config.AWS_SECRET_KEY});
	return new aws.S3();
}
	
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

function getDownloadUrl(filename, done) {
	var params = {
		Bucket: config.S3_BUCKET,
		Key: filename,
		Expires: config.URL_EXPIRY
	};
	var client = createClient();
	client.getSignedUrl('getObject', params, done);
}

module.exports = {
	getUploadUrl: getUploadUrl,
	getDownloadUrl: getDownloadUrl
};
