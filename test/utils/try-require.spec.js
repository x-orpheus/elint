'use strict';

const path = require('path');
const mock = require('../mock/env');
const tryRequire = require('../../src/utils/try-require');

const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();

let unmock;

describe('try-require 测试', function () {

  beforeEach(() => {
    unmock = mock();
  });

  afterEach(() => {
    unmock();
  });

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
