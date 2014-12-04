var express = require('express');

var router = express.Router();

var Time = require('../models/time');

router.get('/', function(req, res){
	Time.find(function(err, times){
		if(!err){
			res.send(times);
		}
	});	
});
router.get('/:_id', function(req, res){
	var _id = req.params._id
	Time.findOne({_id:_id}, function(err, time){
		if(!err){
			res.send(time);
		}
	});
});

module.exports = router;
