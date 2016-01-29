'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var https = require('https');

var app = express();

require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);
const ClientID = process.env.CLIENT_ID;

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.get('/search/:str', function(req, res) {
  let str=req.params.str;
  let mods=str.split("?");
 
  let headers = { Authorization: "Client-ID "+ClientID };

  var options = {
    host: 'api.imgur.com',
    path: '/3/gallery/search?q_all='+mods[0].replace(" ","%20"),
    method: 'GET',
    headers: headers
  };

  let request =   https.request(options, function(imageRes) {
    var responseString = '';
    console.log('statusCode: ', imageRes.statusCode);
    console.log('headers: ', imageRes.headers);

    imageRes.on('data', function(data) {
      responseString += data;
    });

    imageRes.on('end', function() {
      let responseObject = JSON.parse(responseString);
      console.log(responseObject);
      res.end(JSON.stringify(responseObject));
    });
  });
  var retval="";
  request.write(retval);
  request.end();
  console.log("clearing func"+retval);
});

app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});
