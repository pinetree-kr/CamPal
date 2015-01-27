var express = require('express');
var router = express.Router();
var TukTuk = require('../models/tuktuk');
var Error = require('../models/error');
var e = new Error({
	message : '',
	type : '',
	code : 0
});

router.get('/', function(req, res){
	TukTuk.find().populate('user', 'phone_no').exec(function(err, users){
		if(err) res.json(404,{
			error : {
				message : err.message,
				type : err.type
			}
		});
		return res.json(users);
	});
});

router.get('/:id', function(req, res){
	var id = req.params.id;
	TukTuk.findOne({_id : id}, function(err, user){
		if(err){
			return res.json(404,{
				error:{
					message : err.message,
					type : err.type
				}
			});
		}
		else{
			return res.json(user);
		}
	});
});

router.post('/', function(req, res){
	var user = req.body;
	
	if(user.email === undefined || user.email === null
		|| user.id === undefined || user.id === null
		|| user.userid === undefined || user.userid === null){
		e.error.message = 'need userid, id, email to insert new tuktuk';
		e.error.type = 'request exception';
		e.error.code = 321;
		return res.json(401, e);
	}
	user.joined = new Date();
	
	TukTuk.findOneAndUpdate(
		{
			user : user.userid,
			id : user.id,
			email : user.email
		},
		user,
		{upsert:true},
		function(err, result){
			if(err){
				e.error.message = err;
				e.error.type = 'query exception';
				e.error.code = 322;
				return res.json(500, e);
			}
			return res.json(result);
		});
});

router.put('/:_id', function(req, res){
	//var email = req.params._email;
	var id = req.params._id;
	var user = req.body;

	if(id === undefined || id === null
		|| user.email === undefined || user.email === null){
		e.error.message = 'need id, email to update the user';
		e.error.type = 'request exceptions';
		e.error.code = 331;
		return res.json(401, e);
	}

	TukTuk.findOneAndUpdate(
		{id : id , email : user.email},
		{$set:user},
		function(err, result){
			if(err){
				e.error.message = err;
				e.error.type = 'query exceptions';
				e.error.code = 332;
				return res.json(500, e);
			}
			return res.json(result);
		});
});
/*/
router.delete('/:_email', function(req, res){
	var email = req.params._email;
	TukTuk.remove({email:email}, function(err){
		if(err) res.send(err);
		res.send();
	});
});
/**/
module.exports = router;
