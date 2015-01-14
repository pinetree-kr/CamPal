var express = require('express');

var router = express.Router();

var Bus = require('../models/bus');

router.get('/', function(req, res){
	Bus.find(function(err, buses){
		if(!err){
			res.send(buses);
		}
	});	
});
router.get('/:_id', function(req, res){
	var _id = req.params._id
	Bus.findOne({_id:_id}, function(err, bus){
		if(!err){
			res.send(bus);
		}
	});
});
router.put('/:_id', function(req, res){
	var id = req.params._id;
	
	var bus = req.body;
	var data = {};

	if(bus.mids === undefined){
		data.mids = bus.mids;
	}
	if(bus.times === undefined){
		data.times = bus.times;
	}
	if(bus.price === undefined){
		data.price = bus.price;
	}
	if(bus.seat === undefined){
		data.seat = bus.seat;
	}
	data.updated = new Date();

	Bus.findOneAndUpdate(
		{_id:id},
		{
			$set : data
		},
		function(err, result){
			if(err) res.status(500).send(err);
			res.send(result);
		});
	
});
module.exports = router;
