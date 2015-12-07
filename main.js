var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
    aws = require('aws-sdk');

var AWS_ACCESS_KEY = process.env.S3_AWS_ACCESS_KEY_ID;
var AWS_SECRET_KEY = process.env.S3_AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

var app = express();
var router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
            res.write(JSON.stringify({ error: err }));
            res.end();
        }
        else {
            var return_data = {
                url: url
            };
            res.write(JSON.stringify(return_data));
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
        Expires: 60,
        ACL: 'public-read'
    };
    s3.getSignedUrl('getObject', s3_params, function(err, url){
        if(err) {
            res.write(JSON.stringify({ error: err }));
            res.end();
        }
        else {
            var return_data = {
                url: url
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
});

router.get('/files', function(req, res) {
    aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    var s3 = new aws.S3({ params: { Bucket: S3_BUCKET } });
    s3.listObjects(function(err, data){
        if(err) {
            res.write(JSON.stringify({ error: err }));
            res.end();
        }
        else {
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
            
            res.write(JSON.stringify(files));
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
