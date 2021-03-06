var express = require('express');
var router = express.Router();
var TukTuk = require('../models/tuktuk');

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

router.put('/:id', function(req, res){
	var id = req.params.id;
	var params = req.body;

	TukTuk.findOneAndUpdate({_id : id},
		{
			$set:{
				valid : params.valid
			}
		},function(err, result){
			if(err){
				return res.json(500, {
					error : {
						message : err.message,
						type : err.type
					}
				});
			}else{
				return res.json(result);
			}
		});
});

module.exports = router;
