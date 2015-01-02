var express = require('express');
//var excelParser = require('excel-parser');
var xlsx = require('node-xlsx');
var router = express.Router();
require('array.prototype.find');

router.get('/', function(req, res){
	;
});

router.post('/', function(req, res){
	res.send('non author');
	var now = new Date();
	
	var obj = xlsx.parse(__dirname + '/CamBus_20141202_final.xlsx');
	if(obj){
		var cities = [];
		var types = [];
		var companies = [];
		var lines = [];
		var buses = [];
		var times = [];
		var terminals = [];
		var cityroutes = [];
		obj.forEach(function(item, index){
			switch(item.name){
			case 'Time':
				var City = require('../models/city');
				var Company = require('../models/company');
				var Type = require('../models/type');
				var Line = require('../models/line');
				var Bus = require('../models/bus');
				var Time = require('../models/time');

				// 출발지쪽 도시전체 입력
				item.data.forEach(function(record, row){
					if(row>0){
						var city = cities.find(function(n){
							return n.name === record[1];
						});
						if(city === undefined){
							city = new City({
								name : record[1],
								updated : now
							});
							cities.push(city);
						}
					}
				});

				// 도착지쪽 도시전체 입력
				item.data.forEach(function(record, row){
					if(row>0){
						var city = cities.find(function(n){
							return n.name === record[2];
						});
						if(city === undefined){
							city = new City({
								name : record[2],
								updated : now
							});
							cities.push(city);
						}
					}
				});
				cities.sort();

				//회사입력
				item.data.forEach(function(record, row){
					if(row>0){
						var company = companies.find(function(n){
							return n.name === record[3];
						});
						if(company === undefined){
							company = new Company({
								name : record[3],
								updated : now
							});
							companies.push(company);
						}
					}
				});
				companies.sort();

				//타입입력
				item.data.forEach(function(record, row){
					if(row>0){
						var type = types.find(function(n){
							return n.name === record[4];
						});
						if(type === undefined){
							type = new Type({
								name : record[4],
								updated : now
							});
							types.push(type);
						}
					}
				});
				types.sort();

				//라인입력
				item.data.forEach(function(record, row){
					if(row>0){
						var dept = cities.find(function(n){
							return n.name === record[1];
						});
						var dest = cities.find(function(n){
							return n.name === record[2];
						});

						var line = lines.find(function(n){
							return n.dept === dept._id && n.dest === dest._id;
						});
						if(line === undefined){
							line = new Line({
								dept : dept._id,
								dest : dest._id,
								updated : now
							});
							if(record[10] !== undefined){
								line.distance = record[10];
							}
							lines.push(line);
						}
					}
				});
				lines.sort();
				//console.log(lines);
				//버스입력
				item.data.forEach(function(record, row){
					if(row>0){
						var dept = cities.find(function(n){
							return n.name === record[1];
						});
						var dest = cities.find(function(n){
							return n.name === record[2];
						});
						var company = companies.find(function(n){
							return n.name === record[3];
						});
						var type = types.find(function(n){
							return n.name === record[4];
						});
						
						var line = lines.find(function(n){
							return n.dept === dept._id && n.dest === dest._id;
						});
						
						var bus = buses.find(function(n){
							return n.line_id === line._id
								&& n.company_id === company._id
								&& n.type_id === type._id;
						});
						/*/
						if(bus !== undefined){
							console.log(record[0]);
						}
						/**/
						if(bus === undefined){
							var bus = new Bus({
								line_id : line._id,
								company_id : company._id,
								type_id : type._id,
								updated : now
							});

							//mid
							if(record[5] !== undefined){
								var mid = record[5].split(',');
								mid.forEach(function(item){
									bus.mids.push(item);
								});
							}
							if(record[6] !== undefined){
								bus.transfer = record[6];
							}
							if(record[12] !== undefined){
								bus.price = record[12];
							}
							if(record[11] !== undefined){
								bus.seat = record[11];
							}
							if(record[14] !== undefined){
								bus.rest_area = record[14];
							}
							if(record[17] !== undefined){
								bus.international = record[17];
							}
							
							buses.push(bus);
						}
					}
				});

				//시간표 입력
				item.data.forEach(function(record, row){
					if(row>0){
						var dept = cities.find(function(n){
							return n.name === record[1];
						});
						var dest = cities.find(function(n){
							return n.name === record[2];
						});
						var company = companies.find(function(n){
							return n.name === record[3];
						});
						var type = types.find(function(n){
							return n.name === record[4];
						});
						var line = lines.find(function(n){
							return n.dept === dept._id && n.dest === dest._id;
						});
						var bus = buses.find(function(n, index, objects){
							return n.line_id === line._id && n.company_id === company._id
								&& n.type_id === type._id;
						});
						
						var time = new Time({
							bus_id : bus._id,
							dept_t : record[7],
							updated : now
						});
						times.push(time);
					}
				});
				break;
			case 'Terminal':
				var Terminal = require('../models/terminal');

				// 터미널정보입력
				item.data.forEach(function(record, row){
					if(row>0){
						var city = cities.find(function(n){
							return n.name === record[1];
						});
						var company = companies.find(function(n){
							return n.name === record[2];
						});
						
						terminal = new Terminal({
							city_id : city._id,
							company_id : company._id,
							name : record[3],
							updated : now
						});

						if(record[4] !== undefined){
							var phone = record[4].split('/');
							phone.forEach(function(item){
								terminal.phones.push(item);
							});
						}
						if(record[5] !== undefined){
							terminal.purchase = record[5]==='O'?true:false;
						}
						if(record[6] !== undefined){
							terminal.in = record[6]==='O'?true:false;
						}
						if(record[7] !== undefined){
							terminal.out = record[7]==='O'?true:false;
						}
						if(record[9] !== undefined){
							terminal.address = record[9];
						}
						if(record[10] !== undefined){
							var misc = {
								lang : 'Eng',
								misc : record[10]
							}
							terminal.miscs.push(misc);
						}
						if(record[11] !== undefined){
							var misc = {
								lang : 'Kor',
								misc : record[11]
							}
							terminal.miscs.push(misc);
						}
						if(record[12] !== undefined){
							var latlng = record[12].split(',');
							terminal.latlng.lat = latlng[0];
							terminal.latlng.lng = latlng[1];
						}
						terminals.push(terminal);
						
					}
				});
				break
			case 'CityRoutes':
				var CityRoute = require('../models/cityroute');

				// 시내버스 정보입력
				item.data.forEach(function(record, row){
					if(row>0){
						var city = cities.find(function(n){
							return n.name === record[0];
						});
						
						var cityroute = cityroutes.find(function(n){
							return n.city_id === city._id
								&& n.line_no === record[1]
								&& n.line_order === record[2];
						});
						
						if(cityroute === undefined){
							cityroute = new CityRoute({
								city_id : city._id,
								line_no : record[1],
								line_order : record[2],
								updated : now
							});

							if(record[3] !== undefined){
								var name = {
									lang : 'Eng',
									name : record[3]
								}
								cityroute.names.push(name);
							}
							if(record[4] !== undefined){
								var name = {
									lang : 'Kmr',
									name : record[4]
								}
								cityroute.names.push(name);
							}
							if(record[5] !== undefined){
								var name = {
									lang : 'Kor',
									name : record[5]
								}
								cityroute.names.push(name);
							}
							if(record[6] !== undefined){
								var latlng = record[6].split(',');
								
								cityroute.latlng.lat = latlng[0];
								cityroute.latlng.lng = latlng[1];
							}

							cityroutes.push(cityroute);
						}
					}
				});
				break;
			}
		});
		
		/**/
		cities.forEach(function(record){
			record.save(function(err, item){
				if(err) res.send(err);
			});
		});
		types.forEach(function(record){
			record.save(function(err, item){
				if(err) res.send(err);
			});
		});
		companies.forEach(function(record){
			record.save(function(err, item){
				if(err) res.send(err);
			});
		});
		lines.forEach(function(record){
			record.save(function(err, item){
				if(err) res.send(err);
			});
		});
		buses.forEach(function(record){
			record.save(function(err, item){
				if(err) res.send(err);
			});
		});
		times.forEach(function(record){
			record.save(function(err, item){
				if(err) res.send(err);
			});
		});
		terminals.forEach(function(record){
			record.save(function(err, item){
				if(err) res.send(err);
			});
		});
		cityroutes.forEach(function(record){
			record.save(function(err, item){
				if(err) res.send(err);
			});
		});
		/**/
		/**/
		var Info = require('../models/information');
		var info = new Info({
			cities : {
				size : cities.length,
				updated : now,
			},
			companies : {
				size : companies.length,
				updated : now,
			},
			types : {
				size : types.length,
				updated : now,
			},
			lines : {
				size : lines.length,
				updated : now,
			},
			buses : {
				size : buses.length,
				updated : now,
			},
			times : {
				size : times.length,
				updated : now,
			},
			terminals : {
				size : terminals.length,
				updated : now,
			},
			cityroutes : {
				size : cities.length,
				updated : now,
			},
		});
		info.save(function(err, item){
			if(err) res.send(err);
		});
		
		res.send('success');
	}else{
		console.error('not found');
		res.send('not found');
	}
});
module.exports = router;
