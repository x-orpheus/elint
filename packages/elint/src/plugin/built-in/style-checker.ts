import chalk from 'chalk'
import type { ElintPlugin } from '../types.js'

/**
 * 检查源码是否发生变化
 *
 * 内部使用的插件
 */
const styleChecker: ElintPlugin<never> = {
  id: 'builtIn:style-checker',
  name: 'elint - formatter',
  type: 'linter',
  activateConfig: {
    activate({ style }) {
      return style
    }
  },
  async execute(text, { fix, source, filePath }) {
    // fix 模式下的代码必然通过格式检查
    const isModified = !fix && text !== source

    return {
      filePath,
      source: text,
      output: text,
      errorCount: isModified ? 1 : 0,
      warningCount: 0,
      message: isModified
        ? `${
            filePath ? `${chalk.underline(filePath)}\n  ` : ''
          }${chalk.red.bold('!')} Not formatted`
        : undefined
    }
  },
  getVersion() {
    return {
      version: 'builtIn'
    }
  }
}

export default styleChecker