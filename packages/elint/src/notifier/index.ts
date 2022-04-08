import _debug from 'debug'
import { updateNotifyTime } from './config.js'
import checker from './checker.js'
import report from './report.js'
import type { ElintLoadedPresetAndPlugins } from '../types.js'

const debug = _debug('elint:notifier')

/**
 * 获取更新通知
 *
 * @returns 用于输出的内容
 */
async function notify(
  loadedPrestAndPlugins: ElintLoadedPresetAndPlugins,
  cwd: string
): Promise<string | null> {
  debug('run checker')
  debug(
    `ELINT_DISABLE_UPDATE_NOTIFIER: ${process.env.ELINT_DISABLE_UPDATE_NOTIFIER}`
  )

  if (process.env.ELINT_DISABLE_UPDATE_NOTIFIER === 'true') {
    return null
  }

  const checkerResult = await checker(loadedPrestAndPlugins, cwd)

  if (
    !checkerResult ||
    !checkerResult.name ||
    !checkerResult.latest ||
    !checkerResult.current
  ) {
    return null
  }

  updateNotifyTime(checkerResult.name)

  return report(checkerResult)
}

export default notify
