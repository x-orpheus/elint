'use strict'

const debug = require('debug')('elint:walker')
const isGitHooks = require('../utils/is-git-hooks')
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
async function walker (patterns, options = {}) {
  debug(`input glob patterns: ${patterns}`)
  debug('input options: %o', options)

  const fileTree = getFileTree()
  const noIgnore = typeof options.noIgnore === 'boolean'
    ? options.noIgnore
    : false // 默认不禁用 ignore 规则

  if (!patterns || (Array.isArray(patterns) && !patterns.length)) {
    return Promise.resolve(fileTree)
  }

  const isGit = await isGitHooks()

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
    fileList = await stage(patterns, ignorePatterns)
  } else {
    fileList = await local(patterns, ignorePatterns)
  }

  fillFileTree(fileTree, fileList)

  debug('fileList: %o', fileList)
  debug('fileTree: %o', fileTree)

  return fileTree
}

module.exports = walker
