var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/', function(req, res){
	User.find(function(err, users){
		if(err) res.send(err);
		res.send(users);
	});
});

router.get('/:_id', function(req, res){
	var number = req.params._id;
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
	User.count({phone_no:req.body.phone_no}, function(err, count){
		if(err) res.send(err);
		else{
			if(count==0){
				var userModel = new User(req.body);
				userModel.save(function(err, userModel){
					if(err) res.send(err);
					else res.send(userModel);
				});
			}else{
				return res.send();
			}
		}
	});

});

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

router.delete('/:_id', function(req, res){
	var _id = req.params._id;
	User.remove({device_id:_id}, function(err){
		if(err) res.send(err);
		res.send();
	});
});

module.exports = router;
