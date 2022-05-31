import path from 'path'
import fs from 'fs-extra'

const initHusky = (command, tmpDir) => {
  // 强行修改 husky 配置，commit 前执行 lint style
  const huskyCommitMsgPath = path.join(tmpDir, '.husky/commit-msg')
  const huskyFileContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

${command}
  `

  return fs.writeFile(huskyCommitMsgPath, huskyFileContent)
}

export default initHusky
