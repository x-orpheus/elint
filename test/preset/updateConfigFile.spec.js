'use strict';

const fs = require('fs-extra');
const path = require('path');
const unmock = require('../mock')();
const updateConfigFile = require('../../lib/preset/updateConfigFile');
const { baseDir } = require('../../lib/utils/env');

const mocha = require('mocha');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
chai.use(deepEqualInAnyOrder);
const should = chai.should();

// 目录下的原始文件
const fileList = fs.readdirSync(baseDir);

describe('UpdateConfigFile 测试', function () {

  after(() => unmock);

  // 清理 updateConfigFile 搞出来的文件
  afterEach(() => {
    const newFileList = fs.readdirSync(baseDir);

    newFileList.forEach(fileName => {
      if (fileList.includes(fileName)) {
        return;
      }

      fs.removeSync(path.join(baseDir, fileName));
    });
  });

  it('空测试', function () {
    updateConfigFile();
    return fs.readdirSync(baseDir).should.be.deep.equalInAnyOrder(fileList);
  });

  it('文件不存在', function () {
    updateConfigFile('/a/b/c/d/e/f.asdf');
    return fs.readdirSync(baseDir).should.be.deep.equalInAnyOrder(fileList);
  });

  it('新文件', function () {
    const fileName = '.stylelintrc.js';
    const result = [].concat(...fileList, fileName);
    const filePath = path.join(
      __dirname,
      '../test-project/node_modules/elint-preset-node',
      fileName
    );

    updateConfigFile(filePath);
    return fs.readdirSync(baseDir).should.be.deep.equalInAnyOrder(result);
  });

  it('文件已经存在', function () {
    const fileName = '.stylelintrc.js';
    const oldFileName = '.stylelintrc.old.js';
    const result = [].concat(...fileList, fileName, oldFileName);
    const filePath = path.join(
      __dirname,
      '../test-project/node_modules/elint-preset-node',
      fileName
    );

    // 执行两次，模拟文件已存在
    updateConfigFile(filePath);
    updateConfigFile(filePath);

    return fs.readdirSync(baseDir).should.be.deep.equalInAnyOrder(result);
  });

});
