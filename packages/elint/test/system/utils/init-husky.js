import path from 'node:path'
import fs from 'fs-extra'

/**
 * @param {string} command
 * @param {string} tmpDir
 */
const initHusky = (command, tmpDir) => {
  // 强行修改 husky 配置，commit 前执行 lint style
  const huskyCommitMsgPath = path.join(tmpDir, '.husky/commit-msg')
  const huskyFileContent = `${command}`

  return fs.writeFile(huskyCommitMsgPath, huskyFileContent)
}

export default initHusky
