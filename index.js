#!/usr/bin/env node

var program = require('commander');
var parsePomfile = require('./lib/parsePomfile');
var prepareRequest = require('./lib/prepareRequest');
var fetch = require('node-fetch');
var fs = require('fs');
var package = require('./package.json');

var executePomfile = function(pomfile) {
  var parsed_pomfile = parsePomfile(pomfile);
  var prepared_request = prepareRequest(parsed_pomfile);
  
  fetch(prepared_request.url, prepared_request.options).then(function(res){return res.buffer()}).then(function(buffer){
    if (buffer) {
      console.log(buffer.toString());
    }
  }).catch(function(err){
    console.error(err);
  });
};

program.version(package.version)
.option('--web', 'Use web-based interface')
.option('--cli', 'Use command-line interface');

['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE'].forEach(function(method){
  program
  .command(method + " <url> [protocol]")
  .action(function(url, protocol){
    executePomfile(new Buffer(`${method} ${url} ${protocol}`))
  })
})

program
.command('*')
.action(function(pomfilePath){
  var pomfile = fs.readFileSync(pomfilePath);
  executePomfile(pomfile);
});
program.parse(process.argv);
