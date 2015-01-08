var app = angular.module('app', ['ngRoute']);
var url = "http://130.211.242.214:8080"

app.config(function($routeProvider){
	$routeProvider.when('/', {
		templateUrl : 'templates/line-list.html',
		controller : 'LineListController'
	});
	$routeProvider.when('/line', {
		templateUrl : 'templates/line-list.html',
		controller : 'LineListController'
	});
	$routeProvider.when('/city', {
		templateUrl : 'templates/city-list.html',
		controller : 'CityListController'
	});
	$routeProvider.when('/write', {
		templateUrl : 'write.html',
		controller: 'WriteController'
	});
	$routeProvider.when('/edit/:_id', {
		templateUrl : 'write.html',
		controller: 'EditController'
	});
});
app.controller('LineListController', function($scope, $http){
	$http.get(url+'/api/line').
		success(function(data){
			$scope.lines = data;
		}).
		error(function(err){
			console.log(err);
		});
});
app.controller('CityListController', function($scope, $http){
	$http.get(url+'/api/city').success(function(status, data){
		$scope.cities = status;
	});
	$scope.deletecity = function(_id){
		$http.delete(url+'/api/city/'+_id).success(function(data){
			angular.element(document.getElementById(_id)).remove();
		});
	}
});

app.controller('WriteController', function($scope, $http, $location){
	$scope.submitcity = function(city){
		$http.post('/api/city', city).success(function(data){
			$location.path('/');
		});
	};
});

app.controller('EditController', function($scope, $routeParams, $http, $location){
	$http.get('/api/city/' + $routeParams._id).success(function(data){
		console.log(data);
		$scope.city = data;
	});
	$scope.submitcity = function(city){
		$http.put('/api/city', city).success(function(data){
			console.log(data);
			$location.path('/');
		});
	};
});
