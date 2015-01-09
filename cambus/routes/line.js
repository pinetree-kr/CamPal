var express = require('express');
var router = express.Router();
var Line = require('../models/line');
var City = require('../models/city');

router.get('/', function(req, res){
	/**/
	Line.find({})
	.populate('dept','name pref index')
	.populate('dest', 'name pref index')
	.exec(function(err ,lines){
		if(err) res.status(500).send(err);
		res.send(lines);
	});
	;
});
router.get('/:_id', function(req, res){
	var _id = req.params._id
	Line.findOne(
		{_id:_id},
		function(err, line){
			if(err) res.status(500).send(err);
			res.send(line);
		}).populate('dept', 'name').populate('dest', 'name');
});
router.put('/:_id', function(req, res){
	var _id = req.params._id;
	var line = req.body;
	var data = {};
	data.updated = new Date();
	if(line.dept !== undefined){
		data.dept = line.dept._id;
	}
	if(line.dest !== undefined){
		data.dest = line.dest._id;
	}
	if(line.distance !== undefined){
		data.distance = line.distance;
	}
	//console.log(data);
	Line.findOneAndUpdate(
		{
			_id : _id
		},
		{
			$set : data
		},
		function(err){
			if(err) res.status(500).send(err);
			res.send('update line');
		});
});
module.exports = router;
