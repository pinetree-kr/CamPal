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

// 100 : 디바이스 인증
router.post('/auth', function(req, res){
	var params = req.body;
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

router.post('/join', tokenAuth, function(req, res){
	var params = req.body;
	var user_id = req.user_id;
	var TukTuk = require('../models/tuktuk');
	TukTuk.findOne(
		{user:user_id},
		function(err, item){
			if(err){
				return res.json(500,{
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
/*/
// 200 새로운 드라이버 등록(facebook)
router.post('/join', tokenAuth, function(req, res){
	var params = req.body;
	if(params._id === undefined 
		|| params.access_token === undefined){
		return res.json(400, {
			error : {
				message : 'Need more info to join',
				type : 'request exception',
				code : 201
			}
		});
	}
	var https = require('https');

	var opts = {
		host : 'graph.facebook.com',
		method : 'GET',
		path : '/v2.2/me?access_token='+params.access_token+'&fields=id,name,email,gender'
	}

	async.waterfall([
		function(callback){
			https.get(opts, function(response){
				var res_data = '';
				response.on("data", function(data){
					res_data += data;
				});
				response.on('end', function(){
					var data = JSON.parse(res_data);
					if(data.error !== undefined){
						return res.json(400, {
							error :{
								message: data.error.message,
								type : data.error.type,
								code : 214
							}
						});
					}else{
						data.user = params._id;
						callback(null, data);
					}
				});
			}).on('error', function(err){
				return res.json(400,{
					error : {
						message : err.message,
						type : err.type,
						code : 212
					}
				});
			});
		}
	],
	// 서버에 저장한다
	function(err, results){
		var TukTuk = require('../models/tuktuk');

		TukTuk.findOne({id:results.id},function(err, object){
			if(!err){
				// update
				if(object){
					object.update({$set:results}, function(err, item){
						if(err){
							return res.json(500,{
								error : {
									message : err.message,
									type : err.type,
									code : 216
								}
							});
						}else{
							console.log('update');
							//console.log(item);
							return res.json(item);
						}
					})
				}
				// save
				else{
					var tuktuk = TukTuk(results);
					tuktuk.joined = moment().valueOf();
					tuktuk.save(function(err, item){
						if(!err){
							console.log('insert');
							//console.log(item);
							return res.json(item);
						}else{
							return res.json(500,{
								error : {
									message : err.message,
									type : err.type,
									code : 215
								}
							});
						}
					});
				}
			}else{
				return res.json(500,{
					error : {
						message : err.message,
						type : err.type,
						code : 217
					}
				});
			}
		});
	});
});
/**/

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
