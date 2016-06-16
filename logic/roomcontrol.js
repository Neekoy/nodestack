
module.exports = {
	newRoom: function(io, roomId, user1, user2) {
		socket1 = PLAYER_SOCKETS[user1];
    	socket2 = PLAYER_SOCKETS[user2];
    	console.log(socket1);
    	console.log(socket2);
    	console.log("Socket that the message will be submitted to " + socket1 + " " + socket2);

    	gameFoundInfo = [];
    	gameFoundInfo.push(roomId, user1, user2);

		io.to(socket1).emit("gameFound", gameFoundInfo);
   		io.to(socket2).emit("gameFound", gameFoundInfo);
	}
}

findCard = function(cardName) {
    db.cards.find({ name : cardName }).toArray(function(err, result) {
        if (err) {
            console.log(err);
        } else if (result.length) {
            socket.emit('serverMsg', result);
        } else
            console.log("No results found.");
    });
};