var passport = require('passport'),
	database = require('./lib/database'),
	LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(function(user, pass, done) {
	database.getUser(user, function(err, data) {
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
	database.getUser(login, function(err, data) {
		if (err) {
			done(err);
		} else {
			if (err) {
				done(err);
			} else {
				done(null, data.Item);
			}
		}
	});
});
	
module.exports = passport;
