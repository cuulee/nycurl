/**
 * @fileoverview This is the server app script.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

// Constants
var IP = process.env.IP || 'localhost';
var PORT_NUMBER = process.env.PORT || 5000;
var NYTIMES_API_KEY = process.env.NYTIMES_API_KEY;
var URL_SHORTENER_API_KEY = process.env.URL_SHORTENER_API_KEY;

// Dependencies.
var assert = require('assert');
var async = require('async');
var colors = require('colors');
var express = require('express');
var http = require('http');
var morgan = require('morgan');

var ApiAccessor = require('./lib/ApiAccessor');
var DataFormatter = require('./lib/DataFormatter')

// Initialization.
var app = express();
var server = http.Server(app);
var apiAccessor = ApiAccessor.create(NYTIMES_API_KEY, URL_SHORTENER_API_KEY);

app.set('port', PORT_NUMBER);
app.use(morgan(':date[web] :method :url :req[header] :remote-addr :status'));

app.use('/:section?', function(request, response) {
  var userAgent = request.headers['user-agent'];
  var section = request.params.section;
  if (userAgent.indexOf('curl') != -1) {
    apiAccessor.fetch(section, function(error, results) {
      if (error) {
        response.send(error.toString().red);
      } else {
        response.send(DataFormatter.format(results));
      }
    });
  } else {
    if (section) {
      response.redirect('http://www.nytimes.com/pages/' + section);
    } else {
      response.redirect('http://www.nytimes.com');
    }
  }
});

// Starts the server.
server.listen(PORT_NUMBER, function() {
  if (!NYTIMES_API_KEY || !URL_SHORTENER_API_KEY) {
    throw new Error('Cannot access API keys.')
  }
  console.log('STARTING SERVER ON PORT ' + PORT_NUMBER);
});
