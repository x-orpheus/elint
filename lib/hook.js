'use strict';

const path = require('path');
const worker = require('./utils/worker');
const log = require('./utils/log');
const pragram = require.resolve('husky/lib/installer/bin');

function runHooks(action) {
  if (!action) {
    log.error('请输入 action, 例如：elint hooks install');
    process.exit(1);
  }

  if (!['install', 'uninstall'].includes(action)) {
    log.error(`不支持的 action: ${action}`);
    process.exit(1);
  }

  worker(pragram, action)
    .then(({ stdout }) => {
      const logFn = stdout.includes('done') ? log.success : log.info;
      const message = stdout.replace(/husky > /g, '').split('\n');

      logFn(...message);
    })
    .catch(error => {
      log.error(error.message || 'error');
    });
}

module.exports = runHooks;
