angular.module('mainApp').controller('collectionControl', ['$scope', '$http', function($scope, $http) {
	this.ownedCards = [];
	this.allCards = [];

	console.log("Greetings from the collection controller file.");

	this.getOwnedCards = function() {
		socket.emit('getOwnedCards', username);

	socket.on("collectionData", function (data) {
		owned = data[0];
		all = data[1];
		this.allCards = all;
		$scope.$apply();

		for (var i in owned[0]) {
			console.log(i);
		}
	}.bind(this));

	socket.on("collectionDataAll", function (data) {
		this.allCards = data;
		console.log(this.allCards);
		$scope.$apply();
	}.bind(this));

	socket.on("collectionDataOwned", function (data) {
		this.ownedCards = data;
		$scope.$apply();
		cards = data[0];
		for (var i in cards) {
			console.log(i);
			console.log(cards[i]);
		}
	}.bind(this));

	};
}]);