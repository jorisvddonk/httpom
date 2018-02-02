const { URL } = require('url');
var log = require('debug')('httpom:parseRequestLine');

var parseRequestLine = function(requestline) {
  /*
   A request-line begins with a method token, followed by a single space
   (SP), the request-target, another single space (SP), the protocol
   version, and ends with CRLF.
  */
  requestline = requestline.trim(); // we don't care about CRLF at the end
  split = requestline.split(/\s+/); // we allow more than one whitespace character as delimiter
  var method = 'GET';
  var url = undefined;
  var protocol = 'HTTP/1.1';

  if (split.length === 3) { // full line
    method = split[0];
    url = split[1];
    protocol = split[2];
  } else if (split.length === 2) { // shortcut; METHOD URL
    method = split[0];
    url = split[1];
  } else if (split.length === 1) { // url only
    url = split[0];
  }

  var allowed_methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE']; // https://tools.ietf.org/html/rfc7231#section-4

  if (allowed_methods.indexOf(method) === -1) {
    throw new Error("Unknown request method: " + method);
  }

  var url = new URL(url).toString(); // validate URL by parsing it via the URL module. This will raise an exception if there's a problem

  var retval = {
    method: method,
    url: url,
    protocol: protocol
  }
  log(retval);
  return retval;
};

module.exports = parseRequestLine;