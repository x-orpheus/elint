import _debug from 'debug'
import execa from 'execa'
import { getBaseDir } from '../env'

const debug = _debug('elint:utils:get-staged-file-content')

/**
 * 获取暂存区文件内容
 *
 * @param filePath 文件路径
 * @returns 文件内容
 */
async function getStagedFileContent(filePath: string): Promise<string | null> {
  const baseDir = getBaseDir()

  try {
    const { stdout } = await execa('git', ['show', `:${filePath}`], {
      cwd: baseDir,
      stripFinalNewline: false
    })
    return stdout
  } catch (error) {
    debug('%O', error)
    return null
  }
}

export default getStagedFileContent
