angular.module('mainApp').controller('collectionControl', ['$scope', '$http', function($scope, $http) {
	this.ownedCards = [];
	this.allCards = [];
	this.allOwnedCards = [];
	this.tab = "ownedCards";
	this.editorOpened = false;
	this.popupPanel = false;
	this.currentDeck = [];
	this.userdust = userdust;
	this.deckNameInput = false;
	this.deckName = "Deck name";

	console.log("Greetings from the collection controller file.");

	socket.on("collectionData", function (data) {
		ownedList = data[0];
		all = data[1];
		this.allCards = all;
		withQuantity = ownedList[0];
		
		for (var i in ownedList[0]) {
			for (var k in this.allCards) {
				if (this.allCards[k].uid === i) {
//					console.log("There is the " + i + " card match." + this.allCards[k]);
					this.allCards[k].quantity = withQuantity[i];
				}
			}
		}
		this.userdust = userdust;
		$scope.$apply();
	}.bind(this));

	socket.on("updateOwned", function(data) {
		action = data[2];		
		this.userdust = data[0][0].dust;
		cardId = data[1][0].uid;
		if (action === "buying") {
			for (var i in this.allCards) {
				if (this.allCards[i].uid === cardId) {
					if (this.allCards[i].quantity) {
						this.allCards[i].quantity += 1;
					} else {
						this.allCards[i].quantity = 1;
					}
				}
			}
		} else if ( action === "selling") {
			for (var i in this.allCards) {
				if (this.allCards[i].uid === cardId) {
					if (this.allCards[i].quantity === 1) {
						delete this.allCards[i].quantity;
						if ( this.allCards[i].quantity < this.allCards[i].inDeck ) {
							console.log("You will be left with less copies of this card than you are currently using in decks.");
							this.allCards[i].inDeck = this.allCards[i].quantity;
						}
					} else {
						this.allCards[i].quantity -= 1;
						if ( this.allCards[i].quantity < this.allCards[i].inDeck ) {
							console.log("You will be left with less copies of this card than you are currently using in decks.");
							this.allCards[i].inDeck = this.allCards[i].quantity;
						}
					}
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
			for ( var i in this.allCards ) {
				if ( this.allCards[i].uid === data.uid) {
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

	this.sellCard = function(data) {
		if ( ! data.quantity || data.quantity < 1 ) {
			console.log("You don't own any copies of this card.");
		} else {
			socket.emit("sellCard", data);
		}
	};

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

	this.toggleInput = function(data) {
		if ( data === 'activate' ) {
			this.deckNameInput = true;
		} else {
			if ( this.deckName === "" ) {
				console.log("Please enter a deck name.");
			} else {
				this.deckNameInput = false;
			}
		}
	};

	this.saveDeck = function() {
		deck = {};
		deckWithName = {};
		for ( var i in this.currentDeck ) {
			console.log(this.currentDeck[i].uid);
			console.log(this.currentDeck[i].inDeck);
			deck[this.currentDeck[i].uid] = this.currentDeck[i].inDeck;
		};
		if ( this.deckName != "" ) {
			deckWithName[this.deckName] = deck;
			socket.emit('saveDeck', deckWithName);
			this.currentDeck = [];			
		} else {
			console.log("Please enter a name for the deck.");
		}

	};

}]);