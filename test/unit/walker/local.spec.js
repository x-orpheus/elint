'use strict';

const path = require('path');
const mock = require('../mock/env');
const walker = require('../../../src/walker/local');
const { getBaseDir } = require('../../../src/env');

const mocha = require('mocha');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
chai.use(deepEqualInAnyOrder);
chai.use(chaiAsPromised);
const should = chai.should();

let baseDir;
let getPath;
let unmock;

describe('Walker local 测试', function () {

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
  });


  it('空测试', function () {
    return Promise.all([
      walker().should.eventually.deep.equalInAnyOrder([]),
      walker([]).should.eventually.deep.equalInAnyOrder([])
    ]);
  });

  it('单条 glob', function () {
    const result = [
      getPath('src/a.js')
    ];

    return walker('src/*.js').should.eventually.deep.equalInAnyOrder(result);
  });

  it('单条 glob, 匹配空', function () {
    return walker('src/*.ts').should.eventually.deep.equalInAnyOrder([]);
  });

  it('单条 glob, deep', function () {
    const result = [
      getPath('src/a.js'),
      getPath('src/lib/b.js')
    ];

    return walker('src/**/*.js').should.eventually.deep.equalInAnyOrder(result);
  });

  it('单条 glob, deep', function () {
    const result = [
      getPath('src/a.css'),
      getPath('src/a.js'),
      getPath('src/lib/b.js')
    ];

    return walker('src/**/*').should.eventually.deep.equalInAnyOrder(result);
  });

  it('多条 glob', function () {
    const result = [
      getPath('src/a.css'),
      getPath('src/a.js')
    ];

    return walker(['src/*.js', 'src/*.css']).should.eventually.deep.equalInAnyOrder(result);
  });

  it('多条 glob, 匹配空', function () {
    return walker(['src/**/*.ts', 'dist/**/*.ts']).should.eventually.deep.equalInAnyOrder([]);
  });

  it('多条 glob, deep', function () {
    const result = [
      getPath('src/a.css'),
      getPath('src/a.js'),
      getPath('src/lib/b.js')
    ];

    return walker(['src/**/*.js', 'src/**/*.css']).should.eventually.deep.equalInAnyOrder(result);
  });

});
