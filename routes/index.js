var express = require('express');
var router = express.Router();


// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
  	console.log("Sesssion ID: " + req.session.id);
	console.log("Sesssion Username: " + req.session.username + "\n");
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

module.exports = router;