'use strict';

const path = require('path');
const fs = require('fs-extra');
const mock = require('../mock/env');
const tryRequire = require('../../../src/utils/try-require');
const { getBaseDir } = require('../../../src/env');

const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();

let unmock;
let baseDir;

describe('try-require 测试', function () {

  beforeEach(() => {
    unmock = mock();
    baseDir = getBaseDir();
  });

  afterEach(() => {
    unmock();
    baseDir = null;
  });

  it('边界条件: 无输入', function () {
    tryRequire().should.be.deep.equal([]);
  });

  it('边界条件: baseDir 不存在', function () {
    fs.removeSync(baseDir);
    tryRequire(/name/).should.be.deep.equal([]);
  });

  it('边界条件: baseDir 下 node_modules 不存在', function () {
    const nodeModulesDir = path.join(baseDir, 'node_modules');
    fs.removeSync(nodeModulesDir);
    tryRequire(/name/).should.be.deep.equal([]);
  });

  it('边界条件: baseDir 下 node_modules 为空', function () {
    const nodeModulesDir = path.join(baseDir, 'node_modules');
    fs.emptyDirSync(nodeModulesDir);
    tryRequire(/name/).should.be.deep.equal([]);
  });

  it('模块不存在', function () {
    tryRequire(/name/).should.be.deep.equal([]);
    tryRequire(/hello/).should.be.deep.equal([]);
  });

  it('模块存在', function () {
    const result1 = [
      '@scope/elint-preset-scope',
      'elint-preset-node',
      'elint-preset-normal'
    ];

    const result2 = [
      'elint-preset-node'
    ];

    tryRequire(/elint\-preset/).should.be.deep.equal(result1);
    tryRequire(/elint/).should.be.deep.equal(result1);
    tryRequire(/node/).should.be.deep.equal(result2);
  });

  it('存在隐藏文件（点开头）', function () {
    const result = [
      'elint-preset-node'
    ];

    // 创建文件
    const filePath = path.join(baseDir, 'node_modules/.node.name');
    fs.ensureFileSync(filePath);

    tryRequire(/node/).should.be.deep.equal(result);
  });
});
