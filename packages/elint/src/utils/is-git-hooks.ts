import _debug from 'debug'
import find from 'find-process'

const debug = _debug('elint:utils:is-git-hooks')

const huskyLegacyCmdReg = /node_modules(\/|\\)husky/
const huskyCmdReg = /\.husky(\/|\\)/
const gitReg = /git/i

/**
 * 根据 pid 判断是否由 husky 调用
 */
async function isRunByHusky(pid: number): Promise<boolean> {
  const list = await find('pid', pid)
  debug('process list: %o', list)

  const currentProcess = list[0]

  if (!currentProcess) {
    return false
  }

  const { cmd, ppid, name } = currentProcess

  if (!cmd || typeof ppid === 'undefined') {
    return false
  }

  // 如果已经到
  if (gitReg.test(name)) {
    return false
  }

  if (huskyCmdReg.test(cmd) || huskyLegacyCmdReg.test(cmd)) {
    return true
  }
  return isRunByHusky(ppid)
}

/**
 * 判断执行环境是否是 git hooks
 *
 * @returns 是否是 git hooks 环境
 */
async function isGitHooks(): Promise<boolean> {
  try {
    const ppid = process.ppid

    debug(`ppid: ${ppid}`)

    return isRunByHusky(ppid)
  } catch (err) {
    debug('error: %o', err)
    return false
  }
}

export default isGitHooks
