var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.static(path.join(__dirname, '../public')));
app.get('/', function(req, res){
	res.sendfile('index.html');
});
/*/
app.get('/', function(req, res){
	res.send('hello world');
});
/**/
app.use('/memo', require('./routes/memo'));
app.use('/user', require('./routes/user'));
app.use('/push', require('./routes/push'));

var server = app.listen(8080, function(){
	//var dbUri = 'mongodb://localhost:27017/cambus';
	//var dbUri = 'mongodb://14.45.153.116:27017/cambus'; //rasp-pi
	var uri = 'mongodb://10.240.112.154:27017/campal';
	var opts ={
		user:'campalAdmin',
		pass:'campaldev'
	}
	mongoose.connect(uri, opts);
	console.log('listening on port %d', server.address().port);
});
