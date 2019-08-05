'use strict'

const path = require('path')
const { getFileTree, fillFileTree } = require('../../../src/walker/filetree')
const { getBaseDir } = require('../../../src/env')

const chai = require('chai')
chai.should()

const baseDir = getBaseDir()
const getPath = p => {
  return path.join(baseDir, p)
}

describe('Walker filetree 测试', function () {
  it('getFileTree 测试', function () {
    return getFileTree().should.be.deep.equal({
      es: [],
      style: []
    })
  })

  describe('fillFileTree 测试', function () {
    it('空测试', function () {
      const fileTree = {
        es: [],
        style: []
      }

      return fillFileTree(fileTree, []).should.be.deep.equal(fileTree)
    })

    it('只有 js 文件', function () {
      const fileTree = {
        es: [],
        style: []
      }
      const fileList = ['index.js']

      return fillFileTree(fileTree, fileList).should.be.deep.equal({
        es: [getPath('index.js')],
        style: []
      })
    })

    it('只有 css 文件', function () {
      const fileTree = {
        es: [],
        style: []
      }
      const fileList = ['index.css']

      return fillFileTree(fileTree, fileList).should.be.deep.equal({
        es: [],
        style: [getPath('index.css')]
      })
    })

    it('js + css', function () {
      const fileTree = {
        es: [],
        style: []
      }
      const fileList = ['index.js', 'index.css']

      return fillFileTree(fileTree, fileList).should.be.deep.equal({
        es: [getPath('index.js')],
        style: [getPath('index.css')]
      })
    })

    it('未匹配到特定 linter 的文件', function () {
      const fileTree = {
        es: [],
        style: []
      }
      const fileList = ['index.js', 'index.css', 'index.html']

      return fillFileTree(fileTree, fileList).should.be.deep.equal({
        es: [getPath('index.js'), getPath('index.html')],
        style: [getPath('index.css'), getPath('index.html')]
      })
    })
  })
})
