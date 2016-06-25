console.log("Main controller has been loaded.");

var socket = io();
var chatbox = document.getElementById('chatcontent');
var username = "";
var userdust = 0;
var dataFetched = false;

socket.on('alert', function(data) {
		console.log(data);
});

socket.on('serverMsg', function(data) {
	for (var i in data) {
//		console.log(i);
	}
    element = document.getElementById('message');
    element.innerHTML = data[0].strength;
});

socket.on('gameFound', function(data) {
	gameState = "Game has been found.";
	socket.emit('joinRoom', data);
});

socket.on('newChatMessage', function(data) {
	messageContent = data[0] + ": " + data[1] + "</br>";
	chatbox.innerHTML = chatbox.innerHTML + messageContent;
});

var app = angular.module('mainApp', ['angular-svg-round-progressbar'], function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

app.controller('mainController', function($scope, $http) {

	$scope.$watch('$viewContentLoaded', function() {
		console.log("The content has been fully loaded.");
	});

	this.tab = "main";
	this.gameActive = false;
	this.username = "";

	this.changeTab = function(tab) {
		if (tab === "collect" && dataFetched === false) {
			socket.emit('getOwnedCards', username);
			dataFetched = true;
		}
		this.tab = tab;
	};

	this.activeTab = function(tab) {
		return this.tab === tab;
	};

	this.findGame = function() {
		this.tab = "gameroom";
		socket.emit("searchGame", "There is a new game request.");
		this.gameActive = true;
	};

	socket.on('userData', function(data) {
		this.username = data[0].username;
		username = data[0].username;
		this.usergold = data[0].gold;
		this.userlevel = data[0].level;
		this.userexp = data[0].experience;
		this.userdust = data[0].dust;
		userdust = data[0].dust;
		$scope.$apply();
	}.bind(this));

});

app.controller('chatController', function () {
	this.message= "";
	this.roomName = "Default";
	this.enabled = true;

	this.toggle = function() {
		if (this.enabled === true) {
			this.enabled = false;
		} else {
			this.enabled = true;
		}
	};

	this.submitMessage = function () {
		socket.emit("chatMessage", this.message);
		this.message= "";
	};
});

app.controller('gameController', function($scope, $http) {
	this.lookingForGame = true;

	socket.on('gameFound', function () {
		this.lookingForGame = false;
		$scope.$apply();
	}.bind(this));
});