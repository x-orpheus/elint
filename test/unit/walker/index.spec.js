'use strict';

const fs = require('fs-extra');
const path = require('path');
const mock = require('../mock/env');
const { getBaseDir } = require('../../../src/env');
const runInHusky = require('../mock/run-in-husky');
const walker = require('../../../src/walker');
const walkerPath = require.resolve('../../../src/walker');

const mocha = require('mocha');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
chai.should();
chai.use(deepEqualInAnyOrder);
chai.use(chaiAsPromised);

let unmock;
let baseDir;
let getPath;

describe('Walker 测试', function () {

  beforeEach(() => {
    unmock = mock();
    baseDir = getBaseDir();
    getPath = p => {
      return path.join(baseDir, p);
    };
  });

  afterEach(() => {
    unmock();
  });

  describe('功能测试', function () {
    it('空测试', function () {
      return walker().should.eventually.deep.equal({
        es: [],
        style: []
      });
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

  describe('Ignore 功能测试', function () {
    let ignoreFilePath;

    beforeEach(() => {
      ignoreFilePath = path.join(baseDir, '.elintrc.js');
    });

    const createIgnoreFile = content => {
      fs.ensureFileSync(ignoreFilePath);

      if (content) {
        fs.appendFileSync(ignoreFilePath, content);
      }
    };

    it('文件不存在，使用默认忽略规则', function () {
      const result = {
        es: [
          getPath('src/a.js'),
          getPath('src/lib/b.js'),
          getPath('app/c.js')
        ],
        style: []
      };

      return walker('**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });

    it('文件存在，为空，使用默认忽略规则', function () {
      const result = {
        es: [
          getPath('app/c.js'),
          getPath('src/a.js'),
          getPath('src/lib/b.js'),
          getPath('.elintrc.js')
        ],
        style: []
      };

      createIgnoreFile();

      return walker('**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });

    it('文件存在，不为空，无 ignore 属性，使用默认忽略规则', function () {
      const result = {
        es: [
          getPath('app/c.js'),
          getPath('src/a.js'),
          getPath('src/lib/b.js'),
          getPath('.elintrc.js')
        ],
        style: []
      };

      createIgnoreFile('module.exports={};');

      return walker('**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });

    it('文件存在，不为空，有 ignore 属性', function () {
      const result = {
        es: [
          getPath('app/c.js'),
          getPath('src/a.js'),
          getPath('src/lib/b.js'),
          getPath('.elintrc.js')
        ],
        style: []
      };

      // eslint-disable-next-line max-len
      createIgnoreFile('module.exports={ ignore: ["**/node_modules/**", "**/bower_components/**"]};');

      return walker('**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });

    it('文件存在，不为空，有 ignore 属性, --no-ignore', function () {
      const result = {
        es: [
          getPath('app/c.js'),
          getPath('src/a.js'),
          getPath('src/lib/b.js'),
          getPath('.elintrc.js'),
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
        ],
        style: []
      };

      // eslint-disable-next-line max-len
      createIgnoreFile('module.exports={ ignore: ["**/node_modules/**", "**/bower_components/**"]};');

      return walker('**/*.js', { noIgnore: true }).should.eventually.deep.equalInAnyOrder(result);
    });

    it('单条忽略测试', function () {
      const result = {
        es: [
          getPath('app/c.js'),
          getPath('src/a.js'),
          getPath('src/lib/b.js'),
          getPath('.elintrc.js'),
          getPath('bower_components/a.js')
        ],
        style: []
      };

      createIgnoreFile('module.exports={ ignore: ["**/node_modules/**"]};');

      return walker('**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });

    it('多条忽略测试', function () {
      const result = {
        es: [
          getPath('app/c.js'),
          getPath('bower_components/a.js'),
          getPath('.elintrc.js')
        ],
        style: []
      };

      createIgnoreFile('module.exports={ ignore: ["**/node_modules/**", "**/src/**"]};');

      return walker('**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });

    it('ignore 非数组', function () {
      const result = {
        es: [
          getPath('app/c.js'),
          getPath('src/a.js'),
          getPath('src/lib/b.js'),
          getPath('.elintrc.js'),
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
        ],
        style: []
      };

      createIgnoreFile('module.exports={ ignore: "**/node_modules/**"};');

      return walker('**/*.js').should.eventually.deep.equalInAnyOrder(result);
    });
  });

});
