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
 */
const baseDir = isNpm ? getInitCwd() : process.cwd();

/**
 * 项目的 node_modules 目录
 */
const nodeModulesDir = path.join(baseDir, 'node_modules');

debug(`base dir: ${baseDir}`);
debug(`node_modules dir: ${nodeModulesDir}`);

module.exports = {
  baseDir,
  nodeModulesDir
};
