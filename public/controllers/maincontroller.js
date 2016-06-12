console.log("Controller has been loaded.")

var app = angular.module('mainApp', [], function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

app.controller('mainController', function($scope, $http) {

	this.page = 1;

	this.changePage = function(pageNum) {
		this.page = pageNum;
	};

	this.currPage = function(pageNum) {
		return this.page === pageNum;
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
		console.log(this.message);
		this.message= "";
	};
});