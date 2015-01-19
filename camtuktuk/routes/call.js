var express = require('express');
var router = express.Router();
var Call = require('../models/call');
var User = require('../models/user');
var TukTuk = require('../models/tuktuk');
var async = require('async');

var Error = require('../models/error');

var e = new Error({
	message : '',
	type : '',
	code : 0
});

router.get('/', function(req, res){
	var params = req.query;
	if(params.id === undefined
		|| params.phone_no === undefined){
		e.error.message = 'need id, phone_no to query about the user';
		e.error.type = 'request exception';
		e.error.code = 401;
		return res.json(401, e);
	}

	async.waterfall([
		function(callback){
			User.findOne({_id : params.id, phone_no : params.phone_no})
				.exec(function(err, item){
					if(err){
						e.error.message = err;
						e.error.type = 'query exception';
						e.error.code = 402;
						return res.json(500, e);
					}
					callback();
				});
		},
		function(callback){
		}
		]);

});
/*/
router.post('/', function(req, res){
	var user = req.body;
	if(user.phone_no === undefined 
		|| user.device_id === undefined 
		|| user.platform === undefined){
		e.error.message = 'need user information to insert new user';
		e.error.type = 'request exception';
		e.error.code = 211;
		res.json(401, e);
	}

	var data = {
		phone_no : user.phone_no,
		device_id : user.device_id,
		platform : user.platform,
		joined : new Date()
	}

	User.findOneAndUpdate(
		{phone_no : user.phone_no},
		data,
		{upsert:true},
		function(err, result){
			if(err){
				e.error.message = err;
				e.error.type = 'query exception';
				e.error.code = 212;
				res.json(500,e);
			}
			res.json({
				insert : true,
				_id : result._id
			});
		});
});

router.put('/:_id', function(req, res){
	var id = req.params._id;
	var user = req.body;
	
	if(id === undefined
		|| user.device_id === undefined){
		e.error.message = 'need id and device_id to update the user';
		e.error.type = 'request exception';
		e.error.code = 221;
		res.json(401,e);
	}
	var data = {};
	if(user.phone_no !== undefined){
		data.phone_no = user.phone_no;
	}
	User.findOneAndUpdate(
		{
			_id : id,
			device_id : user.device_id
		},
		{$set:data},
		function(err, result){
			if(err){
				e.error.message = err;
				e.error.type = 'query exception';
				e.error.code = 222;
				res.json(500, e);
			}
			res.json(result);
		});
});

router.delete('/:_id', function(req, res){
	var id = req.params._id;
	var user = req.body;
	if(id === undefined
		|| user.device_id === undefined){
		e.error.message = 'need id and device_id to delete the user';
		e.error.type = 'request exception';
		e.error.code = 231;
		res.json(401, e);
	}
	User.findOneAndRemove({
			_id : id,
			device_id:user.device_id
		}, function(err, user){
		if(err){
			e.error.message = err;
			e.error.type = 'query exception';
			e.error.code = 232;
			res.json(500, e);
		}
		if(user){
			res.json({
				delete : true
			});
		}else{
			e.error.message = 'user has not found';
			e.error.type = 'not found exception';
			e.error.code = 233;
			res.json({
				delete : false,
				error : e.error
			});
		}
	});
});
/**/
module.exports = router;
