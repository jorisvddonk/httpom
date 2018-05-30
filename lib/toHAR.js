const { URL } = require("url");
var log = require("debug")("httpom:toHAR");
var querystring = require('querystring');
var _ = require("lodash");

module.exports = function toHAR(preparedRequest) {
  var headers = _.toPairs(preparedRequest.options.headers).reduce(function(
    memo,
    header
  ) {
    memo.push({
      name: header[0].toString(),
      value: header[1].toString()
    });
    return memo;
  },
  []);

  var queryString = [];
  new URL(preparedRequest.url).searchParams.forEach(function(value, key){
    queryString.push({
      name: key.toString(),
      value: value.toString()
    });
  });

  var retval = {
    url: preparedRequest.url,
    method: preparedRequest.options.method,
    headers: headers,
    queryString: queryString,
    httpVersion: preparedRequest.protocol,
    postData: {},
    cookies: [], // todo
    headersSize: -1, // todo
    bodySize: -1 //todo
  };
  if (preparedRequest.options.body) {
    retval.postData.mimeType = preparedRequest.options.headers['content-type'] ? preparedRequest.options.headers['content-type'] : 'text/plain'; // sane default?
    if (retval.postData.mimeType === 'application/x-www-form-urlencoded') {
      var params = [];
      Object.entries(querystring.parse(preparedRequest.options.body.toString())).forEach(function(entry){
        if (typeof entry[1] === 'string') {
          params.push({
            'name': entry[0],
            'value': entry[1]
          });
        } else { // array
          entry[1].forEach(function(value) {
            params.push({
              'name': entry[0],
              'value': value
            });
          })
        }
      });
      retval.postData.params = params;
    } else {
      retval.postData.text = preparedRequest.options.body.toString();
    }
  }
  log(retval);
  return retval;
};
