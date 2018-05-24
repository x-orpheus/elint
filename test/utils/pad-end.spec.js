'use strict';

const padEnd = require('../../src/utils/pad-end');

const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();

describe('PadEnd 测试', function () {
  it('空测试', function () {
    should.not.exist(padEnd());
    should.not.exist(padEnd(undefined));
    should.not.exist(padEnd(null));
    padEnd('').should.be.equal('');
    padEnd(0).should.be.equal(0);
    padEnd(1).should.be.equal(1);
  });

  it('length 大于字符串长度', function () {
    padEnd('123', 8).should.be.equal('123     ');
    padEnd('123456', 8).should.be.equal('123456  ');
  });

  it('length 小于字符串长度', function () {
    padEnd('123456', 5).should.be.equal('123456');
    padEnd('123456', 2).should.be.equal('123456');
  });
});
