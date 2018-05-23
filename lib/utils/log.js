'use strict';

const chalk = require('chalk');
const figures = require('figures');

const noop = any => any;

function getColorFnAndIconByType(type) {
  let colorFn, icon;

  switch (type) {
    case 'error':
      colorFn = chalk.red;
      icon = figures.cross;
      break;
    case 'warn':
      colorFn = chalk.yellow;
      icon = figures.warning;
      break;
    case 'success':
      colorFn = chalk.green;
      icon = figures.tick;
      break;
    default:
      colorFn = chalk.blue;
      icon = figures.info;
      break;
  }

  return { colorFn, icon };
}

function log(type) {
  return (...message) => {
    if (!message.length) {
      return;
    }

    const { colorFn, icon } = getColorFnAndIconByType(type);
    const output = [''];

    message.forEach((item, index) => {
      if (index === 0) {
        output.push(`  ${icon} ${item}`);
        return;
      }

      output.push(`    ${item}`);
    });

    output.push('');

    console.log(colorFn(output.join('\n')));
  };
}

module.exports = {
  error: log('error'),
  warn: log('warn'),
  success: log('success'),
  info: log()
};
