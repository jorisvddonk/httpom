#!/usr/bin/env node

var debug = require('debug');
var program = require('commander');
var parsePomfile = require('./lib/parsePomfile');
var prepareRequest = require('./lib/prepareRequest');
var toHAR = require('./lib/toHAR');
var fetch = require('node-fetch');
var fs = require('fs');
var package = require('./package.json');
var inquirer = require('inquirer');
var _ = require('lodash');

var log = debug('httpom:cmd');

var dry_run = false;
var executePomfile = function(pomfile) {
  var parsed_pomfile = parsePomfile(pomfile);
  var prepared_request = prepareRequest(parsed_pomfile);
  
  var questions = [];
  if (prepared_request.requiredVariables) {
    questions = prepared_request.requiredVariables.map(function(variable){
      var retval = {type: 'input', name: variable, message: 'Please provide a value for template variable `' + variable + '`'}
      if (variable === 'password') {
        retval.type = 'password';
      }
      return retval;
    });
  }
  inquirer.prompt(questions).then(function(answers){
    if (prepared_request.preRequestFunctions) {
      prepared_request.preRequestFunctions.forEach(function(preRequestFunction){
        preRequestFunction(prepared_request, answers);
      })
    }
    var har = toHAR(prepared_request);
    if (program.toHAR) {
      process.stdout.write(JSON.stringify(har, null, 2));
    }
    if (dry_run) {
      return;
    }
    fetch(prepared_request.url, prepared_request.options).then(function(res){return res.buffer()}).then(function(buffer){
      if (buffer) {
        console.log(buffer.toString());
      }
    }).catch(function(err){
      console.error(err);
    });
  });
};

var parseCommonFlags = function(callback) { // Parse common flags, then invoke callback with arguments
  if (program.verbose) {
    debug.enable('*');
    log("Verbose logging enabled");
  }

  if (program.dryRun || program.toHAR) {
    dry_run = true;
    log("Dry run enabled");
  }

  if (program.toHAR) {
    log("Outputting HAR");
  }

  log('Command line arguments: ' + program.rawArgs.slice(2).join(' '))

  var args = Array.prototype.slice.call(arguments);
  args = args.slice(1);
  callback.apply(this, args);
};

program.version(package.version);
//program.option('--web', 'Use web-based interface'); // not supported yet
//program.option('--cli', 'Use command-line interface'); // not supported yet
program.option('-v, --verbose', 'Verbose logging');
program.option('--dry-run', 'Perform a dry run (don\'t make any actual requests)');
program.option('--toHAR', 'Output a HAR file on stdout. Also implies --dry-run');

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