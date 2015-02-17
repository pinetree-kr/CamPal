var express = require('express');
var router = express.Router();
var Call = require('../models/call');
var User = require('../models/user');
var moment = require('moment');
var async = require('async');
var auth = require('./auth');
var push = require('./push');

var tokenAuth = auth.tokenAuth;

var limit = 5*60*1000;

/*
 * call 목록 조회
 * @params : token
 * @description
 */
router.get('/', tokenAuth, function(req, res){
	//var params = req.query;
	var user_id = req.user_id;
	//var user_id = "54d8c0b6e34abcfd25da0668";
	async.parallel([
		function(callback){
			Call.find({
				status:'request',
				created:{
					$gt:moment().valueOf()-limit
				}
			})
			.populate('caller','phone_no')
			.exec(callback);
		},
		function(callback){
			var TukTuk = require('../models/tuktuk');
			TukTuk.findOne({user:user_id}, function(err,item){
				if(err) callback(err);
				if(!item){
					callback({
						message : 'Invalid auth',
						type : 'invalid auth exception'
					});
				}else{
					callback(null, item);
				}
			});
		}
	],function(err, results){
		if(err){
			console.log('getCall');
			console.log(err);
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 611
				}
			});
		}else{
			var tuktuk = results[1];
			var calls = results[0];
			var geoTools = require('geo-tools');
			var datas = calls.filter(function(item){
				//return true;
				var length = distance(tuktuk.latlng, item.dept.latlng);
				if(length<=0.8)	return true;
				else return false;
			});
			return res.json(datas);
		}
	});
});

/*
 * call 정보
 * @params : call_id, token
 * @description
 */
router.get('/:call_id', tokenAuth, function(req, res){
	var call_id = req.params.call_id;
	Call.findOne({
		_id : call_id
	},function(err, item){
		if(err){
			console.log('getCallId');
			console.log(err);
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 612
				}
			});
		}else{
			if(item){
				if(item.status==='request'
					&& item.created < moment().valueOf()-limit){
					return res.json(400,{
						error : {
							message : 'This call is expired',
							type : 'not found exception',
							code : 625
						}
					});
				}
				var data = {
					_id : item._id,
					caller : item.caller,
					callee : item.callee,
					type : item.type,
					rentalType : item.rentalType,
					dest : item.dest,
					dept : item.dept,
					latlng : item.latlng,					
					done : item.done,
					status : item.status,
					created : item.created,
					limit : (item.created + limit)
				};
				return res.json(data);
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
			Call.findOne({
				_id:call_id,
			}, callback);
		},
		// Call 정보 업데이트
		function(call, callback){
			var done = call.done;
			if(type === 'caller')
				done.caller = true;
			else if(type === 'callee')
				done.callee = true;
			var status = call.status;
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
			console.log('done');
			console.log(err);
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
			Call.findOneAndUpdate(
				{
					_id:call_id,
					status:'request',
					created:{
						$gt:moment().valueOf()-limit
					}
				},
				{
					$set:{
						status:'response',
						callee:user_id
					}
				},
				function(err,result){
					if(err) callback(err);
					if(result) callback(null, result);
					else callback({
						message : 'Not found the call',
						type : 'not found exception'
					});
				});
		},
		function(call, callback){
			User.findOneAndUpdate({_id:user_id},{
				$set : {call : call_id}
			}, function(err, result){
				if(err) callback(err);
				callback(null, call);
			});
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
			console.log('accept');
			console.log(err);
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
			console.log('delete');
			console.log(err);
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
				{$set : {call:call._id}}, function(err){
					if(err) callback(err);
					callback(null, call);
				});
		},
		// 전체에게 푸싱
		function(call, callback){
			push.pushToIdles({
					message: 'The call for TukTuk has been requested',
					title : 'CamTukTuk',
					call : call._id,
					latlng : call.dept.latlng,
					type : 'request'
				},
				function(err){
					if(err) callback(err);
					callback(null, call);
				});
		}
	],function(err, result){
		if(err){
			console.log('request');
			console.log(err);
			return res.json(400,{
				error : {
					message : err.message,
					type : err.type,
					code : 801
				}
			});
		}else{
			return res.json({
				request:true,
				call : {
					_id:result._id,
					created:result.created,
					limit : (result.created+limit)
				}
			});
		}
	});
});

module.exports = router;
