var express = require('express');

var router = express.Router();

var City = require('../models/city');

router.get('/', function(req, res){
	City.find(function(err, cities){
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

module.exports = router;
