import _debug from 'debug'
import husky from 'husky'
// import exec from '../lib/exec'
import log from '../utils/log'

const debug = _debug('elint:hooks')

export type HuskyAction = 'install' | 'uninstall'

// 支持的 actions
const supportActions: HuskyAction[] = ['install', 'uninstall']

/**
 * install & uninstall git hooks
 *
 * @param action 要执行的 action
 */
function runHooks(action: HuskyAction): void {
  debug(`input action: ${action}`)

  if (!action) {
    log.error('请输入 action, 例如：elint hooks install')
    process.exit(1)
  }

  if (!supportActions.includes(action)) {
    log.error(`不支持的 action: ${action}`)
    process.exit(1)
  }

  // huskyDir 必须指定
  // exec('node')(pragram, action, huskyDir)
  //   .then(({ stdout }) => {
  //     const logFn = stdout.includes('done') ? log.success : log.info
  //     const message = stdout.replace(/husky > /g, '').split('\n')

  //     logFn(...message)
  //   })
  //   .catch((error) => {
  //     log.error(error.message || 'error')
  //   })
}

export default runHooks
