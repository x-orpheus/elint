#!/usr/bin/env node

'use strict';

const debug = require('debug')('elint:cli');
const program = require('commander');
const pkg = require('../package.json');

debug('proces.argv: \n%O', process.argv);

program
  .usage('[input] [options]')
  .description(pkg.description)
  .version(pkg.version)
  .action((...argus) => {
    console.log(argus);
  });

program.parse(process.argv);

function showHelp() {
  // 没有输入任何参数
  if (process.argv.length === 2) {
    return true;
  }

  let argus = process.argv.slice(2);

  return argus.every(item => item.startsWith('-'));
}

if (showHelp()) {
  program.help();
}
