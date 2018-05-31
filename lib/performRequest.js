var log = require("debug")("httpom:performRequest");
var toHAR = require("./toHAR");
var fetch = require("node-fetch");
var inquirer = require("inquirer");
var _ = require("lodash");

var performRequest = function(context) {
  var preparedRequest = context.preparedRequest;
  var program = context.program;

  if (context.preRequestFunctions) {
    context.preRequestFunctions.forEach(function(preRequestFunction) {
      preRequestFunction(preparedRequest, context.variables);
    });
  }
  var har = toHAR(preparedRequest);
  if (program.toHAR) {
    process.stdout.write(JSON.stringify(har, null, 2));
  }
  if (program.dryRun) {
    return new Promise(function(resolve, reject){resolve(context)}); // if a dry run, return a new promise that always resolves into the context.
  }
  return fetch(preparedRequest.url, preparedRequest.options)
    .then(function(res) {
      context.response = res;
      return res.buffer();
    })
    .then(function(buffer) {
      context.responseBody = buffer;
      if (buffer) {
        console.log(buffer.toString());
      }
      return context;
    });
};

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    try {
      performRequest(context).then(resolve).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
};
