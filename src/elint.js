'use strict'

const debug = require('debug')('elint:main')
const walker = require('./walker')
const report = require('./utils/report')
const isGitHooks = require('./utils/is-git-hooks')
const { eslintFileLinter } = require('./workers/eslint')
const { stylelintFileLinter } = require('./workers/stylelint')
const notifier = require('./notifier')

/**
 * @typedef ELintOptions
 * @property {stirng} type lint 类型
 * @property {boolean} fix 是否自动修复问题
 * @property {boolean} forceFix 是否强制自动修复问题
 */

/**
 * 主函数
 *
 * @param {string[]} files 待执行 lint 的文件
 * @param {ELintOptions} options options
 * @returns {void}
 */
async function elint (files, options) {
  const fileList = await walker(files, options)

  // 没有匹配到任何文件，直接退出
  if (!fileList.es.length && !fileList.style.length) {
    process.exit()
  }

  // linters 对象，方便后续操作
  const linters = {
    es: eslintFileLinter,
    style: stylelintFileLinter
  }

  // 处理 fix 和 forceFix
  const isGit = await isGitHooks()

  if (isGit) {
    options.fix = false
  }
  if (options.forceFix) {
    options.fix = true
  }

  debug('parsed options: %o', options)

  const { type } = options
  const argus = JSON.stringify(options)
  const workers = [notifier.notify()]

  if (type) {
    // 明确指定 type，例如 elint lint es "*.js"
    workers.push(linters[type](argus, ...fileList[type]))
  } else {
    /**
     * 没有明确指定 type，根据文件类型判断支持哪些 linter
     */
    Object.entries(linters).forEach(([linterType, linter]) => {
      if (!fileList[linterType].length) {
        return
      }

      workers.push(linter(argus, ...fileList[linterType]))
    })
  }

  Promise.all(workers).then(results => {
    const notifierResult = results.shift()
    const lintResults = results

    const outputs = []
    let success = true

    lintResults.forEach(({ stdout }) => {
      const output = JSON.parse(stdout)
      outputs.push(output)
      success = success && output.success
    })

    console.log(report(outputs))

    if (notifierResult) {
      console.log(notifierResult)
    }

    process.exit(success ? 0 : 1)
  })
}

module.exports = elint
