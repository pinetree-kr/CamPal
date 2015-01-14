var express = require('express');

var router = express.Router();
var async = require('async');

var City = require('../models/city');
var Company = require('../models/company');
var Type = require('../models/type');
var Terminal = require('../models/terminal');
var CityRoute = require('../models/cityroute');
var Line = require('../models/line');
var Bus = require('../models/bus');
var Time = require('../models/time');

//var Information = require('../models/information');

router.get('/:_date', function(req, res){
	var _date = req.params._date;
	if(_date<0) res.status(500).send('not allowed');

	async.parallel(
		[
			function(callback){
				City.find().where('updated').gt(_date).exec(callback);
			},
			function(callback){
				Type.find().where('updated').gt(_date).exec(callback);
			},
			function(callback){
				Company.find().where('updated').gt(_date).exec(callback);
			},
			function(callback){
				Terminal.find().where('updated').gt(_date).exec(callback);
			},
			function(callback){
				Line.find().where('updated').gt(_date).exec(callback);
			},
			function(callback){
				Bus.find().where('updated').gt(_date).exec(callback);
			},
			function(callback){
				CityRoute.find().where('updated').gt(_date).exec(callback);
			}
		],
		function(err, results){
			if(err) res.status(500).send(err);
			var datas = {
				cities : results[0],
				types : results[1],
				companies : results[2],
				terminals : results[3],
				lines : results[4],
				buses : results[5],
				cityroutes : results[6]
			}
			res.send(datas);
		});
/*/
	async.waterfall([
		function(callback){
			City.find().where('updated').gt(_date).exec(function(err, cities){
				if(err) res.send(err);
				var json = {
					cities : cities
				};
				callback(null, json);
			});	
		},
		function(json, callback){
			Type.find().where('updated').gt(_date).exec(function(err, types){
				if(err) res.send(err);
				json['types'] = types;
				callback(null, json);
			});	
		},
		function(json, callback){
			Company.find().where('updated').gt(_date).exec(function(err, companies){
				if(err) res.send(err);
				json['companies'] = companies;
				callback(null, json);
			});
		},
		function(json, callback){
			Terminal.find().where('updated').gt(_date).exec(function(err, terminals){
				if(err) res.send(err);
				json['terminals'] = terminals;
				callback(null, json);
			});
		},
		function(json, callback){
			CityRoute.find().where('updated').gt(_date).exec(function(err, cityroutes){
				if(err) res.send(err);
				json['cityroutes'] = cityroutes;
				callback(null, json);
			});
		},
		function(json, callback){
			Line.find().where('updated').gt(_date).exec(function(err, lines){
				if(err) res.send(err);
				json['lines'] = lines;
				callback(null, json);
			});
		},
		function(json, callback){
			Bus.find().where('updated').gt(_date).exec(function(err, buses){
				if(err) res.send(err);
				json['buses'] = buses;
				//callback(null, json);
				res.send(json);
			});
		},
		function(err){
			if(err) res.status(500).send(err);
		}
	
	]);
/**/
});

module.exports = router;
