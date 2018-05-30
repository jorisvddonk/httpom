const { URL } = require("url");
var log = require("debug")("httpom:toHAR");
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
    cookies: [], // todo
    headersSize: -1, // todo
    bodySize: -1 //todo
  };
  log(retval);
  return retval;
};
