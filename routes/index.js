var express = require('express'),
	passport = require('../lib/passport'),
	files = require('../lib/files'),
	database = require('../lib/database');

var router  = express.Router();

router.get('/', function(req, res) {
	res.render('pages/index');
});

router.get('/login', function(req, res) {
	res.render('pages/login');
});

router.post('/login', passport.authenticate('local'), function(req, res) {
	res.redirect('/');
});

router.post('/logout', function(req, res) {
	req.session.destroy(function() {
		res.end();
	});
});

router.get('/files', isLoggedIn, function(req, res) {
	res.render('pages/files');
});

router.get('/api/files/uploadurl', function(req, res) {
	files.getUploadUrl(req.query.file_name, req.query.file_type, function(err, url) {
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
	files.getDownloadUrl(req.query.file_name, function(err, url) {
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
	database.getAllFileMetadata(function(err, data) {
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
	database.addFileMetadata(req.body.file_name, function(err, data) {
		if (err) {
			res.write(JSON.stringify( { success: false, error: err } ));
			res.end();
		} else {
			res.write(JSON.stringify( { success: true, results: data } ));
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
