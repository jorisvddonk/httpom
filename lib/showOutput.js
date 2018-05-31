var log = require("debug")("httpom:showOutput");

var showOutput = function(context) {
  log(`outputting using output format ${context.output}`);
  if (context.output === 'stdout.plaintext') {
    process.stdout.write(context.responseBody.toString());
  }
  if (context.output === 'stdout.json') {
    process.stdout.write(JSON.stringify(JSON.parse(context.responseBody.toString()), null, 2));
  }
  if (context.output === 'none') {
    log("Explicitly not outputting anything!");
  }
  return context;
};

module.exports = function(context) {
  return new Promise(function(resolve, reject) {
    try {
      resolve(showOutput(context));
    } catch (e) {
      reject(e);
    }
  });
};
