'use strict';

const eslint = require('eslint');
const CLIEngine = eslint.CLIEngine;

const configFile = process.argv[2];
const files = process.argv.slice(3);

const engine = new CLIEngine({
  useEslintrc: false,
  ignore: false,
  configFile
});

const formatter = engine.getFormatter('codeframe');
const report = engine.executeOnFiles(files);
const output = formatter(report.results);

process.stdout.write(output);
process.exit();
