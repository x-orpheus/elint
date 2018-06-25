'use strict';

const path = require('path');
const fs = require('fs-extra');
const mock = require('../mock/env');
const write = require('../../../src/utils/write-package-json');
const { getBaseDir } = require('../../../src/env');

const mocha = require('mocha');
const chai = require('chai');
chai.should();

let baseDir;
let pkgPath;
let pkgContent;
let unmock;

describe('Write package json 测试', function () {

  beforeEach(() => {
    unmock = mock();
    baseDir = getBaseDir();
    pkgPath = path.join(baseDir, 'package.json');
    pkgContent = JSON.stringify({ name: 'package-name' }, null, '  ');
    fs.writeFileSync(pkgPath, pkgContent);
  });

  afterEach(() => {
    unmock();
  });

  it('空测试', function (done) {
    Promise.all([
      write(''),
      write()
    ]).then(() => {
      done();
    });
  });

  it('package.json 不存在', function (done) {
    fs.removeSync(pkgPath);

    Promise.all([
      write({ 'elint-preset-test': '*' })
    ]).then(() => {
      done();
    });
  });

  it('package.json 格式异常', function (done) {
    fs.appendFileSync(pkgPath, 'asdfasdf');

    Promise.all([
      write({ 'elint-preset-test': '*' })
    ]).then(() => {
      done();
    });
  });

  it('正常测试', function (done) {
    Promise.all([
      write({ 'elint-preset-test': '*' })
    ]).then(() => {
      const content = fs.readFileSync(pkgPath);
      const pkgData = JSON.parse(content);
      if (pkgData.devDependencies['elint-preset-test'] === '*') {
        done();
      }
    });
  });
});
