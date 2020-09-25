'use strict'

const path = require('path')
const fs = require('fs-extra')
const mock = require('../mock/env')
const tryRequire = require('../../../src/utils/try-require')
const { getBaseDir } = require('../../../src/env')

let unmock
let baseDir

describe('try-require 测试', () => {
  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
    baseDir = null
  })

  test('边界条件: 无输入', () => {
    expect(tryRequire()).toEqual([])
  })

  test('边界条件: baseDir 不存在', async () => {
    await fs.remove(baseDir)
    expect(tryRequire(/name/)).toEqual([])
  })

  test('边界条件: baseDir 下 node_modules 不存在', async () => {
    const nodeModulesDir = path.join(baseDir, 'node_modules')
    await fs.remove(nodeModulesDir)
    expect(tryRequire(/name/)).toEqual([])
  })

  test('边界条件: baseDir 下 node_modules 为空', async () => {
    const nodeModulesDir = path.join(baseDir, 'node_modules')
    await fs.emptyDir(nodeModulesDir)
    expect(tryRequire(/name/)).toEqual([])
  })

  test('模块不存在', () => {
    expect(tryRequire(/name/)).toEqual([])
    expect(tryRequire(/hello/)).toEqual([])
  })

  test('模块存在', () => {
    const result1 = [
      '@scope/elint-preset-scope',
      'elint-preset-node',
      'elint-preset-normal'
    ]

    const result2 = [
      'elint-preset-node'
    ]

    expect(tryRequire(/elint-preset/)).toEqual(result1)
    expect(tryRequire(/elint/)).toEqual(result1)
    expect(tryRequire(/node/)).toEqual(result2)
  })

  test('存在隐藏文件（点开头）', async () => {
    const result = [
      'elint-preset-node'
    ]

    // 创建文件
    const filePath = path.join(baseDir, 'node_modules/.node.name')
    await fs.ensureFile(filePath)

    expect(tryRequire(/node/)).toEqual(result)
  })
})
