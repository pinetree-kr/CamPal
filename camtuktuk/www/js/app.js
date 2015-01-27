
var app = angular.module('app', ['app.controllers','ngRoute'])
.config(function($routeProvider){
	$routeProvider.when('/', {
		templateUrl : 'templates/tuktuk-list.html',
		controller : 'TukTukListController'
	});
	$routeProvider.when('/tuktuk', {
		templateUrl : 'templates/tuktuk-list.html',
		controller : 'TukTukListController'
	});
	$routeProvider.when('/tuktuk/edit/:id', {
		templateUrl : 'templates/tuktuk-write.html',
		controller : 'TukTukEditController'
	});
/*/
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
/**/
});
