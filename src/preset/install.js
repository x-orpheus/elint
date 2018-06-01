'use strict';

const debug = require('debug')('elint:preset:install');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const co = require('co');
const isNpm = require('is-npm');
const npmInstall = require('../lib/npm-install');
const log = require('../utils/log');
const { parse, stringify } = require('../utils/package-name');
const packageVersion = require('../utils/package-version');
const writePkg = require('../utils/write-package-json');
const tryRequire = require('../utils/try-require');
const { registryAlias } = require('../config');
const { nodeModulesDir } = require('../env');
const link = require('./link');

/**
 * @typedef {object} ParsedPresetName
 * @property {string} name package name
 * @property {string} scope package scope
 * @property {string} version package version
 */

/**
 * @typedef {Object} InstallOptions
 * @property {string} registry npm registry url & alias
 * @property {boolean} keep 是否保留原配置
 */

/**
 * 取 install 使用的 registry
 *
 * @param {string} registry registry url or alias
 * @returns {string} registry url
 */
function getRegistryUrl(registry) {
  return registryAlias[registry] || registry;
}

/**
 * 解析 options
 *
 * @param {InstallOptions} options install options
 * @returns {InstallOptions} parsed install options
 */
function parsedOptions(options = {}) {
  options.keep = options.keep || process.env.npm_config_keep || '';

  const registry = options.registry = getRegistryUrl(
    options.registry || process.env.npm_config_registry || ''
  );

  // registryUrl 存在但是不合法
  if (registry && !/^https?:\/\//.test(registry)) {
    log.error('registry must be a full url with http(s)://');
    process.exit(1);
  }

  return options;
}

/**
 * 解析 preset name
 *
 * @param {string} presetName preset name
 * @returns {ParsedPresetName} parsed preset name
 */
function parsedPresetName(presetName) {
  const parsedPresetName = parse(presetName);

  debug('parsed presetName object: %o', parsedPresetName);

  if (!parsedPresetName || !parsedPresetName.name) {
    log.error('请输入正确的 presetName.');
    process.exit(1);
  }

  return parsedPresetName;
}

/**
 * script install preset
 *
 * @param {string} presetName preset name
 * @returns {void}
 */
function installFromScript(presetName) {
  const name = presetName || tryRequire(/elint-preset-/)[0];

  if (!name) {
    debug('can not fount preset, return');
    return;
  }

  const { keep } = parsedOptions();
  const presetModulePath = path.join(nodeModulesDir, name);

  link(presetModulePath, keep);
}

/**
 * cli install preset
 *
 * @param {string} presetName preset name
 * @param {InstallOptions} [options] install options
 * @returns {void}
 */
function installFromCli(presetName, options = {}) {
  const { name, scope, version } = parsedPresetName(presetName);
  const { registry, keep } = parsedOptions(options);

  // 临时安装目录
  const tmpdir = path.join(os.tmpdir(), `elint_tmp_${Date.now()}`);
  const prestPackageName = stringify({ scope, name });
  const presetModulePath = path.join(tmpdir, `lib/node_modules/${prestPackageName}`);
  const presetPkgPath = path.join(presetModulePath, 'package.json');

  debug(`tmpdir: ${tmpdir}`);
  debug(`preset module path: ${presetModulePath}`);
  debug(`preset package.json path: ${presetPkgPath}`);

  fs.ensureDirSync(tmpdir);

  co(function* () {
    /**
     * step1: 安装 preset
     */
    const installName = stringify({ scope, name, version });
    console.log(`install "${installName}"...`);

    yield npmInstall(installName, {
      prefix: tmpdir,
      registry
    });

    /**
     * step2: mv config file
     */
    link(presetModulePath, keep);

    // eslint-disable-next-line global-require
    const dependencies = require(presetPkgPath).dependencies;
    if (!dependencies) {
      // 无需执行 step3, step4
      return;
    }

    /**
     * step3: 修改 package.json
     *
     * 将 preset 的 dependencies 写入项目 package.json 的 devDependencies
     */
    console.log('save dependencies to package.json');
    writePkg(dependencies);

    /**
     * step4: 安装 preset 的 dependencies
     */
    console.log('install dependencies...');
    const packages = Object.entries(dependencies)
      .map(([name, range]) => {
        return `${name}@${packageVersion(range)}`;
      });

    yield npmInstall(packages, {
      saveDev: true
    });

    // 清理临时目录
    fs.removeSync(tmpdir);
  }).catch(error => {
    log.error(error.message);
    process.exit(1);
  });
}

debug(`is npm script: ${isNpm}`);

module.exports = isNpm
  ? installFromScript
  : installFromCli;
