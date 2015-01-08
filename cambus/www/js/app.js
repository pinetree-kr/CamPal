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
<<<<<<< HEAD
=======
	$routeProvider.when('/city/write', {
		templateUrl : 'templates/city-write.html',
		controller : 'CityWriteController'
	});
	$routeProvider.when('/city/edit/:_id', {
		templateUrl : 'templates/city-write.html',
		controller : 'CityEditController'
	});
>>>>>>> a518d6743266f8f5e230d973cf209fd54f0a89b8
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
<<<<<<< HEAD
app.controller('CityListController', function($scope, $http){
	$http.get(url+'/api/city').success(function(status, data){
		$scope.cities = status;
	});
	$scope.deletecity = function(_id){
		$http.delete(url+'/api/city/'+_id).success(function(data){
			angular.element(document.getElementById(_id)).remove();
		});
=======
app.controller('CityListController', function($scope, $http, $location){
	$http.get('/api/city').success(function(data){
		$scope.cities = data;
	});
	$scope.editCity = function(_id){
		$location.path('/city/edit/'+_id);
>>>>>>> a518d6743266f8f5e230d973cf209fd54f0a89b8
	}
});

app.controller('CityWriteController', function($scope, $http, $location){
	$scope.submitCity = function(city){
		$http.post('/api/city', city).success(function(data){
			$location.path('/city');
		});
	};
});

app.controller('CityEditController', function($scope, $routeParams, $http, $location){
	$http.get('/api/city/' + $routeParams._id).success(function(data){
		//console.log(data);
		$scope.city = data;
		/*/
		if(data.pref===undefined){
			$scope.city.pref=0;
		}
		/**/
	});
	$scope.submitCity = function(city){
		$http.put('/api/city', city).success(function(data){
			//console.log(data);
			$location.path('/city');
		});
	};
	$scope.deleteCity = function(_id){
		$http.delete('/api/city/'+_id).success(function(data){
			//angular.element(document.getElementById(_id)).remove();
			$location.path('/city');
		});
	}

});
