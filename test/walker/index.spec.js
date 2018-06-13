'use strict';

const mock = require('../mock/env');
const { getBaseDir } = require('../../src/env');
const runInHusky = require('../mock/run-in-husky');
const walker = require('../../src/walker');
const walkerPath = require.resolve('../../src/walker');

const mocha = require('mocha');
const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
const should = chai.should();
chai.use(chaiAsPromised);

let unmock;

describe('Walker 测试', function () {

  beforeEach(() => {
    unmock = mock();
  });

  afterEach(() => {
    unmock();
  });

  it('普通环境', function () {
    return walker(['*.txt']).should.eventually.deep.equal({
      es: [],
      style: []
    });
  });

  it('husky 环境', function () {
    // 模拟 husky 环境比较耗时，防止超时
    this.timeout(5000);

    const tmpl = `
      const walker = require('${walkerPath}');
      walker(['*.txt']).then(result => {
        process.stdout.write(JSON.stringify(result));
      });
    `;
    const result = '"{\\"es\\":[],\\"style\\":[]}"';

    return runInHusky(tmpl).should.eventually.equal(result);
  });

});
