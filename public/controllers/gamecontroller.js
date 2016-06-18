angular.module('mainApp').controller('collectionControl', ['$scope', '$http', function($scope, $http) {
	this.ownedCards = [];
	this.allCards = [];
	this.allOwnedCards = [];
	this.tab = "ownedCards";
	this.editorOpened = false;
	this.currentDeck = [];

	console.log("Greetings from the collection controller file.");

	socket.emit('getOwnedCards', username);

	socket.on("collectionData", function (data) {
		ownedList = data[0];
		all = data[1];
		this.allCards = all;
		this.allOwnedCards = [];
		withQuantity = ownedList[0];
		
		for (var i in ownedList[0]) {
			for (var k in this.allCards) {
				if (this.allCards[k].uid === i) {
					console.log("There is the " + i + " card match." + this.allCards[k]);
					this.allCards[k].quantity = withQuantity[i];
					this.allOwnedCards.push(this.allCards[k]);
				}
			}
		}
		$scope.$apply();
	}.bind(this));

	this.changeTab = function(tab) {
		this.tab = tab;
	};

	this.checkTab = function(tab) {
		return this.tab === tab;
	}

	this.toggleEditor = function() {
		if ( this.editorOpened === false ){
			this.editorOpened = true;
		} else {
			this.editorOpened = false;
		}
		this.tab = "ownedCards";
	}

	this.imageClicked = function(data) {
		// This happens if the deck editor is opened
		for ( var i in this.allOwnedCards ) {
			if ( this.allOwnedCards[i].uid === data.uid) {
				if ( this.editorOpened === true ) {
					if ( ! data.inDeck || data.inDeck === 0) {
						data.inDeck = 1;
						this.currentDeck.push(data);
					} else {
						if ( data.inDeck < 4 && data.inDeck < data.quantity ) {
							quantity = data.inDeck;
							quantity += 1;
							data.inDeck = quantity;
						} else {
							console.log("You already have 4 of this card, or you don't have more copies in your collection.");
						}
						
					}
				}
			}
		}
		// This happens if the deck editor is closed
	};

	this.clickedInDecklist = function(data) {
		quantity = data.inDeck;
		quantity -= 1;
		if ( quantity === 0 ) {
			var i = this.currentDeck.indexOf(data);
			this.currentDeck.splice(i, 1);
			data.inDeck = 0;
		} else {
			data.inDeck = quantity;
		}
	};

}]);