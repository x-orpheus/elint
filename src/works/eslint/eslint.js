'use strict';

const result = {
  name: 'eslint',
  output: '',
  success: true
};

process.on('uncaughtException', error => {
  result.output = error.message;
  result.success = false;

  process.stdout.write(JSON.stringify(result));
  process.exit();
});

const eslint = require('eslint');
const setBlocking = require('../../utils/set-blocking');

const CLIEngine = eslint.CLIEngine;
const files = process.argv.slice(2);

const engine = new CLIEngine();
const formatter = engine.getFormatter('stylish');
const report = engine.executeOnFiles(files);

if (report.errorCount) {
  result.success = false;
  result.output = formatter(report.results);
}

setBlocking(true);
process.stdout.write(JSON.stringify(result));
process.exit();
