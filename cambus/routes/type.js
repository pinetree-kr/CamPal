var express = require('express');

var router = express.Router();

var Type = require('../models/type');

router.get('/', function(req, res){
	Type.find(function(err, types){
		if(!err){
			res.send(types);
		}
	});	
});
router.get('/:_id', function(req, res){
	var _id = req.params._id
	Type.findOne({_id:_id}, function(err, type){
		if(!err){
			res.send(type);
		}
	});
});

module.exports = router;
