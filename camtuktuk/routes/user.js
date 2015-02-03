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

/*
 * 인증 및 토큰 발행
 * @params : phone_no, device_id, platform
 * @description : 기존정보가 있으면 device_id, platform 업데이트, 그렇지 않으면 신규 가입
 */
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
		// phone_no 가입 여부 확인 및 업데이트
		function(callback){
			User.findOneAndUpdate({phone_no:params.phone_no},{
				$set:{
					device_id : params.device_id,
					platform:params.platform
				}
			},callback);
		},
		function(user, callback){
			// 기존 유저
			if(user){
				callback(null, user);
			}
			// 신규
			else{
				// device_id 존재 여부 확인 후 제거
				async.waterfall([
					function(next){
						User.findOneAndRemove({device_id:params.device_id},next);
					},
					// 추가
					function(next){
						var expires = moment().add(7,'days').valueOf();
						var user = new User({
							device_id : params.device_id,
							phone_no : params.phone_no,
							platform : params.platform,
							expires : expires,
							joined : moment().valueOf()
						});
						user.token = jwt.encode(user, secret, 'HS256');
						userModel.save(next);
					}
				],callback);
			}
		},
	],function(err,result){
		if(err){
			return res.json(400,{
				error : {
					message :err.message,
					type : err.type,
					code : 110
				}
			})
		}else{
			return res.json({
				_id : result._id,
				token : result.token,
				expires : result.expires
			});
		}
	});
});

/*
 * 툭툭 가입
 * @params : user_id, name
 * @description : 기존정보가 있으면 user와 매칭, 그렇지 않으면 신규 가입 후 user와 매칭
 */
router.post('/:id/join', tokenAuth, function(req, res){
	var user_id = req.params.id;
	var params = req.body;

	async.waterfall([
		//기존TukTuk 확인, 없으면 신규
		function(callback){
			TukTuk.findOne({user:user_id}, function(err, item){
				if(err) callback(err);
				// callback
				if(item){
					callback(null, item);
				}
				// new
				else{
					var tuktuk = new TukTuk({
						name : params.name,
						user : user_id,
						joined : moment().valueOf()
					});
					tuktuk.save(callback);
				}
			});
		},
		//User 매칭(user.tuktuk에 tuktuk._id삽입)
		function(tuktuk, callback){
			console.log(tuktuk);
			User.findOneAndUpdate(
				{_id:user_id},
				{$set : {tuktuk:tuktuk._id}},
				callback);
		}
	],function(err, result){
		if(err){
			return res.json(400,{
				error : {
					message : err.message,
					type : err.type,
					code : 210
				}
			});
		}else{
			console.log(result);
			return res.json(result);
		}
	});
});

/*
 * 유저정보 수정(device_id가 매칭되지 않아 수정할때)
 * @params : phone_no, device_id, platform
 * @description : //
 */
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

/*
 * 사용자 정보 가져오기(로그인을 위함)
 * @params : user_id, token
 * @description : //
 */
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

router.delete('/:id', tokenAuth, function(req, res){
	var id = req.params.id;
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
