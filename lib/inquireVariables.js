var log = require("debug")("httpom:inquireVariables");
var inquirer = require("inquirer");

var inquireVariables = function(context) {
  var questions = [];
  if (context.requiredVariables) {
    log("User must provide variables: ", context.requiredVariables.join(', '));
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
  return inquirer.prompt(questions).then(function(answers) {
    context.variables = answers;
    return context;
  });
};

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    try {
      inquireVariables(context).then(resolve).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
};
