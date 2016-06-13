var uuid = require('node-uuid');

module.exports = {
	newRoom: function(username) {
		id = uuid.v4();
		return [id, username];
	}
};