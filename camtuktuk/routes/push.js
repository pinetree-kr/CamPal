var express = require('express');
var router = express.Router();
var gcm = require('node-gcm');
var sender = new gcm.Sender('AIzaSyBI9GCyGNWpNbxSGzzfgB9bz5dUM-qnLMc');
var User = require('../models/user');

function randomInt(low, high){
	return Math.floor(Math.random() * (high - low) + low);
}

router.get('/', function(req, res){
	res.send('this is gcm module');	
});
router.post('/', function(req, res){
	console.log(req.body);
	var message = new gcm.Message({
		// for prevent collapse
		collapseKey:''+randomInt(1,100),
		//collapseKey : 'tuktuk_call',
		// when device is screenon, true:off, false:on
		delayWhileIdle:true,
		timeToLive:60*60*24,//하루
		data:{
			'message' : req.body.message,
			'msgcnt' : 2,
			'title' : 'tuktuk message'
		}
	});

	User.find({}, function(err, users){
		if(!err){
			var regIds = [];
			users.forEach(function(item){
				regIds.push(item.device_id);
			});
			//message, targets, retransmit counts, callback
			sender.send(message, regIds, 4, function(err, result){
				if(!err){
					//console.log(result);
					res.send('success');
				}
			});
		}
	});

});

module.exports = router;
