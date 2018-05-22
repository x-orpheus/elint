'use strict';

const co = require('co');
const {
  format,
  load,
  lint,
  read
} = require('@commitlint/core');

function commitlint() {
  co(function* () {
    const [message, config] = yield Promise.all([
      read({ edit: '.git/COMMIT_EDITMSG' }),
      load()
    ]);

    const rules = config.rules;
    const options = config.parserPreset ? { parserOpts: config.parserPreset.parserOpts } : {};
    const report = yield lint(message[0], rules, options);
    const formatted = format(report);

    process.stdout.write(formatted.join('\n'));
    process.exit(report.errors.length ? 1 : 0);
  });
}

module.exports = commitlint;
