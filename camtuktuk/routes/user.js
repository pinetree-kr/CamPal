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
	var newUser = User(req.body);
	if(newUser.phone_no === undefined || newUser.phone_no === ''){
		res.status(500).send('not allowed');
	}
	if(newUser.device_id === undefined || newUser.device_id === ''){
		res.status(500).send('not allowed');
	}
	if(newUser.platform === undefined || newUser.platform === ''){
		res.status(500).send('not allowed');
	}
	var upsert = newUser.toObject();
	delete upsert._id;
	User.findOneAndUpdate(
		{phone_no : newUser.phone_no},
		upsert,
		{upsert:true},
		function(err, result){
			if(err) res.status(500).send(err);
			console.log(result);
			res.send(result);
		});
});
router.put('/:_deviceId', function(req, res){
	var deviceId = req.params._deviceId;
	var user = new User(req.body);
	if(deviceId === undefined || deviceId === ''){
		res.status(500).send('not allowed');
	}
	var update = user.toObject();
	delete update._id;
	delete update.joined;
	User.findOneAndUpdate(
		{device_id : deviceId},
		update,
		{upsert:true},
		function(err, result){
			if(err) res.status(500).send(err);
			res.send(result);
		});
});
/*/
router.put('/', function(req, res){
	User.update(
			{
				device_id : req.body.device_id
				//phone_no : req.body.phone_no
			},{
				$set:{
					//device_id : ObjectId(req.body.device_id)
					phone_no : req.body.phone_no
				}
			},function(err){
				if(err) res.send(err);
				res.send();
			});
});
/**/
router.delete('/:_id', function(req, res){
	var _id = req.params._id;
	User.remove({device_id:_id}, function(err){
		if(err) res.send(err);
		res.send();
	});
});

module.exports = router;
