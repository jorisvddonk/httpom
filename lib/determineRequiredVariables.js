const { URL } = require('url');
var querystring = require('querystring');
var parseRequestLine = require('./parseRequestLine');
var httpheaders = require('http-headers');
var package = require('../package.json');
var log = require('debug')('httpom:determineRequiredVariables');
var _ = require('lodash');

var determineRequiredVariables = function(context) {
  var parsedPomfile = context.parsedPomfile;

  // Required variables, potentially filled in later
  function addRequiredVariablesForTemplateString(templateEngine, template) {
    if (templateEngine === 'mustache') {
      var mustache = require('mustache');
      var parsed = mustache.parse(template);
      var flattened_parsed = _.flattenDeep(parsed);
      context.requiredVariables = context.requiredVariables.concat(_.uniq(flattened_parsed.reduce(function(memo, v, i){
        if (v === 'name' || v === '#') { // indicates a variable requirement
          memo.push(flattened_parsed[i+1]);
        }
        return memo;
      }, [])));
    }
  }

  // apply httpom directives related to templates
  context.parsedPomfile.httpom_directives.forEach(function(directive) {
    if (directive.indexOf('@template:') === 0 && context.parsedPomfile.body) {
      var templateEngine = directive.split(':')[1].trim().toLowerCase();
      var template = context.parsedPomfile.body.toString();
      addRequiredVariablesForTemplateString(templateEngine, template);
    }
    if (directive.indexOf('@template-querystringparams:') === 0) {
      var templateEngine = directive.split(':')[1].trim().toLowerCase();
      context.parsedPomfile.querystringparams.forEach(function(qsp){
        var template = qsp.toString();
        addRequiredVariablesForTemplateString(templateEngine, template);
      })
    }
  });
  
  log(context.requiredVariables);
  return context;
};

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    try {
      resolve(determineRequiredVariables(context));
    } catch (e) {
      reject(e);
    }
  });
};