'use strict';

const stylelint = require('stylelint');
const files = process.argv.slice(2);

stylelint.lint({
  files,
  formatter: 'string'
}).then(data => {
  process.stdout.write(data.output);
  process.exit();
}).catch(error => {
  process.stderr.write(error);
  process.exit(1);
});
