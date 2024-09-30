import _debug from 'debug'

const debug = _debug('elint:utils:is-git-hooks')

/**
 * 判断执行环境是否是 git hooks
 *
 * @returns 是否是 git hooks 环境
 */
function isGitHooks(): boolean {
  try {
    const gitExecPath = process.env.GIT_EXEC_PATH

    debug(`GIT_EXEC_PATH: ${gitExecPath}`)

    return !!gitExecPath
  } catch (err) {
    /* istanbul ignore next */
    debug('error: %o', err)
    return false
  }
}

export default isGitHooks
