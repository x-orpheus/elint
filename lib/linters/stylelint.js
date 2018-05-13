'use strict';

const stylelint = require('stylelint');

const configFile = process.argv[2];
const files = process.argv.slice(3);

stylelint.lint({
  configFile,
  files,
  formatter: 'string'
}).then(data => {
  process.stdout.write(data.output);
  process.exit();
}).catch(error => {
  process.stderr.write(error);
  process.exit(1);
});
