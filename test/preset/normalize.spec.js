'use strict';

const normalize = require('../../src/preset/normalize');

const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();

describe('Normalize 测试', function () {

  it('空测试', function () {
    const name1 = undefined;
    const name2 = '';

    should.not.exist(normalize(name1));
    normalize(name2).should.equal(name2);
  });

  it('正常情况', function () {
    normalize('name').should.equal('elint-preset-name');
    normalize('elint-preset-name').should.equal('elint-preset-name');
    normalize('elint-preset-na-me').should.equal('elint-preset-na-me');
  });

  it('scope 测试', function () {
    normalize('name', '@scope').should.equal('@scope/elint-preset-name');
    normalize('elint-preset-name', '@scope').should.equal('@scope/elint-preset-name');
    normalize('elint-preset-na-me', '@scope').should.equal('@scope/elint-preset-na-me');
  });

});
