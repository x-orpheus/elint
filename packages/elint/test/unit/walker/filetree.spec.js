'use strict'

const path = require('path')
const { getFileTree, fillFileTree } = require('../../../src/walker/filetree')
const { getBaseDir } = require('../../../src/env')

const baseDir = getBaseDir()
const getPath = p => path.join(baseDir, p)

describe('Walker filetree 测试', () => {
  test('getFileTree 测试', () => {
    expect(getFileTree()).toEqual({
      es: [],
      style: []
    })
  })

  describe('fillFileTree 测试', () => {
    test('空测试', () => {
      const fileTree = {
        es: [],
        style: []
      }

      expect(fillFileTree(fileTree, [])).toEqual(fileTree)
    })

    test('只有 js 文件', () => {
      const fileTree = {
        es: [],
        style: []
      }
      const fileList = ['index.js']

      expect(fillFileTree(fileTree, fileList)).toEqual({
        es: [getPath('index.js')],
        style: []
      })
    })

    test('只有 css 文件', () => {
      const fileTree = {
        es: [],
        style: []
      }
      const fileList = ['index.css']

      expect(fillFileTree(fileTree, fileList)).toEqual({
        es: [],
        style: [getPath('index.css')]
      })
    })

    test('js + css', () => {
      const fileTree = {
        es: [],
        style: []
      }
      const fileList = ['index.js', 'index.css']

      expect(fillFileTree(fileTree, fileList)).toEqual({
        es: [getPath('index.js')],
        style: [getPath('index.css')]
      })
    })

    test('未匹配到特定 linter 的文件', () => {
      const fileTree = {
        es: [],
        style: []
      }
      const fileList = ['index.js', 'index.css', 'index.html']

      expect(fillFileTree(fileTree, fileList)).toEqual({
        es: [getPath('index.js'), getPath('index.html')],
        style: [getPath('index.css'), getPath('index.html')]
      })
    })
  })
})
