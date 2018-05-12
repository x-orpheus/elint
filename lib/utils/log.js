'use strict';

const chalk = require('chalk');
const unicons = require('unicons');

function error(...message) {
  if (!message.length) {
    return;
  }

  const output = [''];

  message.forEach((item, index) => {
    if (index === 0) {
      output.push(`  ${unicons.cross} ${item}`);
      return;
    }

    output.push(`    ${item}`);
  });

  output.push('');

  console.log(chalk.red(output.join('\n')));
}

module.exports = {
  error
};
