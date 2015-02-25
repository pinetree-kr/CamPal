var express = require('express');
var router = express.Router();

var randomInt = function(low, high){
	return Math.floor(Math.random() * (high - low) + low);
}

// 완료에 대한 푸시
var pushToBoth = function(data, users, callback){
	var async = require('async');
	async.parallel([
		function(cb){
			pushToOne(data, users.user, false, cb);
		},function(cb){
			pushToOne(data, users.tuktuk, true, cb);
		}
	],callback);
};

// 특정 유저에게 푸시
var pushToOne = function(data, user_id, istuktuk, callback){
	var push = function(item){
		var users = [];
		users.push(item.device_id);
		if(item.platform === 'Android'){
			pushGCM(data, users, callback);
		}else if(item.platform === 'iOS'){
			pushAPN(data, users, callback);
		}
	}
	var error = function(err){
		return res.json(400,{
			error : {
				message : err.message,
				type : err.type,
				code :856
			}
		});
	}
	if(istuktuk){
		var Tuktuk = require('../models/tuktuk');
		Tuktuk.findOne({_id:user_id})
			.populate('user', 'device_id platform')
			.exec(function(err, tuktuk){
				if(err){
					error(err);
				}else{
					if(tuktuk){
						push(tuktuk.user);
					}
				}
			});
	}else{
		var User = require('../models/user');	
		User.findOne({_id:user_id}, function(err, user){
			if(err){
				error(err);
			}else{
				if(user){
					push(user);
				}
			}
		});
	}
}

// 전체 TukTuk (except 진행중인 것들) 푸싱
var pushToIdles = function(data, callback){
	var TukTuk = require('../models/tuktuk');
	TukTuk.find({valid:true})
		.populate('user', 'device_id platform call')
		.exec(function(err, items){
			if(err) callback(err);
			
			var validItems;
			if(data.type === 'request'){
				var Distance = require('./distance');
				validItems = items.filter(function(item){
					var length  = Distance.distance(data.call.latlng, item.latlng);
					if(item.user && !item.user.call && length<=0.8){
						return true;
					}else{
						return false;
					}
				});
			}else{
				validItems = items.filter(function(item){
					if(item.user && !item.user.call){
						return true;
					}else{
						return false;
					}
				});
			}
			// 각 디바이스별 묶음
			var android = validItems.filter(function(item){
				return item.user.platform === 'Android';
			});
			var ios = validItems.filter(function(item){
				return item.user.platform === 'iOS';
			})
			var gcmIds = [];
			var apnIds = [];
			for(var i=0; i<android.length; i++){
				gcmIds.push(android[i].user.device_id);
			}
			for(var i=0; i<ios.length; i++){
				apnIds.push(ios[i].user.device_id);
			}
			var async = require('async');
			async.parallel([
				function(cb){
					pushGCM(
						data,
						gcmIds,
						cb
					);
				},
				function(cb){
					pushAPN(
						data,
						apnIds,
						cb
					);
				}
			], callback);
		});
};

// IOS푸싱
var pushAPN = function(data, users, callback){
	var apn = require('apn');
	if(users.length>0){
		var optsProd = {
			gateway : 'gateway.push.apple.com',
			cert : '../cert/prodcert.pem',
			key : '../cert/prodkey.pem',
			//errorCallback: callback
		};
		var optsDev = {
			geteway : 'gateway.sandbox.push.apple.com',
			cert : '../cert/devcert.pem',
			key : '../cert/devkey.pem',
		}
		var apnProd = new apn.Connection(optsProd);
		var apnDev = new apn.Connection(optsDev);

		var note = new apn.Notification();
		//note.badge = 1;
		note.alert = data.message;
		note.sound = 'dong.aiff'
		note.payload = data;
		/*/
		var feedOpts = {
			batchFeedback : true,
			interval : 300
		}
		var feedback = new apn.Feedback(feedOpts);
		feedback.on("feedback", function(devices){
			console.log('feedback:'+devices);
		});
		/**/
		//apnConnection.pushNotification(note, users);
		/**/
		apnProd.on('socketError' , function(){
			console.log('socketError');
			callback({
				error : {
					message : 'socket error',
					type : 'socket exception',
					code : 868
				}
			});
		});
		apnProd.on('error', function(err){
			console.log('error'+err);
		});
		apnProd.on('completed', function(){
			//console.log('completed');
			callback(null, {
				success : true
			});
		});
		apnProd.on('transmitted' , function(n, d){
			//console.log('transmitted');
		});
		/*/
		apnProd.on('transmissionError', function(code, n, d){
			console.log('transmissionError');
			console.log(code);
		});
		/**/
		apnProd.on('timeout' , function(){
			console.log('timeout');
			callback({
				error : {
					message : 'timeout',
					type : 'timeout exception',
					code : 869
				}
			});
		});
		var device;
		for(var i=0; i<users.length; i++){
			device = new apn.Device(users[i]);
			apnProd.pushNotification(note, device);
			apnDev.pushNotification(note, device);
		}
	}else{
		callback(null);
	}
}

//안드로이드 푸싱
var pushGCM = function(data, users, callback){
	if(users.length>0){
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
	}else{
		callback(null);
	}
}

module.exports = {
	pushToBoth : pushToBoth,
	pushToIdles : pushToIdles,
	pushToOne : pushToOne
};
