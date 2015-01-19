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
	TukTuk.find(function(err, users){
		if(err) res.send(err);
		return res.send(users);
	});
});

router.get('/:_userid', function(req, res){
	var userid = req.params._userid;
	//var email = req.params._email;
	var params = req.query;
	if(userid === undefined
		|| params.email === undefined
		|| params.id === undefined){
		e.error.message = 'need userid, id, email to query information about the tuktuk';
		e.error.type = 'request exception';
		e.code = 311;
		return res.json(401, e);
	}
	TukTuk.findOne({
			user : userid,
			email:params.email,
			id : params.id
		}, function(err, user){
		if(err){
			e.error.message = err;
			e.error.type = 'query exception';
			e.error.code = 312;
			return res.json(500, e);
		}
		if(user){
			return res.json(user);
		}else{
			e.error.message = 'not found';
			e.error.type = 'not found exception';
			e.error.code = 313;
			return res.json(404, e);
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
