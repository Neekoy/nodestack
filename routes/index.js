var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	res.render('gameindex', { layout: 'ingame'});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

router.get('/leagues', ensureAuthenticated, function(req, res) {
	res.render('leagues', { layout: 'ingame'});
});

router.get('/gameindex', ensureAuthenticated, function(req, res) {
	res.render('gameindex', { layout: 'ingame'});
});

module.exports = router;