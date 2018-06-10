// 'use strict';

// const mock = require('../mock/env');
// const { getBaseDir } = require('../../src/env');
// const runInHusky = require('../mock/run-in-husky');
// const isGitHooks = require('../../src/utils/is-git-hooks');

// const mocha = require('mocha');
// const chaiAsPromised = require('chai-as-promised');
// const chai = require('chai');
// const should = chai.should();
// chai.use(chaiAsPromised);

// let unmock;

// describe('is-git-hooks 测试', function () {

//   before(() => {
//     unmock = mock();
//   });

//   after(unmock);

//   it('非 husky 环境', function () {
//     return isGitHooks().should.eventually.equal(false);
//   });

//   it('husky 环境', function () {
//     const baseDir = getBaseDir();
//     const isGitHooksPath = require.resolve('../../src/utils/is-git-hooks');
//     const tmpl = `return require('${isGitHooksPath}');`;

//     return runInHusky(baseDir, tmpl).should.eventually.equal(true);
//   });

// });
