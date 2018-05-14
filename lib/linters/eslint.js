'use strict';

const eslint = require('eslint');
const CLIEngine = eslint.CLIEngine;

const configFile = process.argv[2];
const files = process.argv.slice(3);

const engine = new CLIEngine({
  useEslintrc: false,
  // 禁用 .eslintignore 文件
  // 忽略规则由 elint 统一处理
  ignore: false,
  configFile
});

const formatter = engine.getFormatter('stylish');
const report = engine.executeOnFiles(files);
const output = formatter(report.results);

process.stdout.write(output);
process.exit();
