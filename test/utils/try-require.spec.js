'use strict';

/**
 * 本次测试不修改文件，使用同一个测试项目
 */

const path = require('path');
const unmock = require('../mock/env')();
const tryRequire = require('../../src/utils/try-require');

const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();

describe('try-require 测试', function () {

  after(unmock);

  it('边界条件', function () {
    tryRequire().should.be.deep.equal([]);
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
});
