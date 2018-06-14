'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');
const { version } = require('../../package.json');

const mocha = require('mocha');
const chai = require('chai');
chai.should();

function run(command, cwd) {
  const strs = command.match(/(?:[^\s"]+|"[^"]*")+/g);
  const program = strs[0];
  const argus = strs.slice(1).map(s => {
    if (/^".+"$/.test(s)) {
      return s.slice(1, -1);
    }

    return s;
  });

  console.log(`run: ${program} ${argus.join(' ')}, in ${cwd}`);
  execa.sync(program, argus, {
    stdio: 'inherit',
    cwd
  });
}

let elintPath = path.join(__dirname, '../../');
let elintPkgPath = path.join(elintPath, `elint-${version}.tgz`);

let presetPath = path.join(__dirname, 'test-preset');
let presetPkgPath = path.join(presetPath, 'elint-preset-system-test-1.0.0.tgz');

// elint 打包
run('npm pack', elintPath);

// preset 打包
run('npm pack', presetPath);

// 系统测试
describe('系统测试', function () {
  // timeout 5min
  this.timeout(5 * 60 * 1000);

  // 临时目录
  let tempDir;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `elint_test_system_${Date.now()}`);
    const testProjectDir = path.join(__dirname, 'test-project');

    // 创建测试项目
    fs.copySync(testProjectDir, tempDir);

    /**
     * moch env.js baseDir
     */
    process.env.INIT_CWD = tempDir;
  });

  // 清理
  afterEach(() => {
    fs.removeSync(tempDir);
  });

  describe('安装', function () {
    let elintrcPath;
    let stylelintrcPath;

    beforeEach(() => {
      elintrcPath = path.join(tempDir, '.eslintrc.js');
      stylelintrcPath = path.join(tempDir, '.stylelintrc.js');
    });

    it('先安装 elint，再安装 preset', function () {
      run(`npm install ${elintPkgPath}`, tempDir);
      run(`npm install ${presetPkgPath}`, tempDir);

      fs.existsSync(elintPath).should.be.equal(true);
      fs.existsSync(stylelintrcPath).should.be.equal(true);
    });

    it('先安装 preset，再安装 elint', function () {
      run(`npm install ${presetPkgPath}`, tempDir);
      run(`npm install ${elintPkgPath}`, tempDir);

      fs.existsSync(elintPath).should.be.equal(true);
      fs.existsSync(stylelintrcPath).should.be.equal(true);
    });

    it('同时安装', function () {
      run(`npm install ${presetPkgPath} ${elintPkgPath}`, tempDir);

      fs.existsSync(elintPath).should.be.equal(true);
      fs.existsSync(stylelintrcPath).should.be.equal(true);
    });
  });

  describe('功能测试', function () {
    beforeEach(() => {
      run(`npm install ${presetPkgPath} ${elintPkgPath}`, tempDir);
    });

    it('lint', function () {
      (function () {
        run('npm run lint-without-fix', tempDir);
      }).should.throw();
    });

    it('lint --fix', function () {
      run('npm run lint-fix', tempDir);
    });

    it('lint es', function () {
      (function () {
        run('npm run lint-es-without-fix', tempDir);
      }).should.throw();
    });

    it('lint es --fix', function () {
      run('npm run lint-es-fix', tempDir);
    });

    it('lint style', function () {
      (function () {
        run('npm run lint-style-without-fix', tempDir);
      }).should.throw();
    });

    it('lint style --fix', function () {
      run('npm run lint-style-fix', tempDir);
    });

    it('version', function () {
      run('npm run version', tempDir);
    });

    it('diff', function () {
      const elintrcPath = path.join(tempDir, '.eslintrc.js');
      const elintrcOldPath = path.join(tempDir, '.eslintrc.old.js');

      fs.copyFileSync(elintrcPath, elintrcOldPath);
      fs.appendFileSync(elintrcOldPath, 'console.log(1)');

      run('npm run diff', tempDir);
    });
  });

  describe('git 相关测试', function () {
    let hooksPath;

    beforeEach(() => {
      run('git init', tempDir);
      run(`npm install ${presetPkgPath} ${elintPkgPath}`, tempDir);
      hooksPath = path.join(tempDir, '.git/hooks');
    });

    it('hooks install && uninstall', function () {
      let hooks;

      run('npm run hooks-uninstall', tempDir);

      // eslint-disable-next-line max-nested-callbacks
      hooks = fs.readdirSync(hooksPath).filter(p => !p.includes('.sample'));
      hooks.length.should.be.equal(0);

      run('npm run hooks-install', tempDir);

      // eslint-disable-next-line max-nested-callbacks
      hooks = fs.readdirSync(hooksPath).filter(p => !p.includes('.sample'));
      hooks.length.should.be.above(0);
    });

    it('lint commit(error)', function () {
      run('git add package.json', tempDir);

      (function () {
        run('git commit -m "hello"', tempDir);
      }).should.throw();
    });

    it('lint commit(success)', function () {
      run('git add package.json', tempDir);
      run('git commit -m "build: hello"', tempDir);
    });
  });
});
