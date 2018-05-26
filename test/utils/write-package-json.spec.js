'use strict';

const path = require('path');
const fs = require('fs-extra');
const unmock = require('../mock')();
const write = require('../../src/utils/write-package-json');
const { baseDir } = require('../../src/env');

const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();

const pkgPath = path.join(baseDir, 'package.json');
const pkgContent = JSON.stringify({ name: 'package-name' }, null, '  ');

describe('Write package json 测试', function () {

  beforeEach(() => fs.writeFileSync(pkgPath, pkgContent));
  afterEach(() => fs.removeSync(pkgPath));
  after(() => unmock);

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
