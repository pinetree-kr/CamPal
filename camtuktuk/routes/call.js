var express = require('express');
var router = express.Router();
var Call = require('../models/call');
var moment = require('moment');
var async = require('async');
var tokenAuth = require('./auth');


function randomInt(low, high){
	return Math.floor(Math.random() * (high - low) + low);
}

function push2tuktuk(data, callback){
	var TukTuk = require('../models/tuktuk');
	async.parallel([
		function(cb){
			TukTuk.find({valid:true})
				.populate(
					'user',
					'device_id platform'
				)
				.exec(function(err, items){
					items = items.filter(function(item){
						return item.user.platform === 'Android';
					});
					cb(err, items);
				});
		},
		function(cb){
			TukTuk.find({valid:true})
				.populate({
					path : 'user',
					select : 'device_id platform'
				})
				.exec(function(err, items){
					items = items.filter(function(item){
						return item.user.platform !== 'Android';
					});
					cb(err, items);
				});
		}
	], function(err, results){
		if(err){callback(err, null)}
		else{
			pushGCM(
				data,
				results[0],
				callback
			);
		}
	});
};

function pushGCM(data, users, callback){
	var regIds = [];
	for(var i=0; i<users.length; i++){
		regIds.push(users[i].user.device_id);
	};
	var gcm = require('node-gcm');
	var sender = new gcm.Sender('AIzaSyBI9GCyGNWpNbxSGzzfgB9bz5dUM-qnLMc');
	//var sender = new gcm.Sender('737566265150');
	var message = new gcm.Message({
		collapseKey : ''+randomInt(1,100),
		delayWhileIdle : false,
		timeToLive : 10,
		data : data,
		//event:'message'
	});
	//console.log(regIds);
	sender.send(message, regIds, 3, function(err, result){
		if(err){
			callback({
				message: err,
				type : 'GCM exception'
			}, null);
		}else{
			callback(err, result);
		}
	});
}
/**/
router.get('/test/:id', function(req, res){
	var data = [{
		user : {
			device_id : req.params.id
		}
	}];
	pushGCM(req.query,data,function(err, result){
		if(err) res.send(err);
		res.send(result);
	});
});
router.get('/test', function(req, res){
	var data = req.query;
	push2tuktuk({
		message: data.message,
		title : data.title
	},
	function(err, result){
		if(err){
			res.json(400,{
				error : {
					message : err.message,
					type : err.type,
					code : 801
				}
			});
		}else{
			return res.json(result);
		}
	});
});
/**/
/**/
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
/**/
router.get('/:_type', tokenAuth, function(req, res){
	var type = req.params._type;
	var params = req.query;
	var opts = {
		status : {
			$ne : 'done'
		}
	};
	//신청자
	if(type === 'caller')
		opts.caller = params.user;
	//응답자
	else if(type === 'callee')
		opts.callee = params.user;
	Call.findOne(
		opts,
		function(err, item){
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
					return res.json({
						call : true,
						data : item
					});
				}else{
					return res.json({
						call : false
					});
				}
			}
		});
});

router.post('/request', tokenAuth, function(req, res){
	var params = req.body;
	if(params.caller === undefined 
		|| params.type === undefined
		|| params.dept === undefined 
		|| params.dest === undefined){
		return res.json(400,{
			error : {
				message : 'Need more Information to request Call',
				type : 'request exception',
				code : 601
			}
		});
	}else if(params.type !== undefined && params.type === 'long' && params.rentalType === undefined){
		return res.json(400,{
			error : {
				message : 'Need more Information to request Call',
				type : 'request exception',
				code : 601
			}
		});
	}
	var User = require('../models/user');
	
	User.findOne({_id:params.caller}, function(err, user){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 602
				}
			});
		}else{
			if(user){
				var call = new Call(params);
				call.status = 'request';
				call.created = moment().valueOf();
				call.save(function(err, item){
					if(err){
						return res.json(500,{
							error : {
								message : err.message,
								type : err.type,
								code : 604
							}
						});
					}else{
						push2tuktuk({
								message: 'The call for TukTuk has been requested',
								title : 'CamTukTuk',
								call : item._id
							},
							function(err, result){
							if(err){
								res.json(400,{
									error : {
										message : err.message,
										type : err.type,
										code : 801
									}
								});
							}else{
								return res.json(item);
							}
						});
					}
				});
			}else{
				return res.json(400,{
					error : {
						message : 'Caller is not found',
						type : 'not found exception',
						code : 603
					}
				});
			}
		}
	})
});
/*/
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
