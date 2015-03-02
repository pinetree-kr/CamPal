/*
 * Socket 통신 for camtuktuk
 */

// 접속중인 tuktuk목록
var tuktuks = [];

var regTuktuk = function(socket){
	console.log('tuktuk connected : '+socket.id);
	tuktuks.push(socket);
	socket.join('tuktuk');
}
var unregTuktuk = function(socket){
	var i = tuktuks.indexOf(socket);
	if(i>=0){
		console.log('tuktuk disconnected : '+socket.id);
		tuktuks.slice(i, 1);
	}
	socket.leave('tuktuk');
}
var sendToTuktuks = function(io, type, call){
	/*/
	for(var i=0, length=tuktuks.length; i<length; i++){
		io.sockets(tuktuks[i]).emit('Socket:call', {
			type : type,
			call : call
		});
	}
	/**/
	console.log('Socket-'+type+':'+call);
	io.sockets.in('tuktuk').emit('Socket:call', {
		type : type,
		call : {
			_id : call
		}
	});
}

module.exports = function(io){
	/*/
	io.enable('browser client minification');
	io.enable('browser client etag');
	io.enable('browser client gzip');
	/**/
	io.on('connection', function(socket){
		//regTuktukSocket(socket);
		socket.on('disconnect', function(){
			unregTuktuk(socket);
		});
		socket.on('login', function(){
			regTuktuk(socket);
		});
		socket.on('request', function(call){
			sendToTuktuks(io, 'request', call);
		});
		socket.on('cancel', function(call){
			sendToTuktuks(io, 'cancel', call);
		});
		socket.on('response', function(call){
			sendToTuktuks(io, 'responsed', call);
		});
	});
};
