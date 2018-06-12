'use strict';

const stylelint = require('stylelint');
const setBlocking = require('../../utils/set-blocking');
const files = process.argv.slice(2);

const result = {
  name: 'stylelint',
  output: '',
  success: true
};

stylelint.lint({
  files,
  formatter: 'string'
}).then(data => {
  result.success = !data.errored;
  result.output = data.output;
  return result;
}).catch(error => {
  result.success = false;
  result.output = error.message;
  return result;
}).then(data => {
  setBlocking(true);
  process.stdout.write(JSON.stringify(data));
  process.exit();
});
