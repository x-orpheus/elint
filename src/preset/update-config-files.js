'use strict'

const debug = require('debug')('elint:preset:updateConfigFile')
const fs = require('fs-extra')
const path = require('path')
const md5 = require('md5')
const { getBaseDir } = require('../env')

/**
 * 判断两个文件是否一致
 *
 * @param {string} newFilePath 新文件的绝对路
 * @param {string} oldFilePath 旧文件的绝对路
 * @returns {boolean} 新旧文件是否一致
 */
function isSameFile (newFilePath, oldFilePath) {
  const newFileContent = fs.readFileSync(newFilePath, { encoding: 'utf-8' })
  const oldFileContent = fs.readFileSync(oldFilePath, { encoding: 'utf-8' })
  const newHash = md5(newFileContent)
  const oldHash = md5(oldFileContent)

  return newHash === oldHash
}

/**
 * 更新配置文件
 *
 * @param {string} filePath 配置文件的绝对路径
 * @param {boolean} keep 是否保留旧的配置文件
 * @returns {void}
 */
function updateConfigFiles (filePath, keep) {
  debug(`file path: ${filePath}`)

  if (typeof filePath !== 'string' || !fs.existsSync(filePath)) {
    debug(`file not exists: ${filePath}`)
    return
  }

  const baseDir = getBaseDir()
  const fileParsedObj = path.parse(filePath)
  const fileName = `${fileParsedObj.name}${fileParsedObj.ext}`
  const destFilePath = path.join(baseDir, fileName)
  const oldFilePath = path.join(
    baseDir,
    `${fileParsedObj.name}.old${fileParsedObj.ext}`
  )

  debug(`file dest path: ${destFilePath}`)

  // 获取输出时使用的相对路径
  const getRelativePath = p => {
    if (p.startsWith(baseDir)) {
      return path.relative(baseDir, p)
    }

    return p
  }

  // 旧文件存在，rename
  if (keep === true && fs.existsSync(destFilePath)) {
    if (isSameFile(filePath, destFilePath)) {
      debug('file exists, file same, ignore')
      console.log(`  "${getRelativePath(destFilePath)}" is up to date`)
      return
    }

    debug('file exists, file different, move.')
    debug(`file old name: ${oldFilePath}`)
    fs.moveSync(destFilePath, oldFilePath, { overwrite: true })
    console.log(`  move: from "${getRelativePath(destFilePath)}"`)
    console.log(`          to "${getRelativePath(oldFilePath)}"`)
  }

  fs.copySync(filePath, destFilePath)
  console.log(`  copy: from "${getRelativePath(filePath)}"`)
  console.log(`          to "${getRelativePath(destFilePath)}"`)
}

module.exports = updateConfigFiles
