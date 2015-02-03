var express = require('express');
var router = express.Router();
var Call = require('../models/call');
var User = require('../models/user');
var moment = require('moment');
var async = require('async');
var auth = require('./auth');
var push = require('./push');

var tokenAuth = auth.tokenAuth;

/*
 * call 목록 조회
 * @params : token
 * @description
 */
router.get('/', tokenAuth, function(req, res){
	var params = req.query;
	Call.find({status:'request'})
	.populate('caller','phone_no')
	.exec(function(err, items){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 611
				}
			});
		}else{
			return res.json(items);
		}
	});
});

/*
 * call 정보
 * @params : call_id, token
 * @description
 */
router.get('/:call_id', tokenAuth, function(req, res){
	var _id = req.params.call_id;
	Call.findOne({
		_id : _id
	},function(err, item){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 612
				}
			});
		}else{
			if(item){
				return res.json(item);
			}else{
				return res.json(400,{
					error : {
						message : 'Request for Call has not found',
						type : 'not found exception',
						code : 613
					}
				});
			}
		}
	});
});

/*
 * call 완료
 * @params : call_id, token, type
 * @description : caller와 callee로부터 완료정보를 받는다
 */
router.put('/:call_id/done/:type', tokenAuth, function(req, res){
	var call_id = req.params.call_id;
	var type = req.params.type;
	var user_id = req.user_id;

	async.waterfall([
		// Call 정보 가져오기
		function(callback){
			Call.findOne({_id:call_id}, callback);
		},
		// Call 정보 업데이트
		function(call, callback){
			var done = call.done;
			if(type === 'caller')
				done.caller = true;
			else if(type === 'callee')
				done.callee = true;
			var status = item.status;
			if(done.caller && done.callee)
				status = 'done';

			Call.findOneAndUpdate({_id:call_id},{
				$set:{
					status : status,
					done : {
						caller : done.caller,
						callee : done.callee
					}
				}
			},callback);
		},
		// processing after 'done'
		function(call, callback){
			if(call.status === 'done'){
				User.find({call:call._id}, function(err, items){
					if(err) callback(err);
					async.each(items, function(item, next){
						User.findOneAndUpdate({_id:item._id}, {$set:{call:null}}, next);
					},function(err){
						if(err) callback(err);
						push.pushToBoth({
								type : call.status,
								foreground : "0",
								sound : '',
							},{
								caller : call.caller,
								callee : call.callee
							},
							callback);
					})
				});
			}else{
				// 현재 상태 반환
				callback(null, call);
			}
		}
	],function(err,result){
		if(err){
			return res.json(400,{
				error : {
					message : err.message,
					type : err.type,
					code : 810
				}
			})
		}else{
			return res.json(result);
		}
	});
});

/*
 * call 수락
 * @params : call_id, token
 * @description : callee로부터 수락받는다
 */
router.put('/:call_id/accept', tokenAuth, function(req, res){
	var call_id = req.params.call_id;
	var user_id = req.user_id;

	async.waterfall([
		// update
		function(callback){
			User.findOneAndUpdate({_id:user_id},{
				$set : {call : call_id}
			}, callback);
		},
		function(user, callback){
			Call.findOneAndUpdate({_id:call_id},
				{$set:{status:'response', callee:user._id}}, callback);
		},
		// push
		function(call, callback){
			push.pushToOne({
					message : 'The call for TukTuk has been responsed',
					title : 'CamTukTuk',
					call : call._id,
					type : 'accept'
				},
				// to caller
				call.caller,
				callback);
		}
	],function(err,result){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 710
				}
			});
		}else{
			return res.json({accept:true});
		}
	});
});

/*
 * call 제거
 * @params : call_id, token
 * @description
 */
router.delete('/:call_id', tokenAuth, function(req, res){
	var call_id = req.params.call_id;
	var user_id = req.user_id;

	async.waterfall([
		// 관련되 사용자의 call 제거
		function(callback){
			User.findOneAndUpdate({_id:user_id},
				{$set : {call:null}}, function(err, item){
					if(err) callback(err);
					callback(null, item);
				});
		},
		function(user, callback){
			Call.findOneAndRemove({_id:call_id,caller:user._id}, callback);
		}
	],function(err, result){
		if(err){
			return res.json(500, {
				error : {
					message : err.message,
					type : err.type,
					code : 702
				}
			});
		}else{
			return res.json({
				delete : true
			});
		}
	});
});

/*
 * call 요청
 * @params : call_id, token, etc...
 * @description
 */
router.post('/request', tokenAuth, function(req, res){
	var params = req.body;
	//var user_id = req.user_id;
	if(!params.caller || !params.type	|| !params.dept || !params.dest){
		return res.json(400,{
			error : {
				message : 'Need more Information to request Call',
				type : 'request exception',
				code : 601
			}
		});
	}else if(!params.type && params.type === 'long' && !params.rentalType){
		return res.json(400,{
			error : {
				message : 'Need more Information to request Call',
				type : 'request exception',
				code : 601
			}
		});
	}

	async.waterfall([
		// call 생성
		function(callback){
			var call = new Call(params);
			call.status = 'request';
			call.created = moment().valueOf();
			call.save(function(err, item){
				if(err) callback(err);
				callback(null, item);
			});
		},
		// user에게 call정보 갱신
		function(call, callback){
			User.findOneAndUpdate({_id:params.caller},
				{$set : {call:call._id}}, function(err, item){
					if(err) callback(err);
					callback(null, item);
				});
		},
		// 전체에게 푸싱
		function(call, callback){
			push.pushToIdles({
					message: 'The call for TukTuk has been requested',
					title : 'CamTukTuk',
					call : call._id,
					type : 'request'
				},
				callback);
		}
	],function(err, result){
		if(err){
			return res.json(400,{
				error : {
					message : err.message,
					type : err.type,
					code : 801
				}
			});
		}else{
			return res.json({request:true});
		}
	});
});

module.exports = router;
