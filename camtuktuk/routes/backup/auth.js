var getToken = function(headers){
	var header = headers['authorization'];
	if(typeof header !== 'undefined'){
		var h = header.split(' ');
		token = h[1];
		return token;
	}else{
		return null;
	}
}
var tokenAuth = function(req, res, next){
	var token = getToken(req.headers);
	
	if(token !== null){
		var User = require('../models/user');

		User.findOne({
				token : token
			},
			function(err, user){
				if(err){
					return res.json(500, {
						message : err.message,
						type : 'query exception',
						code : 1001
					});
				}else{
				if(user){
						req.user_id = user._id;
						next();
					}else{
						return res.json(400,{
							message : 'Token is invalid or expired',
							type : 'token exception',
							code : 1002
						});
					}
				}
			});
	}else{
		return res.json(400, {
			error : {
				message : 'Need Auth Token',
				type : 'token exception',
				code : 1000
			}
		});
	}
}
module.exports.tokenAuth = tokenAuth;
