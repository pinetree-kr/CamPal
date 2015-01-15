var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var argv = require('optimist').argv;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cors());
app.use('/api', require('./routes/api'));


process.on('uncaughtException', function(err){
	console.log('CaughtException:'+err);
});

var server = app.listen(8180, function(){
	
	var uri = 'mongodb://'+argv.db_ip+':27017/camtuktuk';
	var opts ={
		/**/
		user: argv.id,
		pass: argv.pw
	}
	mongoose.connect(uri, opts);
	console.log('listening on port %d', server.address().port);
	
});
