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
router.get('/', function(req, res){
	;
});

router.post('/', function(req, res){
	var now = new Date();
	
	var obj = xlsx.parse(__dirname + '/CamBus_20141202_final.xlsx');
	if(obj){
		var City = require('../models/city');
		var Company = require('../models/company');
		var Type = require('../models/type');
		var Line = require('../models/line');
		var Bus = require('../models/bus');
		var Time = require('../models/time');
		var Terminal = require('../models/terminal');
		var CityRoute = require('../models/cityroute');

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
/*/
				// save or update;
				cities.forEach(function(record){
					var item = record.toObject();
					delete item._id;
					City.findOneAndUpdate(
						{
							name : record.name
						},
						item,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send('city:'+err);
							record._id = object._id;
						});
				});
/**/
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
				/*/
				companies.forEach(function(record){
					var item = record.toObject();
					delete item._id;
					Company.findOneAndUpdate(
						{
							name : record.name
						},
						item,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send('company:'+err);
							record._id = object._id;
						});
				});
/**/
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
				/*/
				types.forEach(function(record){
					var item = record.toObject();
					delete item._id;
					Type.findOneAndUpdate(
						{
							name : record.name
						},
						item,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send('type:'+err);
							record._id = object._id;
						});
				});
/**/
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
				/*/
				lines.forEach(function(record){
					var item = record.toObject();
					//console.log(record.dept);
					delete item._id;
					Line.findOneAndUpdate(
						{
							dept : record.dept,
							dest : record.dest
						},
						item,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send('line:'+err);
							record._id = object._id;
						});
				});
/**/
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
				/*/
				buses.forEach(function(record){
					var item = record.toObject();
					delete item._id;
					Bus.findOneAndUpdate(
						{
							line_id : record.line_id,
							company_id : record.company_id,
							type_id : record.type_id
						},
						item,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send('bus:'+err);
							record._id = object._id;
						});
				});
/**/
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
				/*/
				times.forEach(function(record){
					var item = record.toObject();
					delete item._id;
					Time.findOneAndUpdate(
						{
							bus_id : record.bus_id
						},
						item,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send('time:'+err);
							record._id = object._id;
						});
				});
				/**/
				break;
			case 'Terminal':	
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
				/*/
				terminals.forEach(function(record){
					var item = record.toObject();
					delete item._id;
					Terminal.findOneAndUpdate(
						{
							city_id : record.city_id,
							company_id : record.company_id,
							name : record.name,
							latlng : record.latlng
						},
						item,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send('terminal:'+err);
							record._id = object._id;
						});
				});
				/**/
				break;
			case 'CityRoutes':

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
				/*/
				cityroutes.forEach(function(record){
					var item = record.toObject();
					delete item._id;
					CityRoute.findOneAndUpdate(
						{
							city_id : record.city_id,
							line_no : record.line_no,
							line_order : record.line_order
						},
						item,
						{upsert:true},
						function(err, object){
							if(err) res.status(500).send('cityroute:'+err);
							record._id = object._id;
						});
				});
				/**/
				break;
			}
		});
		
		// update and save
		async.eachSeries(
			cities,
			function(item, callback){
				var upsert = item.toObject();
				delete upsert._id;
				City.findOneAndUpdate(
					{name : item.name},
					upsert,
					{upsert:true},
					function(err, object){
						if(err) err.status(500).send(err);
						item._id = object._id;
						callback();
					}
				);
			},
			function(err){
				console.log('insert cities done');
				console.log(cities);
			}
		);
		//console.log(cities);
		/*/
		cities.forEach(function(item){
			var upsert = item.toObject();
			delete upsert._id;
			City.findOneAndUpdate(
				{ name : item.name},
				upsert,
				{upsert:true},
				function(err, object){
				};
				);
		});
		/**/

		res.send('success');
	}else{
		console.error('not found');
		res.send('not found');
	}
});
module.exports = router;
