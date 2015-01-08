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

app.use(express.static(path.join(__dirname, './www')));
app.get('/', function(req, res){
	res.sendfile('index.html');
});
app.use('/api', require('./routes/api'));

process.on('uncaughtException', function(err){
	console.log('CaughtException:'+err);
});

var server = app.listen(8080, function(){
	
	var uri = 'mongodb://'+argv.db_ip+':27017/cambus';
	//var uri = 'mongodb://ds029831.mongolab.com:29831/cambus';
	var opts ={
		/**/
		user: argv.id,
		pass: argv.pw
		/*/
		//readonly user
		user:'cambus',
		pass:'cambusdev'
		/**/
	}
	mongoose.connect(uri, opts);
	
	console.log('listening on port %d', server.address().port);
});
