var url = "http://130.211.242.214:8180";

angular.module('app.controllers', ['ngRoute'])
.factory('TukTukService', function($http){
	var tuktuk = {};
	return {
		getTukTukList : function(success, error){
			$http.get(url+'/api/tuktuk').
				success(success).
				error(error);
		},
		getTukTuk : function(id, success, error){
			$http.get(url+'/api/tuktuk/'+id).
				success(success).
				error(error);
		},
		updateTukTuk : function(data, success, error){
			$http.put(url+'/api/tuktuk/'+data.id, data).
				success(success).
				error(error);
		}
	}
})
.controller('TukTukListController', function($scope, $location, TukTukService){
	TukTukService.getTukTukList(
		function(items){
			$scope.items = items;
		},
		function(err){
			console.log(err);
		});
	$scope.edit = function(id){
		$location.path('/tuktuk/edit/'+id);
	}
})
.controller('TukTukEditController', function($scope, $routeParams, $location, TukTukService){
	$scope.opts = [{
		name : 'Valid',
		value : true
	},{
		name : 'Invalid',
		value : false
	}];
	TukTukService.getTukTuk(
		$routeParams.id,
		function(item){
			$scope.item = item;
		},
		function(err){
			console.log(err);
		});

	$scope.submit = function(item){
		TukTukService.updateTukTuk({
			id:item._id,
			valid:item.valid
		},
		function(success){
			alert('update success');
			$location.path('/tuktuk');
		},
		function(err){
			console.log(err);
		});
	}
})
/*/
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
/**/
/*/
.controller('LineEditController', function($scope, $routeParams, $http, $location){
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
})
.controller('CityListController', function($scope, $http, $location){
	$http.get(url+'/api/city').success(function(data){
		$scope.items = data;
	});
	$scope.edit = function(_id){
		$location.path('/city/edit/'+_id);
	}
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
})
/**/
;