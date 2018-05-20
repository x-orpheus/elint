#!/usr/bin/env node

'use strict';

/**
 * cli
 */

const debug = require('debug')('elint:cli');
const program = require('commander');
const pkg = require('../package.json');

const { elint, install, diff } = require('../lib');

debug('process.argv: \n%O', process.argv);

program
  .arguments('[files...]')
  .description(pkg.description)
  .version(pkg.version)
  .action(files => {
    debug('run eslint...');
    elint(files);
  });

/**
 * 安装 preset
 */
program
  .command('install [presetName]')
  .alias('i')
  .option('-r, --registry <url>')
  .description('install or update preset')
  .action((preset, options) => {
    debug('run install...');
    install(preset, options.registry);
  });

/**
 * 对比 preset config
 */
program
  .command('diff')
  .alias('d')
  .description('diff preset')
  .action(() => {
    debug('run diff...');
    diff();
  });

program.on('--help', function () {
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log('    lint file1.js and file2.css：');
  console.log('    $ elint --preset normal "file1.js" "file2.css"');
  console.log('');
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
