'use strict';

const eslint = require('eslint');
const CLIEngine = eslint.CLIEngine;

module.exports = function (files, configFile) {
  const engine = new CLIEngine({
    useEslintrc: false,
    ignore: false,
    configFile
  });

  const formatter = engine.getFormatter('codeframe');
  const report = engine.executeOnFiles(files);

  return formatter(report.results);
};
