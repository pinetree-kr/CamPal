var express = require('express');
var router = express.Router();
var Call = require('../models/call');
var User = require('../models/user');
var moment = require('moment');
var async = require('async');
var auth = require('./auth');
var push = require('./push');

var tokenAuth = auth.tokenAuth;
var limit = require('./config').limit;
//var limit = 5*60*1000;

/*
 * call 목록 조회
 * @params : token
 * @description
 */
router.get('/', tokenAuth, function(req, res){
	//var params = req.query;
	var user_id = req.user_id;
	//var user_id = "54dd8ab8f45110fa135e0fbd";
	async.parallel([
		function(callback){
			Call.find({
				status:'request',
				//TODO
				/**/
				created:{
					$gt:moment().valueOf()-limit
				}
				/**/
			})
			.populate('user','phone_no')
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
			var Distance = require('./distance');
			var datas = calls.filter(function(item){
				//TODO
				return true;
				var length = Distance.distance(tuktuk.latlng, item.dept.latlng);
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
	})
	.populate('user', 'phone_no')
	.populate('tuktuk', 'latlng user')
	.exec(function(err, item){
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
				/* TODO : 제거*/
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
				/**/
				var options = {
					path : 'tuktuk.user',
					select: 'phone_no',
					model : 'user'
				}
				Call.populate(item, options, function(err, result){
					var data = {
						_id : result._id,
						user : result.user,
						tuktuk : result.tuktuk,
						type : result.type,
						rentalType : result.rentalType,
						dest : result.dest,
						dept : result.dept,
						done : result.done,
						status : result.status,
						created : result.created,
						limit : (result.created + limit)
					};
					return res.json(data);
					});
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
 * @description : tuktuk와 user로부터 완료정보를 받는다
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
			done[type] = true;
			var status = call.status;
			if(done.user && done.tuktuk)
				status = 'done';
			Call.findOneAndUpdate({_id:call_id},{
				$set:{
					status : status,
					done : {
						user : done.user,
						tuktuk : done.tuktuk
					}
				}
			},callback);
		},
		// processing after 'done'
		function(call, callback){
			if(call.status === 'done'){
				User.find({call:call._id}, function(err, items){
					if(err){
						callback(err);
					}else{
						async.each(items, function(item, next){
							User.findOneAndUpdate(
								{_id:item._id},
								{$set:{call:null}},
								next);
						},function(err){
							if(err){
								callback(err);
							}else{
								push.pushToBoth({
										message : 'The call has done',
										title : 'CamTukTuk',
										type : call.status,
										call : {
											_id : call._id
										}	
									},{
										user : call.user,
										tuktuk : call.tuktuk
									},
									callback);
							}
						})
					}
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
 * @description : tuktuk로부터 수락받는다
 */
router.put('/:call_id/accept', tokenAuth, function(req, res){
	var call_id = req.params.call_id;
	var user_id = req.user_id;

	async.waterfall([
		// update
		function(callback){
			var Tuktuk = require('../models/tuktuk');
			Tuktuk.findOne({
				user : user_id,
				valid : true
			},function(err, item){
				if(err) callback(err);
				if(item){
					callback(null, item);
				}else{
					callback({
						message : 'Not found tuktuk',
						type : 'not found exception'
					});
				}
			});
		},
		function(tuktuk, callback){
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
						tuktuk:tuktuk._id
					}
				},
				function(err,result){
					if(err){
						callback(err);
					}else{
						if(result){
							callback(null, tuktuk, result);
						}
						else{
							callback({
								message : 'Not found the call',
								type : 'not found exception'
							});
						}
					}
				});
		},
		function(tuktuk, call, callback){
			// tuktuk기사
			User.findOneAndUpdate({_id:user_id},{
				$set : {call : call_id}
			}, function(err, result){
				if(err) callback(err);
				callback(null, tuktuk, call, result);
			});
		},
		// push
		function(tuktuk, call, user, callback){
			//console.log('call:'+call);
			async.parallel([
				function(cb){
					push.pushToOne({
						message : 'The call for TukTuk has been responsed',
						title : 'CamTukTuk',
						call : {
							_id : call._id,
							phone_no : user.phone_no,
							latlng : tuktuk.latlng
						},
						type : 'response'
					},
					call.user,
					false,
					cb);
				},
				function(cb){
					push.pushToIdles({
						title : 'CamTukTuk',
						call : {
							_id : call._id,
							//latlng : tuktuk.latlng
						},
						type : 'responsed'
					},cb);
				}
			],function(err, results){
				if(err){callback(err);}
				else{
					callback(null, true);
				}
			});
			
		}
	],function(err,result){
		if(err){
			console.log('response');
			console.log(err);
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 710
				}
			});
		}else{
			return res.json({response:true});
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
			User.findOneAndUpdate({_id:user_id, call : call_id},
				{$set : {call:null}}, function(err, item){
					if(err) callback(err);
					callback(null, item);
				});
		},
		function(user, callback){
			//Call.findOneAndRemove({_id:call_id,user:user._id}, callback);
			Call.findOneAndUpdate(
				{_id : call_id, user:user._id},
				{$set:{status:'cancel'}},
				function(err, result){
					if(err){callback(err);}
					else{
						callback(null, result);
					}
				});
		},
		function(call, callback){
			push.pushToIdles({
				message: 'The call for TukTuk has been requested',
				title : 'CamTukTuk',
				call : {
					_id : call._id,
					name : call.dest.name,
					latlng : call.dept.latlng,
					created : call.created,
					limit : (call.created + limit)
				},
				//latlng : call.dept.latlng,
				type : 'cancel'
			},
			function(err){
				if(err) callback(err);
				callback(null, call);
			});
		}
	],function(err, result){
		if(err){
			console.log('cancel');
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
				cancel : true
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
	if(!params.user || !params.type	|| !params.dept || !params.dest){
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
			User.findOneAndUpdate({_id:params.user},
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
					call : {
						_id : call._id,
						name : call.dest.name,
						latlng : call.dept.latlng,
						created : call.created,
						limit : (call.created + limit)
					},
					//latlng : call.dept.latlng,
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
