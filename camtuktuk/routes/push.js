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
			push2user(data, users.caller, cb);
		},function(cb){
			push2user(data, users.callee, cb);
		}
	],callback);
};

// 특정 유저에게 푸시
var pushToOne = function(data, user_id, callback){
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

// 전체 TukTuk (except 진행중인 것들) 푸싱
var pushToIdles = function(data, callback){
	var TukTuk = require('../models/tuktuk');
	TukTuk.find({valid:true})
		.populate('user', 'device_id platform call')
		.exec(function(err, items){
			if(err) callback(err);
			// 각 디바이스별 묶음
			var android = item.filter(function(item){
				return !item.user.call && item.user.platform === 'Android';
			});
			var ios = item.filter(function(item){
				return !item.user.call && item.user.platform === 'iOS';
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
				function(cback){
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
			console.log('completed');
			callback(null, {
				success : true
			});
		});
		apnProd.on('transmitted' , function(n, d){
			console.log('transmitted');
		});
		apnProd.on('transmissionError', function(code, n, d){
			console.log('transmissionError');
			console.log(code);
		});
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

module.exports = {
	pushToBoth : pushToBoth,
	pushToIdles : pushToIdles,
	pushToOne : pushToOne
};