import _debug from 'debug'
import { execa } from 'execa'
import { getBaseDir } from '../env'

const debug = _debug('elint:utils:not-staged-git-files')

/**
 * 获取没有添加到暂存区的文件
 */
async function notStagedGitFiles(): Promise<string[]> {
  const baseDir = getBaseDir()

  try {
    const { stdout } = await execa('git', ['diff', '--name-only'], {
      cwd: baseDir
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
