'use strict';

const parse = require('../../src/utils/parse-package-name');

const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();

describe('Parse package name 测试', function () {
  it('空测试', function () {
    should.not.exist(parse());
    should.not.exist(parse(''));
  });

  it('各种非法测试', function () {
    should.not.exist(parse('asdf/asdf'));
    should.not.exist(parse('@asdf@asdf'));
    should.not.exist(parse('@asdf@asdf@v1.1.1'));
    should.not.exist(parse('asdfaf/asdf'));
    should.not.exist(parse('asdf/1.1.1'));
  });

  it('name 测试', function () {
    parse('name').should.deep.equal({
      name: 'name'
    });
    parse('n-a-m_e').should.deep.equal({
      name: 'n-a-m_e'
    });
  });

  it('name + scope 测试', function () {
    parse('@scope/name').should.deep.equal({
      name: 'name',
      scope: '@scope'
    });
  });

  it('name + version 测试', function () {
    parse('name@asdf').should.deep.equal({
      name: 'name',
      version: 'asdf'
    });
    parse('name@1.1.1-bate').should.deep.equal({
      name: 'name',
      version: '1.1.1-bate'
    });
  });

  it('name + scope + version 测试', function () {
    parse('@asdf/name@asdf').should.deep.equal({
      scope: '@asdf',
      name: 'name',
      version: 'asdf'
    });
    parse('@asd-asdf/name@1.1.1-bate').should.deep.equal({
      scope: '@asd-asdf',
      name: 'name',
      version: '1.1.1-bate'
    });
  });
});
