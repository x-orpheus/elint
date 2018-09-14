'use strict'

const cwd = process.cwd()
const path = require('path')
const fs = require('fs-extra')
const { error, info } = require('./utils/log')
const npmVersions = require('./utils/check-npm-version')
const { getNodeModulesDir } = require('./env')
const { installFromScripts } = require('./index')

const nodeModulesDir = getNodeModulesDir()
const scriptPath = path.join(__dirname, '../scripts/postinstall')
const destDirPath = path.join(nodeModulesDir, '.hooks')
const destScriptPath = path.join(destDirPath, 'postinstall')

/**
 * 检查 npm 版本
 *
 * npm 使用 npm-lifecycle 执行 hooks，但是某些版本存在 bug
 * https://github.com/npm/npm-lifecycle/pull/13/files
 *
 * 规则： npm-lifecycle 存在，且版本 < 2.0.2，报错并提示用户升级 npm，具体规则链接到 README
 *
 * @returns {void}
 */
function checkNpm () {
  /**
   * CI 环境下不执行，不然单元测试会报错，系统测试前会单独检测并升级 npm
   */
  if (process.env.CI) {
    return
  }

  const { npmVersion, npmLifecycleVersion, pass } = npmVersions

  info(
    `npm version: ${npmVersion}`,
    `npm-lifecycle version: ${npmLifecycleVersion || '-'}`
  )

  if (!pass) {
    error(
      'elint 在当前的 npm 版本下无法正常运行，请升级 npm 后再安装',
      '更多信息请访问：http://t.cn/Rg7xvP0'
    )

    process.exit(1)
  }
}

/**
 * 安装 npm hooks
 *
 * @returns {void}
 */
function installHooks () {
  // 开发过程中不执行
  if (!cwd.includes('node_modules')) {
    return
  }

  // 确保目录存在
  fs.ensureDirSync(destDirPath)

  // 部署 scripts
  fs.copySync(scriptPath, destScriptPath)

  // 兼容 windows
  if (process.platform === 'win32') {
    const cmdScriptPath = path.join(__dirname, '../scripts/postinstall.cmd')
    const destCmdScriptPath = path.join(destDirPath, 'postinstall.cmd')

    fs.copySync(cmdScriptPath, destCmdScriptPath)
  }

  // 添加执行权限
  fs.chmodSync(destScriptPath, 0o755)
}

checkNpm()

installHooks()

// 安装完成执行一次 install
installFromScripts()
