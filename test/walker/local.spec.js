'use strict';

const fs = require('fs');
const path = require('path');
const mock = require('../mock/env');
const walker = require('../../src/walker');
const { getBaseDir } = require('../../src/env');

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
    getPath = p => path.join(baseDir, p);
  });

  afterEach(() => {
    unmock();
  });

  describe('Walker 功能测试', function () {
    it('空测试', function () {
      const result = {
        style: [],
        es: []
      };

      return Promise.all([
        walker().should.eventually.deep.equalInAnyOrder(result),
        walker([]).should.eventually.deep.equalInAnyOrder(result)
      ]);
    });

    it('单条 glob', function () {
      const result = {
        style: [],
        es: [getPath('src/a.js')]
      };

      return walker('src/*.js').should.eventually.deep.equalInAnyOrder(result);
    });

    it('单条 glob, 匹配空', function () {
      const result = {
        style: [],
        es: []
      };

      return walker('src/*.ts').should.eventually.deep.equalInAnyOrder(result);
    });

    it('单条 glob, deep', function () {
      const result = {
        style: [],
        es: [
          getPath('src/a.js'),
          getPath('src/lib/b.js')
        ]
      };

      return walker('src/**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });

    it('单条 glob, deep', function () {
      const result = {
        style: [
          getPath('src/a.css')
        ],
        es: [
          getPath('src/a.js'),
          getPath('src/lib/b.js')
        ]
      };

      return walker('src/**/*').should.eventually.deep.equalInAnyOrder(result);
    });

    it('多条 glob', function () {
      const result = {
        style: [
          getPath('src/a.css')
        ],
        es: [
          getPath('src/a.js')
        ]
      };

      return walker(['src/*.js', 'src/*.css']).should.eventually.deep.equalInAnyOrder(result);
    });

    it('多条 glob, 匹配空', function () {
      const result = {
        style: [],
        es: []
      };

      return walker(['src/**/*.ts', 'dist/**/*.ts']).should.eventually.deep.equalInAnyOrder(result);
    });

    it('多条 glob, deep', function () {
      const result = {
        style: [
          getPath('src/a.css')
        ],
        es: [
          getPath('src/a.js'),
          getPath('src/lib/b.js')
        ]
      };

      return walker(['src/**/*.js', 'src/**/*.css']).should.eventually.deep.equalInAnyOrder(result);
    });
  });

  describe('Ignore 功能测试', function () {
    let ignoreFilePath;

    beforeEach(() => {
      ignoreFilePath = path.join(baseDir, '.elintignore');
    });

    const createIgnoreFile = content => {
      fs.appendFileSync(ignoreFilePath, content);
    };

    it('文件不存在，使用默认忽略规则', function () {
      const result = {
        style: [],
        es: [
          getPath('src/a.js'),
          getPath('src/lib/b.js'),
          getPath('app/c.js')
        ]
      };

      return walker('**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });

    it('文件存在，为空，没有任何忽略规则', function () {
      const result = {
        style: [],
        es: [
          getPath('app/c.js'),
          getPath('src/a.js'),
          getPath('src/lib/b.js'),
          getPath('node_modules/elint-preset-node/index.js'),
          getPath('node_modules/elint-preset-node/.eslintrc.js'),
          getPath('node_modules/elint-preset-node/.stylelintrc.js'),
          getPath('node_modules/elint-preset-normal/index.js'),
          getPath('node_modules/elint-preset-normal/.eslintrc.js'),
          getPath('node_modules/elint-preset-normal/.stylelintrc.js'),
          getPath('node_modules/@scope/elint-preset-scope/index.js'),
          getPath('node_modules/@scope/elint-preset-scope/.eslintrc.js'),
          getPath('node_modules/@scope/elint-preset-scope/.stylelintrc.js'),
          getPath('bower_components/a.js')
        ]
      };

      createIgnoreFile('');

      return walker('**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });

    it('单条忽略测试', function () {
      const result = {
        style: [],
        es: [
          getPath('app/c.js'),
          getPath('src/a.js'),
          getPath('src/lib/b.js'),
          getPath('bower_components/a.js')
        ]
      };

      createIgnoreFile('**/node_modules/**');

      return walker('**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });

    it('多条忽略测试', function () {
      const result = {
        style: [],
        es: [
          getPath('app/c.js'),
          getPath('bower_components/a.js')
        ]
      };

      createIgnoreFile('**/node_modules/**\n**/src/**');

      return walker('**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });

    it('注释测试', function () {
      const result = {
        style: [],
        es: [
          getPath('app/c.js'),
          getPath('bower_components/a.js')
        ]
      };

      createIgnoreFile('**/node_modules/**\n**/src/**\n#**/app/**');

      return walker('**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });
  });
});
