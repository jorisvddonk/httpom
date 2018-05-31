const { URL } = require("url");
var log = require("debug")("httpom:applyMiscDirectives");
var _ = require("lodash");
var path = require('path');
var fs = require('fs');
var vm = require('vm');

var applyMiscDirectives = function(context) {
  context.parsedPomfile.httpom_directives.forEach(function(directive) {
    if (directive.indexOf("@finally:") === 0) {
      var filepath = directive.split(':')[1].trim();
      filepath = path.join(path.dirname(context.pomfilePath), filepath);
      var filecontents = fs.readFileSync(filepath);
      context.execution_pipeline.push(function(c){
        return new Promise(function(resolve, reject) {
          try {
            var sandbox = {context: c, console: console, require: require};
            vm.runInNewContext(filecontents, sandbox);
            resolve(sandbox.context);
          } catch (e) {
            reject(e);
          }
        })
      });
    }
  });
  return context;
};

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    try {
      resolve(applyMiscDirectives(context));
    } catch (e) {
      reject(e);
    }
  });
};
