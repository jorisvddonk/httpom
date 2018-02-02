#!/usr/bin/env node

var debug = require('debug');
var program = require('commander');
var parsePomfile = require('./lib/parsePomfile');
var prepareRequest = require('./lib/prepareRequest');
var fetch = require('node-fetch');
var fs = require('fs');
var package = require('./package.json');

var log = debug('httpom:cmd');

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

var parseCommonFlags = function(callback) { // Parse common flags, then invoke callback with arguments
  if (program.verbose) {
    debug.enable('*');
    log("Verbose logging enabled");
  }
  var args = Array.prototype.slice.call(arguments);
  args = args.slice(1);
  callback.apply(this, args);
};

program.version(package.version);
//program.option('--web', 'Use web-based interface'); // not supported yet
//program.option('--cli', 'Use command-line interface'); // not supported yet
program.option('-v, --verbose', 'Verbose logging');

['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE'].forEach(function(method){
  program
  .command(method + " <url> [protocol]")
  .action(function(url, protocol){
    parseCommonFlags(function(){
      executePomfile(new Buffer(`${method} ${url} ${protocol}`))
    });
  })
})

program
.command('*')
.action(function(pomfilePath){
  parseCommonFlags(function(){
    var pomfile = fs.readFileSync(pomfilePath);
    executePomfile(pomfile);
  });
});

// Parse argv! This will kick off the actions..
program.parse(process.argv);