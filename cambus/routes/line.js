var express = require('express');
var router = express.Router();
var Line = require('../models/line');
var City = require('../models/city');

router.get('/', function(req, res){
	/**/
	Line.find({})
	.populate('dept','name pref index')
	.populate('dest', 'name pref index')
	.exec(function(err ,lines){
		if(err) res.status(500).send(err);
		res.send(lines);
	});
	;
});
router.get('/:_id', function(req, res){
	var _id = req.params._id
	Line.findOne(
		{_id:_id},
		function(err, line){
			if(err) res.status(500).send(err);
			res.send(line);
		}).populate('dept', 'name').populate('dest', 'name');
});
router.get('/bus/:_id', function(req, res){
	var line_id = req.params._id;
	var Bus = require('../models/bus');
	var Type = require('../models/type');
	var Company = require('../models/company');
	var async = require('async');
	
	//Line-Bus
	async.waterfall([
		function(callback){
			Line
				.findOne({_id:line_id})
				.select('_id dept dest distance')
				.populate('dept', 'name')
				.populate('dest', 'name')
				.exec(function(err, line){
				if(err) send.status(500).send(err);
				var json = {
					line : line
				}
				callback(null, json);
			});
		},
		function(json, callback){
			Bus
				.find({line_id : line_id})
				.select('_id company_id type_id mids times price transfer international seat rest_area updated')
				.populate('company_id', 'name')
				.populate('type_id', 'name')
				.exec(function(err, buses){
					if(err) res.status(500).send(err);
					json['buses'] = buses;
					res.send(json);
				});
		},
		function(err){
			if(err) res.status(500).send(err);
		}
		]);
});
router.put('/:_id', function(req, res){
	var _id = req.params._id;
	var line = req.body;
	var data = {};
	data.updated = new Date();
	if(line.dept !== undefined){
		data.dept = line.dept._id;
	}
	if(line.dest !== undefined){
		data.dest = line.dest._id;
	}
	if(line.distance !== undefined){
		data.distance = line.distance;
	}
	//console.log(data);
	Line.findOneAndUpdate(
		{
			_id : _id
		},
		{
			$set : data
		},
		function(err){
			if(err) res.status(500).send(err);
			res.send('update line');
		});
});
module.exports = router;
