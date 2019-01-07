'use strict'

const debug = require('debug')('elint:main')
const co = require('co')
const _ = require('lodash')
const walker = require('./walker')
const report = require('./utils/report')
const isGitHooks = require('./utils/is-git-hooks')
const eslint = require('./workers/eslint')
const stylelint = require('./workers/stylelint')
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
function elint (files, options) {
  co(function * () {
    const fileList = yield walker(files, options)

    // 没有匹配到任何文件，直接退出
    if (!fileList.es.length && !fileList.style.length) {
      process.exit()
    }

    // linters 对象，方便后续操作
    const linters = {
      es: eslint,
      style: stylelint
    }

    // 处理 fix 和 forceFix
    const isGit = yield isGitHooks()

    if (isGit) {
      options.fix = false
    }
    if (options.forceFix) {
      options.fix = true
    }

    debug('parsed options: %o', options)

    const { type } = options
    const argus = JSON.stringify(options)
    let workers = []

    if (type) {
      // 明确指定 type，例如 elint lint es "*.js"
      workers.push(linters[type](argus, ...fileList[type]))
    } else {
      /**
       * 没有明确指定 type，根据文件类型判断支持哪些 linter
       * 使用 _.toPairs 兼容 node v6
       */
      _.toPairs(linters).forEach(([linterType, linter]) => {
        if (!fileList[linterType].length) {
          return
        }

        workers.push(linter(argus, ...fileList[linterType]))
      })
    }

    // 添加 notifier
    workers.push(notifier.notify())

    Promise.all(workers).then(results => {
      const notifierResult = results.pop()
      const lintResults = results

      const outputs = []
      let success = true

      lintResults.forEach(result => {
        const output = JSON.parse(result.stdout)
        outputs.push(output)
        success = success && output.success
      })

      console.log(report(outputs))

      if (notifierResult) {
        console.log(notifierResult)
      }

      process.exit(success ? 0 : 1)
    })
  })
}

module.exports = elint
