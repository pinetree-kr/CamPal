var express = require('express');
var router = express.Router();
var Memo = require('../models/memo');

router.get('/', function(req, res){
	Memo.find(function(err, memos){
		if(err)
			res.send(err);
		res.send(memos);
	});
});

router.get('/:_id', function(req, res){
	var _id = req.params._id;
	Memo.findOne({_id:_id}, function(err, memo){
		if(err)
			res.send(err);
		res.send(memo);
	});
});

router.put('/', function(req, res){
	Memo.update(
		// cond
		{
			_id : req.body._id
		},
		// update
		{
			$set:{
				author : req.body.author,
				contents : req.body.contents
			}
		},
		// callback
		function(err){
			if(err)
				res.send(err);
			res.send();
		});
});

router.post('/', function(req, res){
	var memoModel = new Memo(req.body);
	memoModel.save(function(err){
		if(err)
			res.send(err);
		res.send();
	});
});

router.delete('/:_id', function(req, res){
	var _id = req.params._id;
	Memo.remove({_id:_id}, function(err){
		if(err)
			res.send(err);
		res.send();
	});
});

module.exports = router;
