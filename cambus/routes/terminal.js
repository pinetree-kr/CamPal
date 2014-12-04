var express = require('express');

var router = express.Router();

var Terminal = require('../models/terminal');

router.get('/', function(req, res){
	Terminal.find(function(err, terminals){
		if(!err){
			res.send(terminals);
		}
	});	
});
router.get('/:_id', function(req, res){
	var _id = req.params._id
	Terminal.findOne({_id:_id}, function(err, terminal){
		if(!err){
			res.send(terminal);
		}
	});
});

module.exports = router;
