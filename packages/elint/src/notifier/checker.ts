import _debug from 'debug'
import semver from 'semver'
import type { NotifierReportInfo } from './report.js'
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
): Promise<NotifierReportInfo | null> {
  try {
    const { name, version: currentPresetVersion } = internalPreset

    debug('preset name: %o', name)

    const latestPresetInfo = await getPackageInfo(name, cwd)

    // 获取仓库数据失败
    if (!latestPresetInfo) {
      return null
    }

    const latestPresetVersion = latestPresetInfo.version

    debug(
      `preset version: latest(${latestPresetVersion}), current(${currentPresetVersion})`
    )

    // latestPresetVersion <= currentPresetVersion 无需更新
    if (!semver.gt(latestPresetVersion, currentPresetVersion)) {
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
