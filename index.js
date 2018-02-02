#!/usr/bin/env node

var program = require('commander');
var parsePomfile = require('./lib/parsePomfile');
var prepareRequest = require('./lib/prepareRequest');
var fetch = require('node-fetch');
var fs = require('fs');
var package = require('./package.json');

program.version(package.version)
.option('--web', 'Use web-based interface')
.option('--cli', 'Use command-line interface')
.command('*')
.action(function(pomfile){
  var parsed_pomfile = parsePomfile(fs.readFileSync(pomfile));
  var prepared_request = prepareRequest(parsed_pomfile);
  
  fetch(prepared_request.url, prepared_request.options).then(function(res){
    console.log(res.body.read().toString());
  });
  
});
program.parse(process.argv);
