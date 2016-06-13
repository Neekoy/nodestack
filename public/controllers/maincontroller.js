console.log("Controller has been loaded.");

var socket = io();
var chatbox = document.getElementById('chatcontent');

socket.on('alert', function(data) {
	console.log(data);
});

socket.on('serverMsg', function(data) {
	for (var i in data) {
		console.log(i);
	}
    element = document.getElementById('message');
    element.innerHTML = data[0].strength;
});

socket.on('gameFound', function(data) {
//	console.log(data);
	socket.emit('joinRoom', data)
});

socket.on('newChatMessage', function(data) {
	messageContent = data[0] + ": " + data[1] + "</br>";
	chatbox.innerHTML = chatbox.innerHTML + messageContent;
});

var app = angular.module('mainApp', [], function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

app.controller('mainController', function($scope, $http) {

	this.page = 1;
	this.gameActive = false;

	this.changePage = function(pageNum) {
		this.page = pageNum;
	};

	this.currPage = function(pageNum) {
		return this.page === pageNum;
	};

	this.newGame = function() {
		socket.emit("searchGame", "There is a new game request.");
		this.gameActive = true;
	};



});

app.controller('chatController', function () {
	this.message= "";
	this.roomName = "Default";
	this.enabled = true;
	console.log(this.roomName);

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