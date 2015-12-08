var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
    aws = require('aws-sdk');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

var app = express();
var router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

router.get('/', function(req, res, next) {
  res.render('pages/index', { title: 'Express' });
});

router.get('/files/uploadurl', function(req, res) {
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

router.get('/files/downloadurl', function(req, res) {
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

router.get('/metadata', function(req, res) {
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

router.put('/metadata', function(req, res) {
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

router.get('/files', function(req, res) {
    aws.config.update( { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY } );
    
    var s3 = new aws.S3({ params: { Bucket: S3_BUCKET } });
    s3.listObjects(function(err, data){
        if(err) {
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

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('pages/error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('pages/error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
