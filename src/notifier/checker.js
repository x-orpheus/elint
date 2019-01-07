'use strict'

const debug = require('debug')('elint:notifier:checker')
const co = require('co')
const semver = require('semver')
const getPresetInfo = require('./get-preset-info')
const fetchRegistryInfo = require('./fetch-registry-info')
const config = require('./config')

co(function * () {
  const presetInfo = getPresetInfo()

  debug('preset info: %o', presetInfo)

  // 找不到本地安装的 preset
  if (!presetInfo) {
    process.exit(1)
  }

  const { registryUrl, name } = presetInfo
  const latestPresetInfo = yield fetchRegistryInfo(registryUrl, name)

  // 获取仓库数据失败
  if (!latestPresetInfo) {
    process.exit(1)
  }

  const latestPresetVersion = latestPresetInfo.version
  const presetUpdateCheckInterval =
    latestPresetInfo.elint && typeof latestPresetInfo.elint.updateCheckInterval === 'number'
      ? latestPresetInfo.elint.updateCheckInterval
      : 0

  // 禁用 & 未设置更新检查周期
  if (presetUpdateCheckInterval <= 0) {
    process.exit(1)
  }

  // latestPresetVersion <= presetInfo.version, 无需更新
  if (!semver.gt(latestPresetVersion, presetInfo.version)) {
    process.exit(1)
  }

  // 未到更新时间
  if (Date.now() - config.getLastNotifyTime() <= presetUpdateCheckInterval) {
    process.exit(1)
  }

  process.stdout.write(latestPresetVersion)
  process.exit(0)
})
