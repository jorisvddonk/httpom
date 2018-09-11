const { URL } = require("url");
var querystring = require("querystring");
var parseRequestLine = require("./parseRequestLine");
var httpheaders = require("http-headers");
var package = require("../package.json");
var log = require("debug")("httpom:applyVariablesToParsedPomfile");
var _ = require("lodash");

var applyVariablesToParsedPomfile = function(context) {
  var applyTo = {
    body: false,
    querystringparams: false,
    requestline: false,
    headers: false
  };
  context.parsedPomfile.httpom_directives.forEach(function(directive) {
    if (directive.indexOf("@template:") === 0) {
      applyTo.body = directive.split(':')[1].trim().toLowerCase();
    }
    if (directive.indexOf("@template-querystringparams:") === 0) {
      applyTo.querystringparams = directive.split(':')[1].trim().toLowerCase();
    }
    if (directive.indexOf("@template-requestline:") === 0) {
      applyTo.requestline = directive.split(':')[1].trim().toLowerCase();
    }
    if (directive.indexOf("@template-headers:") === 0) {
      applyTo.headers = directive.split(":")[1].trim().toLowerCase();
    }
  });

  if (applyTo.body) {
    var templateEngine = applyTo.body;
    var template = context.parsedPomfile.body.toString();
    if (templateEngine === 'mustache') {
      var mustache = require('mustache');
      context.parsedPomfile.body = new Buffer(mustache.render(template, context.variables));
    }
  }

  if (applyTo.querystringparams) {
    var templateEngine = applyTo.querystringparams;
    context.parsedPomfile.querystringparams = context.parsedPomfile.querystringparams.map(function(qsp) {
      var template = qsp;
      if (templateEngine === 'mustache') {
        var mustache = require('mustache');
        return mustache.render(template, context.variables);
      }
    });
  }

  if (applyTo.headers) {
    var templateEngine = applyTo.headers;
    context.parsedPomfile.headers = context.parsedPomfile.headers.map(function (hdr) {
      var template = hdr;
      if (templateEngine === "mustache") {
        var mustache = require("mustache");
        return mustache.render(template, context.variables);
      }
    });
  }

  if (applyTo.requestline) {
    var templateEngine = applyTo.requestline;
    var template = context.parsedPomfile.requestline;
    if (templateEngine === 'mustache') {
      var mustache = require('mustache');
      context.parsedPomfile.requestline = mustache.render(template, context.variables);
    }
  }

  log(context.parsedPomfile);
  return context;
};

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    try {
      resolve(applyVariablesToParsedPomfile(context));
    } catch (e) {
      reject(e);
    }
  });
};
