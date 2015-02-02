var express = require('express');
var moment = require('moment');
var app = express();
var router = express.Router();
var jwt = require('jwt-simple');

var async = require('async');
var User = require('../models/user');
var TukTuk = require('../models/tuktuk');
var Error = require('../models/error');

var e = new Error({
	message : '',
	type : '',
	code : 0
});

var secret = 'photobypinetree';
var ensureAuthorized = require('../routes/auth');

// 100 : 디바이스 인증
router.post('/auth', function(req, res){
	var params = req.body;
	if(params.phone_no === undefined || params.device_id == undefined){
		e.error.message = 'Need more info to get auth';
		e.error.type = 'request exception';
		e.error.code = 101;
		return res.json(400, e);
	}
	User.findOne({
		phone_no : params.phone_no,
		device_id : params.device_id
	}, function(err, user){
		if(err){
			e.error = err;
			//e.error.type = 'query exception';
			e.error.code = 102;
			return res.json(400, e);
		}else{
			// 인증성공시 토큰 발행
			if(user){
				res.json({
					token : user.token,
					expired : user.expired
				});
			}else{
				e.error.message = 'Incorrect phone/device';
				e.error.type = 'not found exception';
				e.error.code = 103;
				return res.json(400, e);
			}
		}
	});
});

// 200 새로운 디바이스 등록
router.post('/join', function(req, res){
	var params = req.body;
	if(params.phone_no === undefined || params.device_id === undefined){
		e.error.message = 'Need more info to join';
		e.error.type = 'request exception';
		e.error.code = 201;
		return res.json(400, e);
	}
	async.waterfall([
		function(callback){
			User.findOne({
				phone_no : params.phone_no,
				device_id : params.device_id
				},
				function(err, user){
					if(err){
						e.error = err;
						//e.error.type = 'query exception';
						e.error.code = 202;
						return res.json(500, e);
					}else{
						if(user){
							e.error.message = 'User already exists';
							e.error.type = 'duplication exception';
							e.error.code = 204;
							return res.json(400, e);
						}else{
							callback();
						}
					}
				});
		},
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
					e.error = err;
					//e.error.type = 'query exception';
					e.error.code = 205;
					return res.json(500, e);
				}else{
					return res.json({
						token : user.token,
						expires : user.expires
					});
				}
			});
		}
	]);
});

// 300 사용자 정보 가져오기
router.get('/:_id', ensureAuthorized, function(req, res){
	var id = req.params._id;
	User.findOne({_id : id}, function(err, user){
		if(err){
			return res.json(400, {
				message : err.message,
				type : 'query exception',
				code : 301
			});
		}else{
			if(user){
				return res.json(user);
			}else{
				e.error.message = 'Invalid user';
				e.error.type = 'not found exception';
				e.error.code = 303;
				return res.json(400, e);
			}
		}
	});
});

/*/
router.get('/', function(req, res){
	var params = req.body;
	if(params.device_id === undefined
		|| params.phone_no === undefined){
		e.error.message = 'need device_id or phone_no to query information about the user';
		e.error.type = 'request exception';
		e.error.code = 203;
		return res.json(401, e);
	}
	User.findOne({
		phone_no : params.phone_no,
		device_id : params.device_id
		})
		.exec(function(err, item){
			if(err){
				e.error.message = err;
				e.error.type = 'query exception';
				e.error.code = 202;
				return res.json(500,e);
			}
			if(!item){
				e.error.code = 203;
				e.error.message = 'user has not found';
				e.error.type = 'not found exception';
				return res.json(404, e);
			}
			
			return res.json({
				userAuth : true
			});
		});
});

router.post('/', function(req, res){
	var user = req.body;
	if(user.phone_no === undefined 
		|| user.device_id === undefined 
		|| user.platform === undefined){
		e.error.message = 'need user information to insert new user';
		e.error.type = 'request exception';
		e.error.code = 211;
		return res.json(401, e);
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
				return res.json(500,e);
			}
			return res.json({
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
		return res.json(401,e);
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
				return res.json(500, e);
			}
			return res.json(result);
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
		return res.json(401, e);
	}
	User.findOneAndRemove({
			_id : id,
			device_id:user.device_id
		}, function(err, user){
		if(err){
			e.error.message = err;
			e.error.type = 'query exception';
			e.error.code = 232;
			return res.json(500, e);
		}
		if(user){
			return res.json({
				delete : true
			});
		}else{
			e.error.message = 'user has not found';
			e.error.type = 'not found exception';
			e.error.code = 233;
			return res.json({
				delete : false,
				error : e.error
			});
		}
	});
});
/**/
module.exports = router;
