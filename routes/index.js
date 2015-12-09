var express = require('express'),
	passport = require('passport'),
	aws = require('aws-sdk');

var router  = express.Router();

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

router.get('/', function(req, res) {
	res.render('pages/index');
});

router.get('/login', function(req, res) {
	res.render('pages/login');
});

router.post('/login', passport.authenticate('local'), function(req, res) {
	res.redirect('/');
});

router.get('/files', isLoggedIn, function(req, res) {
	res.render('pages/files');
});

router.get('/api/files/uploadurl', function(req, res) {
	aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
	var s3 = new aws.S3();
	var s3_params = {
		Bucket: S3_BUCKET,
		Key: req.query.file_name,
		Expires: 60,
		ContentType: req.query.file_type,
		ACL: 'public-read'
	};
	s3.getSignedUrl('putObject', s3_params, function(err, url){
		if(err) {
			res.write(JSON.stringify( { url: null, error: err } ));
			res.end();
		} else {
			res.write(JSON.stringify( { url: url } ));
			res.end();
		}
	});
});

router.get('/api/files/downloadurl', function(req, res) {
	aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
	var s3 = new aws.S3();
	var s3_params = {
		Bucket: S3_BUCKET,
		Key: req.query.file_name,
		Expires: 60
	};
	s3.getSignedUrl('getObject', s3_params, function(err, url){
		if(err) {
			res.write(JSON.stringify( { url: null, error: err } ));
			res.end();
		} else {
			res.write(JSON.stringify( { url: url } ));
			res.end();
		}
	});
});

router.get('/api/metadata', function(req, res) {
	aws.config.update( { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY } );
	aws.config.update( { region: 'us-east-1' } ); 
	var dynamodbDoc = new aws.DynamoDB.DocumentClient();
	var params = {
		TableName : "AutocareFiles"
	};
	dynamodbDoc.scan(params, function(err, data) {
		if (err) {
			res.write(JSON.stringify( { results: null, error: err } ));
			res.end();
		} else {
			res.write(JSON.stringify( { results: data } ));
			res.end();
		}
	});
});

router.put('/api/metadata', function(req, res) {
	var file = req.body.file_name;
	aws.config.update( { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY } );
	aws.config.update( { region: 'us-east-1' } ); 
	var dynamodbDoc = new aws.DynamoDB.DocumentClient();
	var params = {
		TableName : "AutocareFiles",
		Item: {
			ObjectKey: file
		}
	};
	dynamodbDoc.put(params, function(err, data) {
		if (err) {
			res.write(JSON.stringify( { success: false, error: err } ));
			res.end();
		} else {
			res.write(JSON.stringify( { success: true, results: data } ));
			res.end();
		}
	});
});

router.get('/api/files', function(req, res) {
	aws.config.update( { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY } );
	var s3 = new aws.S3({ params: { Bucket: S3_BUCKET } });
	s3.listObjects(function(err, data) {
		if (err) {
			res.write(JSON.stringify({ files: null, error: err }));
			res.end();
		} else {
			var files = [];
			for (var i = 0; i < data.Contents.length; i++) {
				var item = data.Contents[i];
				var key = item.Key;
				var size = item.Size;
				files[i] = {
					key: key,
					size: size
				};
			}
            
			res.write(JSON.stringify( { files: files } ));
			res.end();
		}
	});
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;