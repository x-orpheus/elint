#!/usr/bin/env node

'use strict';

/**
 * cli
 */

const debug = require('debug')('elint:cli');
const program = require('commander');
const pkg = require('../package.json');

const elint = require('../lib/elint');

debug('process.argv: \n%O', process.argv);

program
  .arguments('[file...]')
  .description(pkg.description)
  .option('-p, --preset [preset]', 'Specify preset')
  .version(pkg.version)
  .action(file => {
    const preset = program.preset;

    debug(`input files: "${file.join(', ')}"`);
    debug(`input preset: "${preset}"`);

    elint(file, program.preset);
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
