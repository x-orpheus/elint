'use strict';

const parse = require('../../../src/utils/parse-npm-option');

const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();

describe('Parse npm option 测试', function () {
  it('空测试', function () {
    should.not.exist(parse());
    parse('').should.be.equal('');
  });

  it('正常情况', function () {
    parse('save').should.be.equal('--save');
    parse('saveDev').should.be.equal('--save-dev');
    parse('abCdeFgh').should.be.equal('--ab-cde-fgh');
  });
});
