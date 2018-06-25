'use strict';

const fs = require('fs-extra');
const path = require('path');
const mock = require('../mock/env');
const updateConfigFiles = require('../../../src/preset/update-config-files');
const { getBaseDir } = require('../../../src/env');

const mocha = require('mocha');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
chai.use(deepEqualInAnyOrder);
chai.should();

let fileList; // 目录下的原始文件
let baseDir;
let unmock;

describe('UpdateConfigFile 测试', function () {

  beforeEach(() => {
    unmock = mock();
    baseDir = getBaseDir();
    fileList = fs.readdirSync(baseDir);
  });

  afterEach(() => {
    unmock();
  });

  it('空测试', function () {
    updateConfigFiles();
    fs.readdirSync(baseDir).should.be.deep.equalInAnyOrder(fileList);
  });

  it('文件不存在', function () {
    updateConfigFiles('/a/b/c/d/e/f.asdf');
    fs.readdirSync(baseDir).should.be.deep.equalInAnyOrder(fileList);
  });

  it('新文件', function () {
    const fileName = '.eslintrc.js';
    const result = [].concat(...fileList, fileName);
    const filePath = path.join(
      baseDir,
      'node_modules/elint-preset-node',
      fileName
    );

    updateConfigFiles(filePath);
    fs.readdirSync(baseDir).should.be.deep.equalInAnyOrder(result);
  });

  it('文件已经存在, keep = false', function () {
    const fileName = '.stylelintrc.js';
    const result = [].concat(...fileList, fileName);
    const filePath = path.join(
      baseDir,
      'node_modules/elint-preset-node',
      fileName
    );

    // 执行两次，模拟文件已存在
    updateConfigFiles(filePath);
    updateConfigFiles(filePath);

    fs.readdirSync(baseDir).should.be.deep.equalInAnyOrder(result);
  });

  it('文件已经存在, keep = true, files same', function () {
    const fileName = '.eslintrc.js';
    const result = [].concat(...fileList, fileName);
    const filePath = path.join(
      baseDir,
      'node_modules/elint-preset-normal',
      fileName
    );

    // 执行两次，模拟文件已存在
    updateConfigFiles(filePath, true);
    updateConfigFiles(filePath, true);

    fs.readdirSync(baseDir).should.be.deep.equalInAnyOrder(result);
  });

  it('文件已经存在, keep = true, files different', function () {
    const fileName = '.stylelintrc.js';
    const oldFileName = '.stylelintrc.old.js';
    const result = [].concat(...fileList, fileName, oldFileName);
    const filePath = path.join(
      baseDir,
      'node_modules/elint-preset-normal',
      fileName
    );
    const destFilePath = path.join(baseDir, fileName);

    // 执行两次，模拟文件已存在
    updateConfigFiles(filePath, true);
    fs.appendFileSync(destFilePath, 'console.log(1);'); // 修改文件
    updateConfigFiles(filePath, true);

    fs.readdirSync(baseDir).should.be.deep.equalInAnyOrder(result);
  });
});
