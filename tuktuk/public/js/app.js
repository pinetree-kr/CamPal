var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider){
	$routeProvider.when('/', {
		templateUrl : 'list.html',
		controller : 'ListController'
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

app.controller('ListController', function($scope, $http){
	$http.get('/memo').success(function(data){
		$scope.memos = data;
	});
	$scope.deleteMemo = function(_id){
		$http.delete('/memo/'+_id).success(function(data){
			angular.element(document.getElementById(_id)).remove();
		});
	}
});

app.controller('WriteController', function($scope, $http, $location){
	$scope.submitMemo = function(memo){
		$http.post('/memo', memo).success(function(data){
			$location.path('/');
		});
	};
});

app.controller('EditController', function($scope, $routeParams, $http, $location){
	$http.get('/memo/' + $routeParams._id).success(function(data){
		console.log(data);
		$scope.memo = data;
	});
	$scope.submitMemo = function(memo){
		$http.put('/memo', memo).success(function(data){
			console.log(data);
			$location.path('/');
		});
	};
});
