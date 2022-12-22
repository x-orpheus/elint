import _debug from 'debug'
import checker from './checker.js'
import report from './report.js'
import type { InternalLoadedPresetAndPlugins } from '../types.js'
import { getLastNotifyTime, updateNotifyTime } from './config.js'
import { UPDATE_CHECK_FREQUENCY } from '../config.js'

const debug = _debug('elint:notifier')

/**
 * 获取更新通知
 *
 * @returns 用于输出的内容
 */
async function notify(
  internalLoadedPresetAndPlugins: InternalLoadedPresetAndPlugins,
  cwd: string,
  /**
   * 忽略上次检查时间
   */
  forceCheck = false
): Promise<string | null> {
  debug('run update checker')
  debug(
    `ELINT_DISABLE_UPDATE_NOTIFIER: ${process.env.ELINT_DISABLE_UPDATE_NOTIFIER}`
  )

  if (process.env.ELINT_DISABLE_UPDATE_NOTIFIER === 'true') {
    return null
  }

  const presetName = internalLoadedPresetAndPlugins.internalPreset.name

  // 未到更新时间
  if (
    !forceCheck &&
    Date.now() - getLastNotifyTime(presetName) <= UPDATE_CHECK_FREQUENCY
  ) {
    debug('Skip notify')

    return null
  }

  const checkerResult = await checker(internalLoadedPresetAndPlugins, cwd)

  updateNotifyTime(presetName)

  if (!checkerResult) {
    return null
  }

  return report(checkerResult)
}

export default notify
