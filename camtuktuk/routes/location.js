var express = require('express');
var moment = require('moment');
var app = express();
var router = express.Router();
var jwt = require('jwt-simple');

var async = require('async');
var User = require('../models/user');
var TukTuk = require('../models/tuktuk');
var secret = 'photobypinetree';
var auth = require('./auth');

var tokenAuth = auth.tokenAuth; 

router.post('/', /*/tokenAuth,/**/ function(req, res){
	//var id = req.params.id;
	var params = req.body;
	
	console.log(params);
	/*/
	User.findOneAndUpdate(
		{_id:id},
		{$set:params},
		function(err, item){
			if(err){
				return res.json(400,{
					error : {
						message : err.message,
						type : err.type,
						code : 452
					}
				});
			}else{
				//console.log(item);
				return res.json(item);
			}
		});
		/**/
});

// 300 사용자 정보 가져오기
router.get('/:id', tokenAuth, function(req, res){
	var id = req.params.id;
	async.parallel([
		function(callback){
			User.findOne({_id:id}, function(err, item){
				if(err){
					return res.json(400, {
						error : {
							message : err.message,
							type : 'query exception',
							code : 301
						}
					});
				}else{
					callback(null, item);
				}
			});
		},
		function(callback){
			var TukTuk = require('../models/tuktuk');
			TukTuk.findOne({user:id,valid:true}, function(err, item){
				if(err){
					return res.json(500, {
						error : {
							message : err.message,
							type : err.type,
							code : 305
						}
					});
				}else{
					callback(null, item);
				}
			});
		},
		function(callback){
			var Call = require('../models/call');
			Call.findOne({
				$or:[{caller:id},{callee:id}],
				status:{$ne:'done'}	
			},function(err, item){
				if(err){
					return res.json(500, {
						error : {
							message : err.message,
							type : err.type,
							code : 305
						}
					});
				}else{
					callback(null, item);
				};
			});
		}
	],
	function(err, results){
		if(err){
			return res.json(500,{
				error : {
					message :err.message,
					type : err.type,
					code : 308
				}
			});
		}else{
			if(results[0]===null){
				return res.json(400,{
					error : {
						message : 'Invalid user',
						type : 'not found exception',
						code : 303
					}
				});
			}else{
				var data = {
					user : results[0]
				};
				if(results[1]!==null)
					data.tuktuk = results[1];
				if(results[2]!==null)
					data.call = results[2]._id;
				return res.json(data);
			}
		}
	});
});

router.put('/:_id', tokenAuth, function(req, res){
	var id = req.params._id;
	var params = req.body;

	User.findOne({_id : id}, function(err, user){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : 'query exception',
					code : 222
				}
			});
		}else{
			if(user){
				user.update({$set:params}, function(err, result){
					if(err){
						return res.json(500,{
							error : {
								message :err.message,
								type : 'query exception',
								code : 224
							}
						});
					}else{
						return res.json({
							update : true
						});
					}
				});
			}else{
				return res.json({
					error : {
						message : 'Invalid user',
						type : 'not found exception',
						code : 223
					}
				});
			}
		}
	});
});

router.delete('/:_id', tokenAuth, function(req, res){
	var id = req.params._id;
	
	User.findOneAndRemove({_id : id}, function(err, user){
		if(err){
			return res.json(500, {
				error :{
					message : err.message,
					type : err.type,
					code : 232
				}
			});
		}
		if(user){
			return res.json({
				delete : true
			});
		}else{
			return res.json({
				delete : false,
				error : {
					message : 'user has not found',
					type : 'not found exception',
					code : 233
				}
			});
			
		}
	});
});

module.exports = router;
