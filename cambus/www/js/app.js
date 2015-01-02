var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider){
	/*/
	$routeProvider.when('/', {
		templateUrl : 'list.html',
		controller : 'ListController'
	});
/**/
	$routeProvider.when('/', {
		templateUrl : 'templates/line-list.html',
		controller : 'LineListController'
	});
	$routeProvider.when('/line', {
		templateUrl : 'templates/line-list.html',
		controller : 'LineListController'
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
	$http.get('/api/line').
		success(function(data){
			$scope.lines = data;
		}).
		error(function(err){
			console.log(err);
		});
});
app.controller('ListController', function($scope, $http){
	$http.get('/api/city').success(function(data){
		$scope.cities = data;
	});
	$scope.deletecity = function(_id){
		$http.delete('/api/city/'+_id).success(function(data){
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
