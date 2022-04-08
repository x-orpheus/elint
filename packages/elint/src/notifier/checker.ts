import _debug from 'debug'
import { get } from 'lodash-es'
import semver from 'semver'
import { getLastNotifyTime } from './config.js'
import toMs from '../utils/to-ms.js'
import type { ReportInfo } from './report.js'
import getPackageInfo from './get-package-info.js'
import type { InternalLoadedPresetAndPlugins } from '../types.js'

const debug = _debug('elint:notifier:checker')
/**
 * 执行版本更新检测
 *
 * @returns 检测结果
 */
async function checker(
  { internalPreset }: InternalLoadedPresetAndPlugins,
  cwd: string
): Promise<ReportInfo | null> {
  try {
    // 找不到本地安装的 preset
    if (!internalPreset) {
      return null
    }

    debug('preset name: %o', internalPreset?.name)

    const { name, version: currentPresetVersion } = internalPreset
    const latestPresetInfo = await getPackageInfo(name, cwd)

    // 获取仓库数据失败
    if (!latestPresetInfo) {
      return null
    }

    const latestPresetVersion = latestPresetInfo.version

    // latestPresetVersion <= currentPresetVersion 无需更新
    if (!semver.gt(latestPresetVersion, currentPresetVersion)) {
      return null
    }

    const updateCheckInterval =
      (get(latestPresetInfo, 'elint.updateCheckInterval') as string) || 0

    const updateCheckIntervalNum = toMs(updateCheckInterval)

    // 禁用 & 未设置更新检查周期
    if (updateCheckIntervalNum <= 0) {
      return null
    }

    // 未到更新时间
    if (Date.now() - getLastNotifyTime(name) <= updateCheckIntervalNum) {
      return null
    }

    return {
      name,
      latest: latestPresetVersion,
      current: currentPresetVersion
    }
  } catch (error) {
    debug('check error: %o', error)
    return null
  }
}

export default checker
