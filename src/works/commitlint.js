'use strict';

const debug = require('debug')('elint:works:commitlint');
const co = require('co');
const fs = require('fs-extra');
const path = require('path');
const { format, load, lint, read } = require('@commitlint/core');
const log = require('../utils/log');
const { getBaseDir } = require('../env');

/**
 * run commitlint
 *
 * @returns {void}
 */
function commitlint() {
  const baseDir = getBaseDir();

  co(function* () {
    const readOptions = {
      cwd: baseDir,
      edit: '.git/COMMIT_EDITMSG'
    };

    debug('commitlint.read options: %o', readOptions);

    const gitMsgFilePath = path.join(readOptions.cwd, readOptions.edit);

    if (!fs.existsSync(gitMsgFilePath)) {
      debug(`can not found "${gitMsgFilePath}"`);
      throw new Error('无法读取 git commit 信息');
    }

    const [message, config] = yield Promise.all([
      read(readOptions),
      load()
    ]);

    const rules = config.rules;
    const options = config.parserPreset ? { parserOpts: config.parserPreset.parserOpts } : {};
    const report = yield lint(message[0], rules, options);
    const formatted = format(report);

    console.log();
    console.log(formatted.join('\n'));
    console.log();

    process.exit(report.errors.length ? 1 : 0);
  }).catch(error => {
    log.error(error.message);
    process.exit(1);
  });
}

module.exports = commitlint;
