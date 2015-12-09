var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
	router = require('./routes/index'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	expressSession = require('express-session'),
	aws = require('aws-sdk');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

// passport config
passport.use(new LocalStrategy(function(user, pass, done) {
	aws.config.update( { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY } );
	aws.config.update( { region: 'us-east-1' } ); 
	var dynamodbDoc = new aws.DynamoDB.DocumentClient();
	var params = {
		TableName : "Users",
		Key : { 
			username : user
		}
	};
	dynamodbDoc.get(params, function(err, data) {
		if (err) {
			done(err);
		} else {
			if (data.Item.password === pass) {
				done(null, data.Item);	
			} else {
				done(null, null, "Login Failed");
			}
			
		}
	});
}));

passport.serializeUser(function(user, done) {
	done(null, user.username);
});

passport.deserializeUser(function(login, done) {
	aws.config.update( { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY } );
	aws.config.update( { region: 'us-east-1' } ); 
	var dynamodbDoc = new aws.DynamoDB.DocumentClient();
	var params = {
		TableName : "Users",
		Key : { 
			username : login
		}
	};
	dynamodbDoc.get(params, function(err, data) {
		if (err) {
			done(err);
		} else {
			done(null, data.Item);
		}
	});
});

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('pages/error', {
			message: err.message,
			error: err
		});
	});
}

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('pages/error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
