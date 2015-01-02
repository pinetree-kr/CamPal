var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.static(path.join(__dirname, './www')));
app.get('/', function(req, res){
	res.sendfile('index.html');
});
app.use('/api', require('./routes/api'));


var server = app.listen(8080, function(){
	var uri = 'mongodb://ds029831.mongolab.com:29831/cambus';
	var opts ={
		/**/
		user:'campal',
		pass:'jhsong85'
		/*/
		//readonly user
		user:'cambus',
		pass:'cambusdev'
		/**/
	}
	mongoose.connect(uri, opts);
	console.log('listening on port %d', server.address().port);
});
