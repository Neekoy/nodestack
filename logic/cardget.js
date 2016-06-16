var mongoose = require('mongoose');

module.exports = {
	allOwnedCards: function (username, Cards) {
		Cards.find({ name: "Gandalf" }, function(err, data) {
 			if (err) throw err;
 			console.log(data);
  			return "123123";
		});
	}
}