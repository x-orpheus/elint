'use strict';

const stylelint = require('stylelint');
const files = process.argv.slice(2);

stylelint.lint({
  files,
  formatter: 'string',
  // 禁用 stylelint 的默认忽略（node_modules & bower_components）
  // 忽略规则由 elint 统一处理
  disableDefaultIgnores: true
}).then(data => {
  process.stdout.write(data.output);
  process.exit();
}).catch(error => {
  process.stderr.write(error);
  process.exit(1);
});
