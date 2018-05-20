'use strict';

const eslint = require('eslint');
const CLIEngine = eslint.CLIEngine;

const files = process.argv.slice(2);

const engine = new CLIEngine({
  // 禁用 .eslintignore 文件
  // 忽略规则由 elint 统一处理
  ignore: false
});

const formatter = engine.getFormatter('stylish');
const report = engine.executeOnFiles(files);
const output = formatter(report.results);

process.stdout.write(output);
process.exit();
