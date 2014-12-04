var express = require('express');

var router = express.Router();

var Line = require('../models/line');

router.get('/', function(req, res){
	Line.find(function(err, lines){
		if(!err){
			res.send(lines);
		}
	});	
});
router.get('/:_id', function(req, res){
	var _id = req.params._id
	Line.findOne({_id:_id}, function(err, line){
		if(!err){
			res.send(line);
		}
	});
});

module.exports = router;
