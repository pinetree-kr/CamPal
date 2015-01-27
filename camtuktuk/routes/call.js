var express = require('express');
var router = express.Router();
var Call = require('../models/call');
var moment = require('moment');
var async = require('async');
var auth = require('./auth');

var tokenAuth = auth.tokenAuth;

function randomInt(low, high){
	return Math.floor(Math.random() * (high - low) + low);
}
function push2user(data, user_id, callback){
	var User = require('../models/user');
	User.findOne({_id:user_id}, function(err, user){
		if(err){
			return res.json(400,{
				error : {
					message : err.message,
					type : err.type,
					code :856
				}
			});
		}else{
			var users = [];
			users.push(user.device_id);
			if(user.platform === 'Android'){
				pushGCM(data, users, callback);
			}else if(user.platform === 'iOS'){
				pushAPN(data, users, callback);
			}
		}
	});
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
						return item.user.platform === 'iOS';
					});
					cb(err, items);
				});
		}
	], function(err, results){
		if(err){callback(err, null)}
		else{
			var gcmIds = [];
			var apnIds = [];
			
			for(var i=0; i<results[0].length; i++){
				gcmIds.push(results[0][i].user.device_id);
			}
			for(var i=0; i<results[1].length; i++){
				apnIds.push(results[1][i].user.device_id);
			}
			
			async.parallel([
				function(cback){
					pushGCM(
						data,
						gcmIds,
						cback
					);
				},
				function(cback){
					pushAPN(
						data,
						apnIds,
						cback
					);
				}
			], callback);
		}
	});
};
// IOS푸싱
function pushAPN(data, users, callback){
	var apn = require('apn');
	//var tokens = [];
	if(users.length>0){	
		var opts = {
			gateway : 'gateway.sandbox.push.apple.com',
			cert : '../cert/devcert.pem',
			key : '../cert/devkey.pem',
			//errorCallback: callback
		};
		
		var apnConnection = new apn.Connection(opts);
		apnConnection.on('socektError' , function(){
			callback({
				error : {
					message : 'socket error',
					type : 'socket exception',
					code : 868
				}
			});
		});
		apnConnection.on('transmitted' , function(n, d){
			callback(null, n);
		});
		apnConnection.on('timeout' , function(){
			callback({
				error : {
					message : 'timeout',
					type : 'timeout exception',
					code : 869
				}
			});
		});

		var note = new apn.Notification();
		note.badge = 1;
		note.alert = data.message;
		note.sound = 'dong.aiff'
		note.payload = data;
		for(var i=0; i<users.length; i++){
			apnConnection.pushNotification(note, users[i]);
		}

		
	}else{
		callback();
	}
}

//안드로이드 푸싱
function pushGCM(data, users, callback){
	var gcm = require('node-gcm');
	var sender = new gcm.Sender('AIzaSyBI9GCyGNWpNbxSGzzfgB9bz5dUM-qnLMc');
	var message = new gcm.Message({
		collapseKey : ''+randomInt(1,100),
		delayWhileIdle : false,
		timeToLive : 10,
		data : data,
	});
	sender.send(message, users, 3, function(err, result){
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
	var id = req.params.id;
	var data = req.query;
	var User = require('../models/user');
	User.findOne({device_id:id}, function(err, user){
		if(err){
			res.json(400,{
				error:{
					message : err.message,
					type : err.type,
					code : 899
				}
			});
		}else{
			var users = [];
			//console.log(user);
			users.push(user.device_id);
			if(user.platform==='Android'){
				pushGCM(data, users, function(err, result){
					if(err) res.send(err);
					res.send(result);
				});
			}else if(user.platform==='iOS'){
				pushAPN(data, users, function(err, result){
					if(err) res.send(err);
					res.send(result);
				});
			}
		}
	});	
});
/**/
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

router.get('/:call_id', tokenAuth,/**/ function(req, res){
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

router.put('/:call_id/accept', tokenAuth,/**/ function(req, res){
	var call_id = req.params.call_id;
	var user_id = req.user_id;
	if(user_id === undefined || user_id === null){
		return res.json(400, {
			error : {
				message : 'Invalid User to accept the Call',
				type : 'request exception',
				code : 711
			}
		});
	}
	Call.findOne({_id:call_id}, function(err, item){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 712
				}
			});
		}else{
			if(item){
				item.update({$set:{status:'response'}}, function(err,result){
					if(err){
						return res.json(500,{
							error : {
								message : err.message,
								type : err.type,
								code : 713
							}
						});
					}else{
						push2user({
							message : 'The call for TukTuk has been responsed',
							title : 'CamTukTuk',
							call : item._id
						}, item.caller, function(err, success){
							if(err){
								return res.json(400,{
									error : {
										message : err.message,
										type : err.type,
										code : 857
									}
								});
							}else{
								console.log(success);
								return res.json({
									accept : true
								});
							}
						});
					}
				});
			}else{
				return res.json(400, {
					error : {
						message : 'Invalid request',
						type : 'not found exception',
						code : 714
					}
				});
			}
		}
	});
});

router.delete('/:call_id', tokenAuth,/**/ function(req, res){
	var call_id = req.params.call_id;
	var user_id = req.user_id;
	if(user_id === undefined || user_id === null){
		return res.json(400, {
			error : {
				message : 'Invalid User to cancel the Request',
				type : 'request exception',
				code : 701
			}
		});
	}
	Call.findOne({_id:call_id,caller:user_id}, function(err, item){
		if(err){
			return res.json(500, {
				error : {
					message : err.message,
					type : err.type,
					code : 702
				}
			});
		}else{
			if(item){
				item.remove();
				return res.json({
					delete : true
				});
			}else{
				return res.json(400,{
					error : {
						message : 'Invalid user to cancel the request',
						type : err.type,
						code : 703
					}
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

module.exports = router;
