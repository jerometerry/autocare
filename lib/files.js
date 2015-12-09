var aws = require('aws-sdk');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

function getUploadUrl(filename, filetype, done) {
	aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
	var s3 = new aws.S3();
	var s3_params = {
		Bucket: S3_BUCKET,
		Key: filename,
		Expires: 60,
		ContentType: filetype,
		ACL: 'public-read'
	};
	s3.getSignedUrl('putObject', s3_params, done);
}

function getDownloadUrl(filename, done) {
	aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
	var s3 = new aws.S3();
	var s3_params = {
		Bucket: S3_BUCKET,
		Key: filename,
		Expires: 60
	};
	s3.getSignedUrl('getObject', s3_params, done);
});

module.exports = {
	getUploadUrl: getUploadUrl,
	getDownloadUrl: getDownloadUrl
};
