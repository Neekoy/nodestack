var express = require('express');
var router = express.Router();
var app = express();

app.get('/leagues', function(req, res){
	res.render('leagues');
});

module.exports = router;