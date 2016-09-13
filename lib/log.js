const program = require('commander');

exports.warn = function warn(log) {
  console.warn(log);
};

exports.info = function info(log) {
  if (program.verbose) console.warn(log);
};
