angular.module('mainApp').controller('collectionControl', ['$scope', '$http', function($scope, $http) {
	this.ownedCards = [];
	this.allCards = [];
	this.allOwnedCards = [];
	this.tab = "ownedCards";
	this.editorOpened = false;
	this.popupPanel = false;
	this.currentDeck = [];

	console.log("Greetings from the collection controller file.");

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
		this.userdust = userdust;
		$scope.$apply();
	}.bind(this));

	socket.on("updateOwned", function(data) {
		console.log('updates');
		this.userdust = data[0].dust;
		cardId = data[1][0].uid;
		console.log(cardId);
		for (var i in this.allCards) {
			if (this.allCards[i].uid === cardId) {
				if (this.allCards[i].quantity) {
					this.allCards[i].quantity += 1;
					for ( var k in this.allOwnedCards ) {
						if ( this.allOwnedCards[k].uid === this.allCards[i].uid) {
							console.log(this.allOwnedCards[k].quantity);
						}
					}
				} else {
					this.allCards[i].quantity = 1;
					this.allOwnedCards.push(this.allCards[i]);
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
		if ( this.editorOpened === true ) {
			for ( var i in this.allOwnedCards ) {
				if ( this.allOwnedCards[i].uid === data.uid) {
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
		} else {
			// This happens if the deck editor is closed
			this.cardHighlighted = data;
			this.popupPanel = true;

		}
	};

	this.buyCard = function(data) {
		if ( ! data.quantity || data.quantity <= 4 ) {
			socket.emit("buyCard", data);
			console.log("You bought the card");
		} else {
			console.log(data);
			console.log("You already have 4 of this card");
		}
	};

	socket.on("buyCardRes", function (data) {
		console.log(data);
	});

	this.hidePopupPanel = function() {
		this.popupPanel = false;
		this.cardHighlighted = "";
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