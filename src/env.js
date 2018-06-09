'use strict';

const debug = require('debug')('elint:env');
const path = require('path');
const isNpm = require('is-npm');

/**
 * 获取通过 npm script 执行时的项目根路径
 *
 * @returns {string} cwd
 */
function getInitCwd() {
  return process.env.INIT_CWD
    || process.env.PWD.split('/node_modules/')[0];
}

/**
 * 项目根目录
 *
 * @returns {string} base dir
 */
const getBaseDir = () => {
  const baseDir = isNpm ? getInitCwd() : process.cwd();

  debug(`base dir: ${baseDir}`);
  return baseDir;
};

/**
 * 项目的 node_modules 目录
 *
 * @returns {string} node_modules dir
 */
const getNodeModulesDir = () => {
  const nodeModulesDir = path.join(getBaseDir(), 'node_modules');

  debug(`node_modules dir: ${nodeModulesDir}`);
  return nodeModulesDir;
};

module.exports = {
  getBaseDir,
  getNodeModulesDir
};
