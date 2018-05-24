'use strict';

const debug = require('debug')('elint:lib:exec');
const execa = require('execa');

/**
 * child process 中执行制定文件
 *
 * @param {...string} argus node 参数
 * @return {Promise} promise
 */
function exec(...argus) {
  debug(`run: node ${argus.join(' ')} --color`);
  return execa('node', [...argus, '--color']);
}

module.exports = exec;
