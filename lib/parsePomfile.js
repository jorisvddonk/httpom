var log = require('debug')('httpom:parsePomfile');

var getPomfileLineendings = function(pomfile) {
  // determine if it uses \r\n or \n
  var crlfIndex = pomfile.indexOf('\r\n');
  var lfIndex = pomfile.indexOf('\n');
  if (crlfIndex !== -1 && crlfIndex < lfIndex) {
    return '\r\n';
  }
  if (lfIndex !== -1) {
    return '\n';
  }
  return '\n'; // default to \n; there probably aren't any newlines in the pomfile and it's just a single requestline
};

var extractPomfileComponents = function(pomfile) { // pomfile should be a buffer
  // Return lineending type, and separate actual pomfile (requestline+instructions) from body.
  var lineending = getPomfileLineendings(pomfile);
  var body_delimiter = lineending + lineending + lineending;

  var actual_pomfile = pomfile;
  var body = undefined;
  var body_starts_here = pomfile.indexOf(body_delimiter);
  
  if (body_starts_here !== -1) {
    actual_pomfile = pomfile.slice(0, body_starts_here);
    body = pomfile.slice(body_starts_here + body_delimiter.length, pomfile.length);
  }

  return {
    pomfile: actual_pomfile, // pomfile buffer; requestline plus all non-body sections
    body: body, // body; undefined or a buffer
    lineending: lineending // '\r\n' or '\n'
  }
};

var parsePomfile = function(pomfile) { // pomfile should be a buffer
  // First, split requestline + instructions from body.
  // Then, parse instructions into separate components (headers, querystringparams, httpom directives)
  
  var components = extractPomfileComponents(pomfile);
  pomfile = components.pomfile.toString().split(components.lineending);
  
  var comment_test_regexp = new RegExp(/^(\/+|\s+)/);
  var empty_line_regexp = new RegExp(/^\s*$/);

  pomfile = pomfile.filter(function(line) { // remove comment lines
    return !comment_test_regexp.test(line);
  });

  pomfile = pomfile.filter(function(line) { // remove empty lines
    return !empty_line_regexp.test(line);
  });

  var retval = {
    requestline: undefined,
    headers: [],
    querystringparams: [],
    httpom_directives: [],
    body: components.body
  };

  var instructions = [];

  if (pomfile.length > 0) {
    retval.requestline = pomfile[0]; // first line
    instructions = pomfile.slice(1);
  }

  instructions.forEach(function(instruction){
    if (instruction.indexOf('?') === 0) {
      retval.querystringparams.push(instruction);
    } else if (instruction.indexOf('@') === 0) {
      retval.httpom_directives.push(instruction);
    } else {
      retval.headers.push(instruction); // for now, assume it's a header if it doesn't start with @ or ?. TODO: parse this properly to determine if it's a valid header line or not!
    }
  });

  log(retval);
  return retval;
};

module.exports = parsePomfile;