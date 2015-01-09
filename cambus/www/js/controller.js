var url = "http://130.211.242.214:8080";

angular.module('app.controllers', ['ngRoute'])
.factory('BusService', function(){
	var BusService = {};
	BusService.busInformation = {};
	BusService.setBusInformation = function(information){
		BusService.busInformation = information;
	}
	BusService.getBusInformation = function(){
		return BusService.busInformation;
	}
	return BusService;
})
.controller('LineBusListController', function($scope, $http, $location, $routeParams, BusService){
	var line_id = $routeParams._id;
	$http.get(url+'/api/line/bus/'+line_id).
		success(function(data){
			$scope.line = data.line;
			$scope.items = data.buses;
		}).
		error(function(err){
			console.log(err);
		});
	$scope.edit = function(item){
		BusService.setBusInformation(item);
		$location.path('/bus/edit');
	}
})
.controller('BusEditController', function($scope, $routeParams, $http, $location, BusService){
	$scope.item = BusService.getBusInformation();
	console.log($scope.item)
	/*/
	$http.get(url+'/api/city').success(function(cities){
		$scope.cities = cities;
		$http.get(url+'/api/line/' + $routeParams._id).success(function(line){
			$scope.item = line;
			
			for(var i=0; i<$scope.cities.length; i++){
				if($scope.cities[i]._id === $scope.item.dept._id){
					$scope.item.dept = $scope.cities[i];
				}
				if($scope.cities[i]._id === $scope.item.dest._id){
					$scope.item.dest = $scope.cities[i];
				}
				if($scope.dept !== undefined && $scope.dest !== undefined){
					break;
				}
			}
		});
	});
	$scope.submit = function(line){
		$http.put(url+'/api/line/' + $routeParams._id, line).success(function(data){
			//console.log(data);
			$location.path('/line');
		});
	};
	/**/
})
.controller('LineListController', function($scope, $http, $filter, $location){
	var orderBy = $filter('orderBy');
	$http.get(url+'/api/line').
		success(function(data){
			$scope.items = data;
			$scope.orderBy("-dept.pref", false);
			$scope.orderBy("dept.index", false);
		}).
		error(function(err){
			console.log(err);
		});
	$scope.orderBy = function(predicate, reverse){
		$scope.items = orderBy($scope.items, predicate, reverse);
	}
	$scope.edit = function(_id){
		$location.path('/line/edit/'+_id);
	}
	$scope.select = function(_id){
		$location.path('/line/bus/'+_id);
	}
})
.controller('LineEditController', function($scope, $routeParams, $http, $location){
	$http.get(url+'/api/city').success(function(cities){
		$scope.cities = cities;
		$http.get(url+'/api/line/' + $routeParams._id).success(function(line){
			$scope.item = line;
			/**/
			for(var i=0; i<$scope.cities.length; i++){
				if($scope.cities[i]._id === $scope.item.dept._id){
					$scope.item.dept = $scope.cities[i];
				}
				if($scope.cities[i]._id === $scope.item.dest._id){
					$scope.item.dest = $scope.cities[i];
				}
				if($scope.dept !== undefined && $scope.dest !== undefined){
					break;
				}
			}
			/**/
		});
	});
	$scope.submit = function(line){
		$http.put(url+'/api/line/' + $routeParams._id, line).success(function(data){
			//console.log(data);
			$location.path('/line');
		});
	};
	/*/
	$scope.delete = function(_id){
		$http.delete(url+'/api/city/'+_id).success(function(data){
			//angular.element(document.getElementById(_id)).remove();
			$location.path('/city');
		});
	}
	/**/
})
.controller('TypeListController', function($scope, $http, $location){
	$http.get(url+'/api/type').
		success(function(data){
			$scope.items = data;
		}).
		error(function(err){
			console.log(err);
		});
	$scope.edit = function(_id){
		$location.path('/type/edit/'+_id);
	}
})
.controller('TypeEditController', function($scope, $routeParams, $http, $location){
	$http.get(url+'/api/type/' + $routeParams._id).success(function(data){
		$scope.item = data;
	});
	$scope.submit = function(type){
		$http.put(url+'/api/type', type).success(function(data){
			//console.log(data);
			$location.path('/type');
		});
	};
	/*/
	$scope.delete = function(_id){
		$http.delete(url+'/api/city/'+_id).success(function(data){
			//angular.element(document.getElementById(_id)).remove();
			$location.path('/city');
		});
	}
	/**/
})
.controller('CompanyListController', function($scope, $http, $location){
	$http.get(url+'/api/company').
		success(function(data){
			$scope.items = data;
		}).
		error(function(err){
			console.log(err);
		});
	$scope.edit = function(_id){
		$location.path('/company/edit/'+_id);
	}	
})
.controller('CompanyEditController', function($scope, $routeParams, $http, $location){
	$http.get(url+'/api/company/' + $routeParams._id).success(function(data){
		$scope.item = data;
	});
	$scope.submit = function(company){
		$http.put(url+'/api/company', company).success(function(data){
			//console.log(data);
			$location.path('/company');
		});
	};
	/*/
	$scope.delete = function(_id){
		$http.delete(url+'/api/city/'+_id).success(function(data){
			//angular.element(document.getElementById(_id)).remove();
			$location.path('/city');
		});
	}
	/**/
})
.controller('CityListController', function($scope, $http, $location){
	$http.get(url+'/api/city').success(function(data){
		$scope.items = data;
	});
	$scope.edit = function(_id){
		$location.path('/city/edit/'+_id);
	}
	/*/
	$scope.delete = function(_id){
		$http.delete(url+'/api/city/'+_id).success(function(data){
			angular.element(document.getElementById(_id)).remove();
		});
	}
	/**/
})
.controller('CityWriteController', function($scope, $http, $location){
	$scope.submit = function(city){
		$http.post('/api/city', city).success(function(data){
			$location.path('/city');
		});
	};
})
.controller('CityEditController', function($scope, $routeParams, $http, $location){
	$http.get(url+'/api/city/' + $routeParams._id).success(function(data){
		$scope.item = data;
	});
	$scope.submit = function(city){
		$http.put(url+'/api/city', city).success(function(data){
			//console.log(data);
			$location.path('/city');
		});
	};
	/*/
	$scope.delete = function(_id){
		$http.delete(url+'/api/city/'+_id).success(function(data){
			//angular.element(document.getElementById(_id)).remove();
			$location.path('/city');
		});
	}
	/**/
});