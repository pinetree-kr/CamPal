var express = require('express');

var router = express.Router();

var City = require('../models/city');

router.get('/', function(req, res){
	City.find(
		null,
		'name pref index updated',
		{
			//limit:10,
			sort:{
				pref : -1,
				index : 1,
				name : 1
			}
		},
		function(err, cities){
			if(!err){
				res.send(cities);
			}
		});
});
router.get('/:_id', function(req, res){
	var _id = req.params._id
	City.findOne({_id:_id}, function(err, city){
		if(!err){
			res.send(city);
		}
	});
});
router.post('/', function(req, res){
	var city = req.body;
	City.count({name:city.name}, function(err, count){
		if(err) res.status(500).send(err);
		if(count>0) res.send('city is already');
		var cityModel = new City(city);
		cityModel.save(function(err, model){
			if(err) res.status(500).send(err);
			res.send('new city');
		});
	});
});

router.put('/', function(req, res){
	var city = req.body;
	var data = {};
	data.name = city.name;
	data.updated = new Date();
	if(city.pref !== undefined)
		data.pref = city.pref;
	if(city.index !== undefined)
		data.index = city.index;
	//console.log(data);
	City.update(
		{
			_id : city._id
		},{
			$set : data
		},function(err){
			if(err) res.status(500).send(err);
			res.send('update city');
		});
});

router.delete('/:_id', function(req, res){
	var _id = req.params._id;
	if(_id===undefined)
		res.status(404).send();
	City.remove(
		{
			_id:_id
		}, function(err){
			if(err) res.status(500).send(err);
			res.send('delete city');
		});
});
module.exports = router;
