'use strict';

const eslint = require('eslint');
const CLIEngine = eslint.CLIEngine;
const files = process.argv.slice(2);

const engine = new CLIEngine();
const formatter = engine.getFormatter('stylish');
const report = engine.executeOnFiles(files);

const output = formatter(report.results);

process.stdout.write(output);
process.exit();
