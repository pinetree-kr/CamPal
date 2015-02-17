var express = require('express');
var moment = require('moment');
var app = express();
var router = express.Router();

var async = require('async');
var User = require('../models/user');
var TukTuk = require('../models/tuktuk');

var auth = require('./auth');
var tokenAuth = auth.tokenAuth; 

router.post('/', tokenAuth, function(req, res){
	var params = req.body;
	var user_id = req.user_id;
	if(params.location){
		var latlng = {
			latitude : Number(params.location.latitude),
			longitude : Number(params.location.longitude)
		};
		updated = moment().valueOf();

		TukTuk.findOneAndUpdate({user:user_id},
			{$set:{latlng:latlng,updated:moment().valueOf()}},
			function(err, result){
				if(err){
					return res.json(400,{
						error:{
							message:err.message,
							type:err.type,
							code:610
						}
					});
				}else{
					return res.json({
						updated:true,
						latlng:latlng
					});
				}
			});
	}else{
		return res.json({
			updated : false
		});
	}
});

module.exports = router;
