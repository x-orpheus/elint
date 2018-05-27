'use strict';

const debug = require('debug')('elint:preset:install');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const co = require('co');
const npmInstall = require('../lib/npm-install');
const log = require('../utils/log');
const { parse, stringify } = require('../utils/package-name');
const packageVersion = require('../utils/package-version');
const writePkg = require('../utils/write-package-json');
const { registryAlias } = require('../config');
const link = require('./link');

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
 * @typedef {Object} InstallOptions
 * @property {string} registry npm registry url & alias
 * @property {boolean} keep 是否保留原配置
 */

/**
 * 安装 preset
 *
 * @param {string} presetName preset name
 * @param {InstallOptions} options install options
 * @returns {void}
 */
function install(presetName, options) {
  debug(`install package name: ${presetName}`);
  debug('install options: %o', options);

  /**
   * 解析 package name
   */
  const { name, version, scope } = parse(presetName);

  debug('preset name object: %o', {
    scope,
    name,
    version
  });

  if (!name) {
    log.error('请输入正确的 presetName.');
    process.exit(1);
  }

  /**
   * 处理 & 校验 install options
   */
  const registryUrl = getRegistryUrl(options.registry);
  const keep = options.keep;

  // registryUrl 存在但是不合法
  if (registryUrl && !/^https?:\/\//.test(registryUrl)) {
    log.error('registry must be a full url with http(s)://');
    process.exit(1);
  }

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
    yield npmInstall(installName, {
      prefix: tmpdir
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
    writePkg(dependencies);

    /**
     * step4: 安装 preset 的 dependencies
     */
    const packages = Object.entries(dependencies)
      .map(([name, range]) => {
        return `${name}@${packageVersion(range)}`;
      });

    yield npmInstall(packages, {
      saveDev: true
    });
  }).catch(error => {
    log.error(error.message);
    process.exit(1);
  }).then(() => {
    // 无论成功与否，清理临时目录
    fs.removeSync(tmpdir);
  });
}

module.exports = install;
