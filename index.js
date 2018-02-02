var parsePomfile = require('./lib/parsePomfile');
var prepareRequest = require('./lib/prepareRequest');
var fetch = require('node-fetch');
var fs = require('fs');

var parsed_pomfile = parsePomfile(fs.readFileSync('./examples/4.pom'));
var prepared_request = prepareRequest(parsed_pomfile);

fetch(prepared_request.url, prepared_request.options).then(function(res){
  console.log(res.body.read().toString());
});