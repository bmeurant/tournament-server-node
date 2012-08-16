/**
 * Module dependencies.
 */

var express = require('express');
var mongoose = require('mongoose');
var pagination = require('mongoose-query-paginate');
var app = module.exports = express.createServer();
app.mongoose = mongoose;

var config = require('./config.js')(app, express);

var models = {};
models.participant = require('./models/participant')(app.mongoose).model;

require('./routes/participants.js')(app, models);

app.listen(process.env.PORT || 3000);
app.use(express.bodyParser());

console.log('Server running ...');

