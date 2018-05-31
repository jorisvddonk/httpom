var log = require("debug")("httpom:performRequest");
var toHAR = require("./toHAR");
var fetch = require("node-fetch");
var inquirer = require("inquirer");
var _ = require("lodash");

var performRequest = function(context) {
  var preparedRequest = context.preparedRequest;
  var program = context.program;

  var questions = [];
  if (context.requiredVariables) {
    questions = context.requiredVariables.map(function(variable) {
      var retval = {
        type: "input",
        name: variable,
        message:
          "Please provide a value for template variable `" + variable + "`"
      };
      if (variable === "password") {
        retval.type = "password";
      }
      return retval;
    });
  }
  inquirer.prompt(questions).then(function(answers) {
    if (preparedRequest.preRequestFunctions) {
      preparedRequest.preRequestFunctions.forEach(function(preRequestFunction) {
        preRequestFunction(preparedRequest, answers);
      });
    }
    var har = toHAR(preparedRequest);
    if (program.toHAR) {
      process.stdout.write(JSON.stringify(har, null, 2));
    }
    if (program.dryRun) {
      return;
    }
    fetch(preparedRequest.url, preparedRequest.options)
      .then(function(res) {
        return res.buffer();
      })
      .then(function(buffer) {
        if (buffer) {
          console.log(buffer.toString());
        }
      })
      .catch(function(err) {
        console.error(err);
      });
  });
};

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    try {
      resolve(performRequest(context));
    } catch (e) {
      reject(e);
    }
  });
};
