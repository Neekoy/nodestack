var mongoose = require('mongoose');

// User Schema
var gameUserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	gold: {
		type: Number,
	},
	dust: {
		type: Number,
	},
	level: {
		type: Number,
	},
	experience: {
		type: Number,
	},
	decks: [{
		name: String,
		cards: []
	}],
	ownedCards: []
});

module.exports = mongoose.model('gameUser', gameUserSchema);

module.exports.createUser = function(newUser, callback) {
	newUser.save(callback);
};