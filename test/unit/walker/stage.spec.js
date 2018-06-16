'use strict';

const fs = require('fs-extra');
const path = require('path');
const mock = require('../mock/env');
const gitInit = require('../mock/git-init');
const stageFiles = require('../../../src/walker/stage');
const { getBaseDir } = require('../../../src/env');

const mocha = require('mocha');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
chai.use(deepEqualInAnyOrder);
chai.use(chaiAsPromised);
const should = chai.should();

let unmock;
let baseDir;
let getPath;

describe('Walker stage 测试', function () {

  beforeEach(() => {
    unmock = mock();
    baseDir = getBaseDir();
    getPath = p => {
      /**
       * https://github.com/mrmlnc/fast-glob/blob/master/src/utils/path.ts#L24
       * 针对 window 系统特殊处理
       */
      return path.join(baseDir, p).replace(/\\/g, '/');
    };
  });

  afterEach(() => {
    unmock();
    baseDir = null;
    getPath = null;
  });

  it('目录不存在', function () {
    fs.removeSync(baseDir);
    return stageFiles(['**/*.js']).should.eventually.deep.equal([]);
  });

  it('git 项目不存在', function () {
    return stageFiles(['**/*.js']).should.eventually.deep.equal([]);
  });

  it('可以匹配到文件', function () {
    const result = [
      getPath('src/a.js'),
      getPath('src/lib/b.js')
    ];

    return gitInit()
      .then(() => {
        return stageFiles(['src/**/*.js']).should.eventually.deep.equalInAnyOrder(result);
      });
  });

  it('匹配不到文件', function () {
    return gitInit()
      .then(() => {
        return stageFiles(['*.txt']).should.eventually.deep.equalInAnyOrder([]);
      });
  });

});
