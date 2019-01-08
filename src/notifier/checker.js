'use strict'

const debug = require('debug')('elint:notifier:checker')
const co = require('co')
const semver = require('semver')
const getPresetInfo = require('./get-preset-info')
const fetchRegistryInfo = require('./fetch-registry-info')
const config = require('./config')

/**
 * @typedef ReportInfo
 * @property {stirng} name preset 名称
 * @property {stirng} current 当前版本
 * @property {stirng} latest 最新版本
 */

/**
 * 执行版本更新检测
 *
 * @returns {Promise<ReportInfo>|Promise<null>} 检测结果
 */
function checker () {
  return co(function * () {
    const presetInfo = getPresetInfo()

    debug('preset info: %o', presetInfo)

    // 找不到本地安装的 preset
    if (!presetInfo) {
      return null
    }

    const { registryUrl, name } = presetInfo
    const latestPresetInfo = yield fetchRegistryInfo(registryUrl, name)

    // 获取仓库数据失败
    if (!latestPresetInfo) {
      return null
    }

    const latestPresetVersion = latestPresetInfo.version
    const presetUpdateCheckInterval =
      latestPresetInfo.elint && typeof latestPresetInfo.elint.updateCheckInterval === 'number'
        ? latestPresetInfo.elint.updateCheckInterval
        : 0

    // 禁用 & 未设置更新检查周期
    if (presetUpdateCheckInterval <= 0) {
      return null
    }

    // latestPresetVersion <= presetInfo.version, 无需更新
    if (!semver.gt(latestPresetVersion, presetInfo.version)) {
      return null
    }

    console.log(Date.now() - config.getLastNotifyTime(name))
    console.log(presetUpdateCheckInterval)

    // 未到更新时间
    if (Date.now() - config.getLastNotifyTime(name) <= presetUpdateCheckInterval) {
      return null
    }

    return {
      name,
      latest: latestPresetVersion,
      current: presetInfo.version
    }
  }).catch(error => {
    debug('check error: %o', error)
    return null
  })
}

module.exports = checker
