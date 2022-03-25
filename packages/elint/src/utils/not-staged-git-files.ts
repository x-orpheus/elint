import _debug from 'debug'
import { execa } from 'execa'

const debug = _debug('elint:utils:not-staged-git-files')

/**
 * 获取没有添加到暂存区的文件
 */
async function notStagedGitFiles(cwd: string): Promise<string[]> {
  try {
    const { stdout } = await execa('git', ['diff', '--name-only'], {
      cwd
    })
    const files = stdout ? stdout.split('\n') : []
    debug(files)
    return files
  } catch (error) {
    debug('%O', error)
    return []
  }
}

export default notStagedGitFiles
