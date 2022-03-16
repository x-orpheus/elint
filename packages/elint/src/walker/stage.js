'use strict'

const debug = require('debug')('elint:walker:stage')
const fs = require('fs-extra')
const mm = require('micromatch')
const sgf = require('staged-git-files')
const _ = require('lodash')
const { getBaseDir } = require('../env')
const notStagedGitFiles = require('../utils/not-staged-git-files')
const getStagedFileContent = require('../utils/get-staged-file-content')

const mmOptions = {
  dot: true,
  nobrace: false,
  noglobstar: false,
  noext: false,
  nocase: false,
  matchBase: false
}

/**
 * 执行 micromatch
 *
 * @param {string} filename 文件名
 * @param {Array<string>} patterns 匹配模式
 * @param {Array<string>} ignorePatterns 忽略模式
 *
 * @returns {boolean} 是否匹配
 */
function match (filename, patterns, ignorePatterns) {
  function isMatch (ps) {
    return ps.some(p => {
      return mm.isMatch(filename, p, mmOptions)
    })
  }

  let isIgnore = false

  if (Array.isArray(ignorePatterns) && ignorePatterns.length) {
    isIgnore = isMatch(ignorePatterns)
  }

  if (isIgnore) {
    return false
  }

  return isMatch(patterns)
}

/**
 * Git 暂存文件遍历
 *
 * @param {Array<string>} patterns 要搜寻的 glob 数组
 * @param {Array<string>} ignorePatterns 忽略的 glob 数组
 *
 * @returns {Promise<string[]>} file list
 */
function getStagedFileList (patterns, ignorePatterns) {
  const baseDir = getBaseDir()

  // 如果 baseDir 根本不存在 sgf 会抛出异常
  if (!fs.existsSync(baseDir)) {
    return Promise.resolve([])
  }

  sgf.cwd = baseDir

  return new Promise(resolve => {
    sgf((err, result) => {
      if (err) {
        debug('staged-git-files error: %o', err)
        return resolve([])
      }

      const fileList = result
        .filter(item => item.status !== 'Deleted') // 过滤已删除的文件
        .filter(item => match(item.filename, patterns, ignorePatterns))
        .map(item => item.filename)

      resolve(fileList)
    })
  })
}

/**
 * Git 暂存文件遍历
 *
 * @param {Array<string>} patterns 要搜寻的 glob 数组
 * @param {Array<string>} ignorePatterns 忽略的 glob 数组
 *
 * @returns {Promise<string[]>} file list
 */
async function stagedFiles (patterns, ignorePatterns) {
  // 暂存区文件
  const stagedFileList = await getStagedFileList(patterns, ignorePatterns)
  // 非暂存区文件
  const notStagedFileList = await notStagedGitFiles()

  // 交集，需要获取暂存区的内容
  const needGetContentFileList = _.intersection(stagedFileList, notStagedFileList)
  // 差级，只需要文件名
  const pureStagedFileList = _.without(stagedFileList, ...notStagedFileList)

  if (!needGetContentFileList.length) {
    return pureStagedFileList
  }

  const fileList = [...pureStagedFileList]

  for (let i = 0, j = needGetContentFileList.length; i < j; i++) {
    const fileName = needGetContentFileList[i]
    const fileContent = await getStagedFileContent(fileName)

    fileList.push({
      fileName,
      fileContent
    })
  }

  return fileList
}

module.exports = stagedFiles
