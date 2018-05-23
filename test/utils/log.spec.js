'use strict';

const chalk = require('chalk');
const unicons = require('unicons');
const { error } = require('../../lib/utils/log');

const sinon = require('sinon');
const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();

describe('log 测试', function () {
  describe('error 方法测试', function () {
    beforeEach(() => {
      sinon.spy(console, 'log');
    });

    afterEach(() => {
      console.log.restore();
    });

    it('空测试', function () {
      error();
      console.log.notCalled.should.be.true;
    });

    it('单条信息', function () {
      const message = 'hello world!';
      const except = chalk.red(`\n  ${unicons.cross} ${message}\n`);

      error('hello world!');

      console.log.getCall(0).args[0].should.be.equal(except);
      console.log.calledOnce.should.be.true;
    });

    it('多条信息', function () {
      const message = ['hello', 'world!'];
      const except = chalk.red(`\n  ${unicons.cross} ${message[0]}\n    ${message[1]}\n`);

      error(...message);

      console.log.getCall(0).args[0].should.be.equal(except);
      console.log.calledOnce.should.be.true;
    });
  });

});
