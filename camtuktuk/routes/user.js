var express = require('express');
var moment = require('moment');
var app = express();
var router = express.Router();


var async = require('async');
var User = require('../models/user');
var TukTuk = require('../models/tuktuk');
var secret = 'photobypinetree';
var auth = require('./auth');

var tokenAuth = auth.tokenAuth; 


router.get('/test/:id', function(req, res){
	var id = req.params.id;
	User.findOne({_id:id},function(err,item){
		if(err){
			return res.json(400,{
				error:{
					message:err.message,
					type:err.type,
					code:800
				}
			});
		}else{
			return res.json(item);
		}
	})
});

// 인증 및 토큰 발행
router.post('/auth', function(req, res){
	var params = req.body;
	var jwt = require('jwt-simple');

	if(params.phone_no == undefined || params.device_id === undefined){
		return res.json(400,{
			error : {
				message : 'Need Phone # and Device ID to get auth',
				type : 'request exception',
				code : 101
			}
		});
	}
	async.waterfall([
		// 번호 사용자 여부 확인
		function(callback){
			User.findOne({
					phone_no : params.phone_no,
					//device_id : params.device_id
				},
				function(err, user){
					if(err){
						return res.json(400, {
							error : {
								message : err.message,
								type : err.type,
								code : 102
							}
						});
					}else{
						// 사용자 존재시 device_id 비교
						if(user){
							// 같은 사용자면 token만 반환
							if(user.device_id === params.device_id){
								return res.json({
									_id : user._id,
									token : user.token,
									expires : user.expires
								});
							}
							// 다른 사용자면 업데이트 후 token 반환
							else{
								user.update(
									{
										$set:{
											device_id : params.device_id,
											platform:params.platform
										}
									},
									function(result){
										return res.json({
											_id : user._id,
											token : user.token,
											expires : user.expires
										});
									});
							}
						}else{
							//신규 추가
							callback();
						}
					}
				});
		},
		// 기존 사용자 제거
		function(callback){
			User.remove({device_id:params.device_id},function(err, user){
				if(err){
					return res.json(500,{
						error : {
							message : err.message,
							type : err.type,
							code : 205
						}
					});
				}
				callback();
			})
		},
		// 신규 추가
		function(callback){
			var userModel = new User();
			userModel.device_id = params.device_id;
			userModel.phone_no = params.phone_no;
			if(params.platform !== undefined){
				userModel.platform = params.platform;
			}
			var expires = moment().add(7,'days').valueOf();
			userModel.expires = expires;
			userModel.token = jwt.encode(userModel, secret, 'HS256');
			userModel.joined = moment().valueOf();
			userModel.save(function(err, user){
				if(err){
					return res.json(500, {
						error : {
							message : err.message,
							type : err.type,
							code : 205
						}
					});
				}else{
					return res.json({
						_id : user._id,
						token : user.token,
						expires : user.expires
					});
				}
			});
		}
	]);
});

// 툭툭 가입
router.post('/join', tokenAuth, function(req, res){
	var params = req.body;
	var user_id = req.user_id;

	var TukTuk = require('../models/tuktuk');

	TukTuk.findOne(
		{user:user_id},
		function(err, item){
			if(err){
				return res.json(400,{
					error : {
						message : err.message,
						type : err.type,
						code : 216
					}
				});
			}else{
				if(!item){
					var tuktuk = new TukTuk({
						name : params.name,
						user : user_id,
						joined : moment().valueOf()
					});
					tuktuk.save(function(err, result){
						if(err){
							return res.json(500,{
								error : {
									message : err.message,
									type : err.type,
									code : 217
								}
							});
						}else{
							return res.json(result);
						}
					});
				}else{
					return res.json(item);
				}
			}
		});
});

// 정보 수정(업데이트)
router.put('/:id', tokenAuth, function(req, res){
	var id = req.params.id;
	var params = req.body;

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
});

// 사용자 정보 가져오기
router.get('/:id', tokenAuth, function(req, res){
	var id = req.params.id;

	User
		.findOne({_id:id})
		.populate('tuktuk', 'name latlng call valid')
		.exec(function(err, item){
			if(err){
				return res.json(500, {
						error : {
							message : err.message,
							type : err.type,
							code : 301
						}
					});
			}else{
				if(item){
					return res.json(item);
				}else{
					return res.json(404, {
						error : {
							message : 'Not found user',
							type : 'not found exception',
							code : 302
						}
					});
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
