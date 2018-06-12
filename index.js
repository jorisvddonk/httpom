#!/usr/bin/env node

var debug = require('debug');
var program = require('commander');
var parsePomfile = require('./lib/parsePomfile');
var prepareRequest = require('./lib/prepareRequest');
var inquireVariables = require('./lib/inquireVariables');
var determineRequiredVariables = require('./lib/determineRequiredVariables');
var performRequest = require('./lib/performRequest');
var applyMiscDirectives = require('./lib/applyMiscDirectives');
var showOutput = require('./lib/showOutput');
var applyVariablesToParsedPomfile = require('./lib/applyVariablesToParsedPomfile');
var fs = require('fs');
var package = require('./package.json');
var path = require('path');
var log = debug('httpom:cmd');

var executePomfile = function(pomfile, pomfilePath) {
  var execution_pipeline = [parsePomfile, determineRequiredVariables, inquireVariables, applyVariablesToParsedPomfile, prepareRequest, applyMiscDirectives, performRequest, showOutput];
  var pipeline_step;
  var context = {
    pomfile: pomfile,
    pomfilePath: pomfilePath, // absolute path, or null if no pomfile is executed
    program: program,
    requiredVariables: [],
    execution_pipeline: execution_pipeline,
    output: 'stdout.plaintext'
  };
  var next = function() {
    pipeline_step = execution_pipeline.shift();
    if (pipeline_step) {
      pipeline_step(context).then(function(new_context){
        context = new_context;
        next();
      }).catch(console.error);
    }
  };
  next();
};

var parseCommonFlags = function(callback) { // Parse common flags, then invoke callback with arguments
  if (program.verbose) {
    debug.enable('*');
    log("Verbose logging enabled");
  }

  if (program.toHAR) {
    program.dryRun = true;
    log("Outputting HAR");
  }

  if (program.dryRun) {
    log("Dry run enabled");
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
      executePomfile(new Buffer(`${method} ${url} ${protocol}`), null)
    });
  })
})

program
.command('*')
.action(function(pomfilePath){
  parseCommonFlags(function(){
    pomfilePath = path.resolve(pomfilePath);
    var pomfile = fs.readFileSync(pomfilePath);
    executePomfile(pomfile, pomfilePath);
  });
});

// Parse argv! This will kick off the actions..
program.parse(process.argv);