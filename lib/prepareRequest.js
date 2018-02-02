const { URL } = require('url');
var querystring = require('querystring');
var parseRequestLine = require('./parseRequestLine');
var httpheaders = require('http-headers');

var prepareRequest = function(parsedPomfile) { // object containing requestline, headers, querystringparams, httpom_directives and body
  var options = {
    method: undefined,
    headers: {},
    redirect: 'follow',
    body: undefined
  };

  options.headers = httpheaders(parsedPomfile.headers, true);

  options.body = parsedPomfile.body;

  var parsedRequestLine = parseRequestLine(parsedPomfile.requestline); // todo: use protocol
  options.method = parsedRequestLine.method;

  var url = new URL(parsedRequestLine.url);

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
  // append querystring params to URL
  Object.keys(querystringparams).forEach(function(key){
    querystringparams[key].forEach(function(qsp){
      url.searchParams.append(key, qsp);
    });
  });

  return {
    url: url.toString(),
    options: options
  };
};

module.exports = prepareRequest;