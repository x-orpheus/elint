'use strict'

const debug = require('debug')('elint:walker')
const co = require('co')
const path = require('path')
const isGitHooks = require('../utils/is-git-hooks')
const { getBaseDir } = require('../env')
const { defaultIgnore } = require('../config')
const { getFileTree, fillFileTree } = require('./filetree')
const local = require('./local')
const stage = require('./stage')

/**
 * 文件遍历
 *
 * @param {Array<string>} patterns 匹配模式
 * @param {object} [options] 配置
 * @returns {Promise<object>} file tree
 */
function walker (patterns, options = {}) {
  debug(`input glob patterns: ${patterns}`)
  debug('input options: %o', options)

  const fileTree = getFileTree()
  const noIgnore = typeof options.noIgnore === 'boolean'
    ? options.noIgnore
    : false // 默认不禁用 ignore 规则

  if (!patterns || (Array.isArray(patterns) && !patterns.length)) {
    return Promise.resolve(fileTree)
  }

  return co(function * () {
    const isGit = yield isGitHooks()

    debug(`run in git hooks: ${isGit}`)

    /**
     * 根据运行环境执行不同的文件遍历策略
     */
    let fileList
    let ignorePatterns = []

    if (!noIgnore) {
      debug('ignore rules: %j', defaultIgnore)
      ignorePatterns = defaultIgnore
    }

    if (isGit) {
      fileList = yield stage(patterns, ignorePatterns)
    } else {
      fileList = yield local(patterns, ignorePatterns)
    }

    // 转为绝对路径
    const baseDir = getBaseDir()
    fileList = fileList.map(p => {
      return path.join(baseDir, p)
    })

    fillFileTree(fileTree, fileList)

    debug('fileList: %o', fileList)
    debug('fileTree: %o', fileTree)

    return fileTree
  })
}

module.exports = walker
