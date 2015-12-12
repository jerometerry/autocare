var express = require('express'),
	passport = require('../lib/passport'),
	files = require('../lib/files'),
	database = require('../lib/database');

var router  = express.Router();

router.get('/', function(req, res) {
	res.render('pages/index', { loggedin: req.isAuthenticated() });
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

router.get('/invoices', isLoggedIn, function(req, res) {
	res.render('pages/invoices');
});

router.get('/api/files/uploadurl', function(req, res) {
	files.getUploadUrl(req.query.file_name, req.query.file_type, function(err, url) {
		var result = err ? { url: null, error: err } : { url: url };
		res.write(JSON.stringify( result ));
		res.end();
	});
});

router.get('/api/files/downloadurl', function(req, res) {
	files.getDownloadUrl(req.query.file_name, function(err, url) {
		var result = err ? { url: null, error: err } : { url: url };
		res.write(JSON.stringify( result ));
		res.end();
	});
});

router.get('/api/metadata', function(req, res) {
	database.getAllFileMetadata(function(err, data) {
		var result = err ? { results: null, error: err } : { results: data };
		res.write(JSON.stringify( result ));
		res.end();
	});
});

router.put('/api/metadata', function(req, res) {
	database.addFileMetadata(req.body.file_name, function(err, data) {
		var result = err ? { success: false, error: err } : { success: true, results: data };
		res.write(JSON.stringify( result ));
		res.end();
	});
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

module.exports = router;
