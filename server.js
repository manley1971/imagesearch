'use strict';

var express = require('express');
var mongoose = require('mongoose');
var session = require('express-session');
var https = require('https');

var app = express();

require('dotenv').load();

mongoose.connect(process.env.MONGO_URI);
const ClientID = process.env.CLIENT_ID;

var SearchSchema = new mongoose.Schema({
    terms: String,
    time: String,
});
let sModel = mongoose.model('SearchList', SearchSchema);

app.use('/', express.static(process.cwd() + '/public'));

app.get('/imagesearch/latest', function(req, res) {
    let retval = "error";
    let q = sModel.find({}, {
        _id: 0,
        __v: 0
    });
    q.exec(function(err, data) {
        if (err) console.log("probably the last searches were about cats anyway, but there was an error looking it up..");
        res.end(JSON.stringify(data));
    });
});


app.get('/imagesearch/:str', function(req, res) {
    let str = req.params.str;
    let mods = str.split("?");
    let newSearch = new sModel({
        terms: str,
        time: new Date()
    });
    newSearch.save();
    let offset = 0;
    if (req.query.offset)
        offset = parseInt(req.query.offset);

    let headers = {
        Authorization: "Client-ID " + ClientID
    };

    var options = {
        host: 'api.imgur.com',
        path: '/3/gallery/search?q_all=' + mods[0].replace(" ", "%20"),
        method: 'GET',
        headers: headers
    };

    let request = https.request(options, function(imageRes) {
        var responseString = '';
        console.log('statusCode of http request: ', imageRes.statusCode);

        imageRes.on('data', function(data) {
            responseString += data;
        });

        imageRes.on('end', function() {
            let filteredResponse = [];
            let responseObject = JSON.parse(responseString);
            for (let i = 10 * offset; i < 10 * (offset + 1); i++) {
                if (i < responseObject.data.length)
                    filteredResponse.push({
                        "title": responseObject.data[i].title,
                        "link": responseObject.data[i].link
                    });
            }
            res.end(JSON.stringify(filteredResponse));
        });
    });
    var retval = "";
    request.write(retval);
    request.end();
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Node.js listening on port ' + port + '...');
});