var Error = function(err){
	this.error = {
		message : '',
		type : '',
		code : 0 
	}
	if(err.message !== undefined)
		this.error.message = err.message;
	if(err.type !== undefined)
		this.error.type = err.type;
	if(err.code !== undefined)
		this.error.code = err.code;
}
/*/
Error.prototype = {

};
/**/
module.exports = Error;
/*/
module.exports = function(err){
	var message = {
		error : {
			message : '',
			type : '',
			code : ''
		}
	}
	
	if(err.message !== undefined){
		message.error.message = err.message;
	}
	if(err.type !== undefined){
		message.error.type = err.type;
	}

	return message;
}
/**/
