var express = require('express');
var router = express.Router();
var Call = require('../models/call');
var moment = require('moment');
var async = require('async');
var auth = require('./auth');
var push = require('./push');

var tokenAuth = auth.tokenAuth;

router.get('/', tokenAuth, function(req, res){
	var params = req.query;
	Call.find({status:'request'})
	.populate('caller','phone_no')
	.exec(function(err, items){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 611
				}
			});
		}else{
			return res.json(items);
		}
	});
});

router.get('/:call_id', tokenAuth, function(req, res){
	var _id = req.params.call_id;
	Call.findOne({
		_id : _id
	},function(err, item){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 612
				}
			});
		}else{
			if(item){
				return res.json(item);
			}else{
				return res.json(400,{
					error : {
						message : 'Request for Call has not found',
						type : 'not found exception',
						code : 613
					}
				});
			}
		}
	});
});

router.put('/:call_id/done/:type', tokenAuth, function(req, res){
	var call_id = req.params.call_id;
	var type = req.params.type;
	var user_id = req.user_id;
	if(type === 'caller'){
		Call.findOne({_id : call_id, caller : user_id}
			,function(err, item){
				if(err){
					return res.json(400,{
						error : {
							message : err.message,
							type : err.type,
							code : 818
						}
					});
				}else{
					var _done = item.done;
					_done.caller = true;
					var _status = item.status;
					if(_done.caller && _done.callee){
						_status = 'done';
					}
					Call.findOneAndUpdate({
						_id:call_id, caller:user_id
					},{
							$set:{
								status : _status,
								done : {
									caller : _done.caller,
									callee : _done.callee
								}
							}
						},function(e, result){
							if(e){
								return res.json(400,{
									error : {
										message : e.message,
										type : e.type,
										code : 818
									}
								});
							}else{
								if(result.status==='done'){
									push.pushToBoth({
											//call : item._id,
											type : 'done',
											foreground : "0",
											sound : '',
										},{
											caller : result.caller,
											callee : result.callee
										},
										function(err, results){
										});
								}
								return res.json({
									status : _status
								});
							}
						});
				}
			});
	}
	else if(type === 'callee'){
		Call.findOne({_id : call_id, callee : user_id}
			,function(err, item){
				if(err){
					return res.json(400,{
						error : {
							message : err.message,
							type : err.type,
							code : 819
						}
					});
				}else{
					var _done = item.done;
					_done.callee = true;
					var _status = item.status;
					if(_done.caller && _done.callee){
						_status = 'done';
					}
					Call.findOneAndUpdate({
						_id : call_id, callee:user_id
					},{
							$set:{
								status : _status,
								done : {
									caller : _done.caller,
									callee : _done.callee
								}
							}
						},function(e, result){
							//console.log('callee');
							//console.log(result);
								if(result.status==='done'){
									//console.log('done');
									push.pushToBoth({
											//call : item._id,
											type : 'done',
											foreground : "0",
											sound : '',
										},{
											caller : result.caller,
											callee : result.callee
										},
										function(err, results){
										});
								}
							if(e){
								return res.json(400,{
									error : {
										message : e.message,
										type : e.type,
										code : 819
									}
								});
							}else{
								return res.json({
									status : _status
								});
							}
						});
				}
			});
	}
});
router.put('/:call_id/accept', tokenAuth, function(req, res){
	var call_id = req.params.call_id;
	var user_id = req.user_id;
	if(user_id === undefined || user_id === null){
		return res.json(400, {
			error : {
				message : 'Invalid User to accept the Call',
				type : 'request exception',
				code : 711
			}
		});
	}
	Call.findOne({_id:call_id}, function(err, item){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 712
				}
			});
		}else{
			if(item){
				item.update({$set:{status:'response', callee:user_id}}, function(err,result){
					if(err){
						return res.json(500,{
							error : {
								message : err.message,
								type : err.type,
								code : 713
							}
						});
					}else{
						//console.log('accept to :'+item.caller);
						push.pushToOne({
							message : 'The call for TukTuk has been responsed',
							title : 'CamTukTuk',
							call : item._id,
							type : 'accept'
						},
						// to caller
						item.caller,
						function(err, success){
							if(err){
								return res.json(400,{
									error : {
										message : err.message,
										type : err.type,
										code : 857
									}
								});
							}else{
								//console.log(success);
								return res.json({
									accept : true
								});
							}
						});
					}
				});
			}else{
				return res.json(400, {
					error : {
						message : 'Invalid request',
						type : 'not found exception',
						code : 714
					}
				});
			}
		}
	});
});

router.delete('/:call_id', tokenAuth,/**/ function(req, res){
	var call_id = req.params.call_id;
	var user_id = req.user_id;
	if(user_id === undefined || user_id === null){
		return res.json(400, {
			error : {
				message : 'Invalid User to cancel the Request',
				type : 'request exception',
				code : 701
			}
		});
	}
	Call.findOne({_id:call_id,caller:user_id}, function(err, item){
		if(err){
			return res.json(500, {
				error : {
					message : err.message,
					type : err.type,
					code : 702
				}
			});
		}else{
			if(item){
				item.remove();
				return res.json({
					delete : true
				});
			}else{
				return res.json(400,{
					error : {
						message : 'Invalid user to cancel the request',
						type : err.type,
						code : 703
					}
				});
			}
		}
	});
});
router.post('/request', tokenAuth, function(req, res){
	var params = req.body;
	if(params.caller === undefined 
		|| params.type === undefined
		|| params.dept === undefined 
		|| params.dest === undefined){
		return res.json(400,{
			error : {
				message : 'Need more Information to request Call',
				type : 'request exception',
				code : 601
			}
		});
	}else if(params.type !== undefined && params.type === 'long' && params.rentalType === undefined){
		return res.json(400,{
			error : {
				message : 'Need more Information to request Call',
				type : 'request exception',
				code : 601
			}
		});
	}
	var User = require('../models/user');
	
	User.findOne({_id:params.caller}, function(err, user){
		if(err){
			return res.json(500,{
				error : {
					message : err.message,
					type : err.type,
					code : 602
				}
			});
		}else{
			if(user){
				var call = new Call(params);
				call.status = 'request';
				call.created = moment().valueOf();
				call.save(function(err, item){
					if(err){
						return res.json(500,{
							error : {
								message : err.message,
								type : err.type,
								code : 604
							}
						});
					}else{
						push.pushToIdles({
								message: 'The call for TukTuk has been requested',
								title : 'CamTukTuk',
								call : item._id,
								type : 'request'
							},
							function(err, result){
							if(err){
								res.json(400,{
									error : {
										message : err.message,
										type : err.type,
										code : 801
									}
								});
							}else{
								return res.json(item);
							}
						});
					}
				});
			}else{
				return res.json(400,{
					error : {
						message : 'Caller is not found',
						type : 'not found exception',
						code : 603
					}
				});
			}
		}
	})
});

module.exports = router;
