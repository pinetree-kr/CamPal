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

module.exports = router;
