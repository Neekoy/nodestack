var express = require('express');
var router = express.Router();

router.get('/leagues', ensureAuthenticated, function(req, res) {
	res.render('leagues', { layout: 'ingame'});
});

router.get('/gameindex', ensureAuthenticated, function(req, res) {
	res.render('gameindex', { layout: 'ingame'});
});

router.get('/newroom', ensureAuthenticated, function(req, res) {
  	res.render('gameroom', { layout: 'ingame' });
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;