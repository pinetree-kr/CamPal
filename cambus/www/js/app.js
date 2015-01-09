
var app = angular.module('app', ['app.controllers','ngRoute'])
.config(function($routeProvider){
	$routeProvider.when('/', {
		templateUrl : 'templates/line-list.html',
		controller : 'LineListController'
	});

	$routeProvider.when('/line', {
		templateUrl : 'templates/line-list.html',
		controller : 'LineListController'
	});
	$routeProvider.when('/line/write', {
		templateUrl : 'templates/line-write.html',
		controller : 'LineWriteController'
	});
	$routeProvider.when('/line/edit/:_id', {
		templateUrl : 'templates/line-write.html',
		controller : 'LineEditController'
	});

	$routeProvider.when('/city', {
		templateUrl : 'templates/city-list.html',
		controller : 'CityListController'
	});
	$routeProvider.when('/city/write', {
		templateUrl : 'templates/city-write.html',
		controller : 'CityWriteController'
	});
	$routeProvider.when('/city/edit/:_id', {
		templateUrl : 'templates/city-write.html',
		controller : 'CityEditController'
	});

	$routeProvider.when('/type', {
		templateUrl : 'templates/type-list.html',
		controller : 'TypeListController'
	});
	$routeProvider.when('/type/write', {
		templateUrl : 'templates/type-write.html',
		controller : 'TypeWriteController'
	});
	$routeProvider.when('/type/edit/:_id', {
		templateUrl : 'templates/type-write.html',
		controller : 'TypeEditController'
	});

	$routeProvider.when('/company', {
		templateUrl : 'templates/company-list.html',
		controller : 'CompanyListController'
	});
	$routeProvider.when('/company/write', {
		templateUrl : 'templates/company-write.html',
		controller : 'CompanyWriteController'
	});
	$routeProvider.when('/company/edit/:_id', {
		templateUrl : 'templates/company-write.html',
		controller : 'CompanyEditController'
	});
});
