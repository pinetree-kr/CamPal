var express = require('express');
//var excelParser = require('excel-parser');
var xlsx = require('node-xlsx');
var router = express.Router();
var async = require('async');
require('array.prototype.find');
/*/
var updateArray = function(array, oldItem, newItem){
	for(var i=0; i<array.length; i++){
		if(array[i]._id == oldItem._id){
			array[i]._id = newItem._id;
			break;
		}
	}
}
/**/
var City = require('../models/city');
var Company = require('../models/company');
var Type = require('../models/type');
var Line = require('../models/line');
var Bus = require('../models/bus');
var Time = require('../models/time');
var Terminal = require('../models/terminal');
var CityRoute = require('../models/cityroute');

var now = new Date();

var updateSheetTime = function(records, datas, sheetCB, res){
	async.waterfall([
		function(callback){
			records.forEach(function(record, row){
				if(row>0){
					var city = datas.cities.find(function(n){
						return n.name === record[1];
					});
					if(city === undefined){
						city = new City({
							name : record[1],
							updated : now
						});
						datas.cities.push(city);
					}
				}
			});
			// 도착지쪽 도시전체 입력
			records.forEach(function(record, row){
				if(row>0){
					var city = datas.cities.find(function(n){
						return n.name === record[2];
					});
					if(city === undefined){
						city = new City({
							name : record[2],
							updated : now
						});
						datas.cities.push(city);
					}
				}
			});
			datas.cities.sort();
			async.eachSeries(
				datas.cities,
				function(item, objectCB){
					var upsert = item.toObject();
					delete upsert._id;
					City.findOneAndUpdate(
						{name : item.name},
						upsert,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send(err);
							item._id = object._id;
							objectCB();
						}
					);
				},
				function(err){
					console.log('insert cities done');
					callback(null);
				}
			);
		},
		function(callback){
			//회사입력
			records.forEach(function(record, row){
				if(row>0){
					var company = datas.companies.find(function(n){
						return n.name === record[3];
					});
					if(company === undefined){
						company = new Company({
							name : record[3],
							updated : now
						});
						datas.companies.push(company);
					}
				}
			});
			datas.companies.sort();
			async.eachSeries(
				datas.companies,
				function(item, objectCB){
					var upsert = item.toObject();
					delete upsert._id;
					Company.findOneAndUpdate(
						{name : item.name},
						upsert,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send(err);
							item._id = object._id;
							objectCB();
						}
					);
				},
				function(err){
					console.log('insert companies done');
					callback(null);
				}
			);
		},
		function(callback){
			//타입입력
			records.forEach(function(record, row){
				if(row>0){
					var type = datas.types.find(function(n){
						return n.name === record[4];
					});
					if(type === undefined){
						type = new Type({
							name : record[4],
							updated : now
						});
						datas.types.push(type);
					}
				}
			});
			datas.types.sort();
			async.eachSeries(
				datas.types,
				function(item, objectCB){
					var upsert = item.toObject();
					delete upsert._id;
					Type.findOneAndUpdate(
						{name : item.name},
						upsert,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send(err);
							item._id = object._id;
							objectCB();
						}
					);
				},
				function(err){
					console.log('insert types done');
					callback(null);
				}
			);
		},
		function(callback){
			//라인입력
			records.forEach(function(record, row){
				if(row>0){
					var dept = datas.cities.find(function(n){
						return n.name === record[1];
					});
					var dest = datas.cities.find(function(n){
						return n.name === record[2];
					});

					var line = datas.lines.find(function(n){
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
						datas.lines.push(line);
					}
				}
			});
			datas.lines.sort();
			async.eachSeries(
				datas.lines,
				function(item, objectCB){
					var upsert = item.toObject();
					delete upsert._id;
					Line.findOneAndUpdate(
						{
							dept : item.dept,
							dest : item.dest
						},
						upsert,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send(err);
							item._id = object._id;
							objectCB();
						}
					);
				},
				function(err){
					console.log('insert lines done');
					callback(null);
				}
			);
		},
		function(callback){
			//버스입력
			records.forEach(function(record, row){
				if(row>0){
					var dept = datas.cities.find(function(n){
						return n.name === record[1];
					});
					var dest = datas.cities.find(function(n){
						return n.name === record[2];
					});
					var company = datas.companies.find(function(n){
						return n.name === record[3];
					});
					var type = datas.types.find(function(n){
						return n.name === record[4];
					});
					
					var line = datas.lines.find(function(n){
						return n.dept === dept._id && n.dest === dest._id;
					});
					
					var bus = datas.buses.find(function(n){
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
						
						datas.buses.push(bus);
					}
				}
			});
			datas.buses.sort();
			async.eachSeries(
				datas.buses,
				function(item, objectCB){
					var upsert = item.toObject();
					delete upsert._id;
					Bus.findOneAndUpdate(
						{
							line_id : item.line_id,
							company_id : item.company_id,
							type_id : item.type_id
						},
						upsert,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send(err);
							item._id = object._id;
							objectCB();
						}
					);
				},
				function(err){
					console.log('insert buses done');
					callback(null);
				}
			);
		},
		function(callback){
			//시간표 입력
			records.forEach(function(record, row){
				if(row>0){
					var dept = datas.cities.find(function(n){
						return n.name === record[1];
					});
					var dest = datas.cities.find(function(n){
						return n.name === record[2];
					});
					var company = datas.companies.find(function(n){
						return n.name === record[3];
					});
					var type = datas.types.find(function(n){
						return n.name === record[4];
					});
					var line = datas.lines.find(function(n){
						return n.dept === dept._id && n.dest === dest._id;
					});
					var bus = datas.buses.find(function(n, index, objects){
						return n.line_id === line._id && n.company_id === company._id
							&& n.type_id === type._id;
					});
					
					var time = new Time({
						bus_id : bus._id,
						dept_t : record[7],
						updated : now
					});
					datas.times.push(time);
				}
			});
			datas.times.sort();
			async.eachSeries(
				datas.times,
				function(item, objectCB){
					var upsert = item.toObject();
					delete upsert._id;
					Time.findOneAndUpdate(
						{
							bus_id : item.bus_id
						},
						upsert,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send(err);
							item._id = object._id;
							objectCB();
						}
					);
				},
				function(err){
					console.log('insert times done');
					callback(null);
					//sheetCB();
				}
			);
		},
		function(callback){
			console.log('time sheet done');
			sheetCB();
		}
	]);
	

}
var updateSheetCityRoute = function(records, datas, sheetCB, res){
	// 시내버스 정보입력
	async.waterfall([
		function(callback){
			records.forEach(function(record, row){
				if(row>0){
					var city = datas.cities.find(function(n){
						return n.name === record[0];
					});
					
					var cityroute = datas.cityroutes.find(function(n){
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
						datas.cityroutes.push(cityroute);
					}
				}
			});
			async.eachSeries(
				datas.cityroutes,
				function(item, objectCB){
					var upsert = item.toObject();
					delete upsert._id;
					CityRoute.findOneAndUpdate(
						{
							city_id : item.city_id,
							line_no : item.line_no,
							line_order : item.line_order
						},
						upsert,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send(err);
							item._id = object._id;
							objectCB();
						}
					);
				},
				function(err){
					console.log('insert cityroutes done');
					//sheetCB();
					callback(null);
				}
			);
		},
		function(callback){
			console.log('cityroutes sheet done');
			sheetCB();
		},
	]);
}
var updateSheetTerminal = function(records, datas, sheetCB, res){
	// 터미널정보입력
	async.waterfall([
		function(callback){
			records.forEach(function(record, row){
				if(row>0){
					var city = datas.cities.find(function(n){
						return n.name === record[1];
					});
					var company = datas.companies.find(function(n){
						return n.name === record[2];
					});
					terminal = new Terminal({
						terminal_no : record[0],
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
					datas.terminals.push(terminal);
				}
			});
			async.eachSeries(
				datas.terminals,
				function(item, objectCB){
					var upsert = item.toObject();
					delete upsert._id;
					Terminal.findOneAndUpdate(
						{
							/*/
							city_id : item.city_id,
							company_id : item.company_id,
							name : item.name,
							latlng : item.latlng
							/**/
							terminal_no : item.terminal_no
						},
						upsert,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send(err);
							item._id = object._id;
							objectCB();
						}
					);
				},
				function(err){
					console.log('insert terminals done');
					//sheetCB();
					callback(null);
				}
			);
		},
		function(callback){
			console.log('terminal sheet done');
			sheetCB();
		}
	]);
}
router.get('/', function(req, res){
	;
});

router.post('/', function(req, res){
	var obj = xlsx.parse(__dirname + '/CamBus_20141202_final.xlsx');
	if(obj){
		var datas = {
			cities : [],
			types : [],
			companies : [],
			lines : [],
			buses : [],
			times : [],
			terminals : [],
			cityroutes : []
		}

		async.eachSeries(
			obj,
			function(sheet, sheetCB){
				switch(sheet.name){
				case 'Time':
					console.log('time start');
					updateSheetTime(sheet.data, datas, sheetCB, res);
					break;
				case 'CityRoutes':
					console.log('city route start');
					updateSheetCityRoute(sheet.data, datas, sheetCB, res);
					break;
				case 'Terminal':
					console.log('terminal start');
					updateSheetTerminal(sheet.data, datas, sheetCB, res);
					break;
				default:
					break;
				}
			},
			function(err){
				if(err) res.status(500).send(err);
				res.send('success');
			}
		);
	}else{
		console.error('not found');
		res.send('not found');
	}
});
module.exports = router;
