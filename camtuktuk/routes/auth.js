var User = require('../models/user');
		
var ensureAuthorized = function(req, res, next){
	var token;
	var header = req.headers["authorization"];
	//console.log(header);
	if(typeof header !== 'undefined'){
		var headers = header.split(" ");

		token = headers[1];
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
	/*/
	//var params = req.query;
	if(params.token === undefined){
		return res.json(400,{
			error : {
				message : 'need auth token',
				type : 'token exception',
				code : 1000
			}
		});
	}else{
		//req.token = params.token;
		User.findOne({
			token : params.token
		}, function(err, user){
			if(err){
				return res.json(500, {
					message : err.message,
					type : 'query exception',
					code : 1001
				});
			}else{
				if(user){
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
	}
	/**/
}

module.exports = ensureAuthorized;
