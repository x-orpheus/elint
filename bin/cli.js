#!/usr/bin/env node

'use strict';

/**
 * cli
 */

const debug = require('debug')('elint:cli');
const program = require('commander');
const pkg = require('../package.json');
const { elint, install, diff, commitlint, runHooks } = require('../src');

debug('process.argv: \n%O', process.argv);

program
  .description(pkg.description)
  .version(pkg.version);

/**
 * 执行 lint
 * 不指定 type，执行除了 commitlint 之外的全部
 */
program
  .command('lint [type] [files...]')
  .alias('l')
  .description('执行 lint, type: eslint, stylelint, commitlint...')
  .action((type, files, options) => {
    debug('run lint...');

    if (type === 'commitlint') {
      commitlint();
      return;
    }

    let parsedFiles, parsedType;

    if (['stylelint', 'eslint'].includes(type)) {
      parsedFiles = files;
      parsedType = type;
    } else {
      parsedFiles = [type, ...files];
    }

    elint(parsedFiles, parsedType);
  });

/**
 * 安装 preset
 */
program
  .command('install [presetName]')
  .alias('i')
  .option('-r, --registry <url>')
  .option('-k, --keep')
  .description('install or update preset')
  .action((preset, options) => {
    debug('run install...');
    install(preset, {
      registry: options.registry,
      keep: options.keep
    });
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

/**
 * install & uninstall hooks
 */
program
  .command('hooks [action]')
  .description('install & uninstall hooks')
  .action(action => {
    debug(`run ${action} hooks...`);
    runHooks(action);
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
