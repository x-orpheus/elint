import { pathToFileURL } from 'url'
import { createRequire } from 'module'
import fs from 'fs-extra'
import path from 'path'
import { execa } from 'execa'
import { getBaseDir } from '../../../src/env.js'

const require = createRequire(import.meta.url)
const execaPath = require.resolve('execa')
const tsNodeBinPath = require.resolve('ts-node/dist/bin-transpile')
const tsConfigPath = require.resolve('../../../../../tsconfig.json')

/**
 * 模拟 husky 环境执行 is-git-hooks 测试
 *
 * @param tmpl 待执行的文件字符串
 */
async function run(tmpl: string): Promise<string> {
  const baseDir = getBaseDir()

  // 文件路径
  const execFilePath = path.join(baseDir, 'file.ts')
  const huskyFilePath = path.join(baseDir, 'node_modules/husky/index.mjs')

  const huskyFileContent = `
    import { execaNode } from '${pathToFileURL(execaPath).toString()}'

    execaNode('${tsNodeBinPath}', ['--project','${tsConfigPath}','${execFilePath}']).then(result => {
      process.stdout.write(JSON.stringify(result.stdout))
    })
  `

  // 创建文件
  fs.outputFileSync(execFilePath, tmpl.replace(/\\/g, '\\\\'))

  // 创建 husky 环境并添加执行权限
  fs.outputFileSync(huskyFilePath, huskyFileContent.replace(/\\/g, '\\\\'))
  fs.chmodSync(huskyFilePath, 0o755)

  return execa('node', [huskyFilePath]).then((result) => result.stdout)
}

export default run
