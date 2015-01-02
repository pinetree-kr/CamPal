var express = require('express');
var router = express.Router();
var Line = require('../models/line');
var City = require('../models/city');

router.get('/', function(req, res){
	/*/
	City.find(function(err, cities){
		if(err) res.send(err);
		Line.find(function(err, lines){
			if(err) res.send(err);
			res.send(lines);
		});
	})
/**/
	Line.find(
		null,
		'dept dest distance',
		function(err, lines){
		if(err) res.send(err);
		res.send(lines);
	}).populate('dept', 'name').populate('dest', 'name');
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
