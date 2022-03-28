import _debug from 'debug'
import find from 'find-process'

const debug = _debug('elint:utils:is-git-hooks')

const huskyCmdReg = /node_modules(\/|\\)husky/
const huskyV7CmdReg = /\.husky(\/|\\)/

/**
 * 获取 ppid
 * node v7.x 居然不支持 process.ppid（v6.x 支持）
 *
 * @returns ppid
 */
/* istanbul ignore next */
async function getPPID(): Promise<number | undefined> {
  const ppid = process.ppid

  if (typeof ppid === 'number') {
    return Promise.resolve(ppid)
  }

  const list = await find('pid', process.pid)

  return list[0]?.ppid
}

/**
 * 根据 pid 判断是否由 husky 调用
 *
 * @param ppid parent pid
 * @returns 是否是 husky 调用
 */
async function isRunByHusky(ppid: number): Promise<boolean> {
  const list = await find('pid', ppid)
  debug('process list: %o', list)
  const cmd = list[0]?.cmd
  const pppid = list[0]?.ppid

  if (!cmd || typeof pppid === 'undefined') {
    return false
  }
  if (huskyCmdReg.test(cmd) || huskyV7CmdReg.test(cmd)) {
    return true
  }
  return isRunByHusky(pppid)
}

/**
 * 判断执行环境是否是 git hooks
 *
 * @returns 是否是 git hooks 环境
 */
async function isGitHooks(): Promise<boolean> {
  try {
    const ppid = await getPPID()

    debug(`ppid: ${ppid}`)

    if (typeof ppid === 'number') {
      return isRunByHusky(ppid)
    }
    return false
  } catch (err) {
    debug('error: %o', err)
    return false
  }
}

export default isGitHooks
