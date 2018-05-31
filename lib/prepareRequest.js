const { URL } = require('url');
var querystring = require('querystring');
var parseRequestLine = require('./parseRequestLine');
var httpheaders = require('http-headers');
var package = require('../package.json');
var log = require('debug')('httpom:prepareRequest');
var _ = require('lodash');

var getQueryStringParameters = function(parsedPomfile) {
  var querystringparams = parsedPomfile.querystringparams.map(function(qsp){
    qsp = qsp.substr(1);
    return querystring.parse(qsp);
  }).reduce(function(memo, parsedQS){
    Object.keys(parsedQS).forEach(function(key) {
      if (!memo[key]) {
        memo[key] = [];
      }
      memo[key] = memo[key].concat(parsedQS[key]);
    });
    return memo;
  }, {});
  return querystringparams;
};

var appendQueryStringParametersToURL = function(url, querystringparams) {
  Object.keys(querystringparams).forEach(function(key){
    querystringparams[key].forEach(function(qsp){
      url.searchParams.append(key, qsp);
    });
  });
};

var prepareRequest = function(context) { // object containing requestline, headers, querystringparams, httpom_directives and body
  var parsedPomfile = context.parsedPomfile;
  // Prepare options object.
  var options = {
    method: undefined,
    headers: {},
    redirect: 'follow',
    body: undefined
  };

  var setContentLengthHeader = true;
  var preRequestFunctions = [];

  // Set the headers based on the headers we receive from the parsed pomfile
  options.headers = httpheaders(parsedPomfile.headers.join('\n'), true);
  // Add httpom user agent header
  options.headers['user-agent'] = `${package.name}/${package.version} (+${package.homepage})`
  
  // Set the body buffer and compute the content-length header
  options.body = parsedPomfile.body;
  
  // Parse the request line
  var parsedRequestLine = parseRequestLine(parsedPomfile.requestline);

  // The method of the request is based on the parsed request line.
  options.method = parsedRequestLine.method;
  
  // Determine the URL from the parsed requestline
  var url = new URL(parsedRequestLine.url);
  // Parse querystring params and append to URL
  appendQueryStringParametersToURL(url, getQueryStringParameters(parsedPomfile));

  // apply httpom directives
  parsedPomfile.httpom_directives.forEach(function(directive) {
    if (directive === '@use-chunked-encoding') {
      setContentLengthHeader = false;
    }
  });
  
  if (setContentLengthHeader) {
    preRequestFunctions.push(function(preparedRequest, variables){
      if (preparedRequest.options.body) { // If there's a request body, set the content-length automatically. NOTE: this header is removed again by the `@use-chunked-encoding` httpom directive.
        preparedRequest.options.headers['content-length'] = preparedRequest.options.body.length;
      }
    });
  }
  // Return URL and options separately.
  var preparedRequest = {
    url: url.toString(),
    options: options,
    protocol: parsedRequestLine.protocol
  };
  log(preparedRequest);
  context.preparedRequest = preparedRequest;
  context.preRequestFunctions = preRequestFunctions;
  return context;
};

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    try {
      resolve(prepareRequest(context));
    } catch (e) {
      reject(e);
    }
  });
};