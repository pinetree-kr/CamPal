var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/', function(req, res){
	User.find(function(err, users){
		if(err) res.send(err);
		res.send(users);
	});
});

router.get('/:_number', function(req, res){
	var number = req.params._number;
	User.findOne({phone_no:number}, function(err, user){
		if(err) res.status(500).send(err);
		if(user){
			res.send(user);
		}else{
			res.status(404).send('Not Found');
		}
	});
});

router.post('/', function(req, res){
	var user = req.body;
	
	if(user.phone_no === undefined 
		|| user.device_id === undefined 
		|| user.platform === undefined){
		res.status(500).send('not allowed');
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
			if(err) res.status(500).send(err);
			//console.log(result);
			res.send(result);
		});
});

router.put('/:_deviceId', function(req, res){
	var deviceId = req.params._deviceId;
	if(deviceId === undefined){
		res.status(500).send('not allowed');
	}
	var user = req.body;
	var data = {};
	if(user.phone_no !== undefined){
		data.phone_no = user.phone_no;
	}
	if(user.platform !== undefined){
		data.platform = user.platform;
	}
	if(user.facebook !== undefined){
		data.facebook = user.facebook;
	}
	if(user.tuktuk !== undefined){
		data.tuktuk = user.tuktuk;
	}
	
	User.findOneAndUpdate(
		{device_id : deviceId},
		{$set:data},
		function(err, result){
			if(err) res.status(500).send(err);
			res.send(result);
		});
});

router.delete('/:_id', function(req, res){
	var _id = req.params._id;
	User.remove({device_id:_id}, function(err){
		if(err) res.send(err);
		res.send();
	});
});

module.exports = router;
