'use strict';

const debug = require('debug')('elint:env');
const path = require('path');
const isNpm = require('is-npm');

/**
 * 项目根目录
 */
const baseDir = isNpm ? process.env.INIT_CWD : process.cwd();

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
