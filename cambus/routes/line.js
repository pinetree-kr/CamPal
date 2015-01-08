var express = require('express');
var router = express.Router();
var Line = require('../models/line');
var City = require('../models/city');

router.get('/', function(req, res){
	/*/
	Line.find(
		null,
		'dept dest distance updated',
		function(err, lines){
		if(err) res.send(err);
		res.send(lines);
	}).populate('dept', 'name').populate('dest', 'name');
	/**/
	Line.find(function(err, lines){
		if(err) res.send(err);
		res.send(lines);
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
