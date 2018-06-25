'use strict';

const path = require('path');
const mock = require('../mock/env');
const findConfigFiles = require('../../../src/preset/find-config-files');

const mocha = require('mocha');
const chai = require('chai');
chai.should();

let unmock;

describe('FindConfigFile 测试', function () {

  beforeEach(() => {
    unmock = mock();
  });

  afterEach(() => {
    unmock();
  });

  it('目录不存在', function () {
    findConfigFiles('/a/b/c/d').should.be.deep.equal([]);
    findConfigFiles(123).should.be.deep.equal([]);
    findConfigFiles().should.be.deep.equal([]);
  });

  it('常规测试', function () {
    const testProjectDir = path.join(__dirname, '../test-project/node_modules');
    const presetNodePath = path.join(testProjectDir, 'elint-preset-node');
    const presetNormalPath = path.join(testProjectDir, 'elint-preset-normal');

    const result1 = [
      path.join(presetNodePath, '.eslintrc.js'),
      path.join(presetNodePath, '.stylelintrc.js')
    ];
    const result2 = [
      path.join(presetNormalPath, '.eslintrc.js'),
      path.join(presetNormalPath, '.stylelintrc.js')
    ];

    findConfigFiles(presetNodePath).should.be.deep.equal(result1);
    findConfigFiles(presetNormalPath).should.be.deep.equal(result2);
  });

});
