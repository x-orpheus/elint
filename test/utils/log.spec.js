'use strict';

const chalk = require('chalk');
const figures = require('figures');
const { error, success, info, warn } = require('../../src/utils/log');

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
      const except = chalk.red(`\n  ${figures.cross} ${message}\n`);

      error('hello world!');

      console.log.getCall(0).args[0].should.be.equal(except);
      console.log.calledOnce.should.be.true;
    });

    it('多条信息', function () {
      const message = ['hello', 'world!'];
      const except = chalk.red(`\n  ${figures.cross} ${message[0]}\n    ${message[1]}\n`);

      error(...message);

      console.log.getCall(0).args[0].should.be.equal(except);
      console.log.calledOnce.should.be.true;
    });

    it('多类型测试', function () {
      const message = ['hello', 'world!'];

      const errorExcept = chalk.red(`\n  ${figures.cross} ${message[0]}\n    ${message[1]}\n`);
      const successExcept = chalk.green(`\n  ${figures.tick} ${message[0]}\n    ${message[1]}\n`);
      const infoExcept = chalk.blue(`\n  ${figures.info} ${message[0]}\n    ${message[1]}\n`);
      const warnExcept = chalk.yellow(`\n  ${figures.warning} ${message[0]}\n    ${message[1]}\n`);

      error(...message);
      success(...message);
      info(...message);
      warn(...message);

      console.log.getCall(0).args[0].should.be.equal(errorExcept);
      console.log.getCall(1).args[0].should.be.equal(successExcept);
      console.log.getCall(2).args[0].should.be.equal(infoExcept);
      console.log.getCall(3).args[0].should.be.equal(warnExcept);
      console.log.callCount.should.be.equal(4);
    });
  });

});
