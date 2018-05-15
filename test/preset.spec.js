'use strict';

const path = require('path');
const unmock = require('./mock')();
const { normalize, verify, getPreset } = require('../lib/preset');
const { nodeModulesDir } = require('../lib/utils/env');

const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();

describe('Preset 测试', function () {

  after(() => unmock);

  describe('# Normalize 测试', function () {
    it('空测试', function () {
      const name1 = undefined;
      const name2 = '';

      return should.not.exist(normalize(name1))
        && normalize(name2).should.equal(name2);
    });

    it('正常情况', function () {
      return normalize('name').should.equal('elint-preset-name')
        && normalize('elint-preset-name').should.equal('elint-preset-name')
        && normalize('elint-preset-na-me').should.equal('elint-preset-na-me');
    });
  });

  describe('# Verify 测试', function () {
    it('不存在的 preset', function () {
      return verify('name1').should.equal(false)
        && verify('name2').should.equal(false);
    });

    it('存在的 preset', function () {
      return verify('elint-preset-normal').should.equal(true);
    });
  });

  describe('# GetPreset 测试', function () {
    it('空测试', function () {
      return should.not.exist(getPreset())
        && should.not.exist(getPreset(''));
    });

    it('正常情况', function () {
      const result1 = {
        stylelint: path.join(nodeModulesDir, 'elint-preset-normal/stylelint.json'),
        eslint: path.join(nodeModulesDir, 'elint-preset-normal/eslint.json')
      };

      const result2 = {
        stylelint: path.join(nodeModulesDir, 'elint-preset-node/stylelint.json'),
        eslint: path.join(nodeModulesDir, 'elint-preset-node/eslint.json')
      };

      return getPreset('normal').should.deep.equal(result1)
        && getPreset('elint-preset-normal').should.deep.equal(result1)
        && getPreset('node').should.deep.equal(result2)
        && getPreset('elint-preset-node').should.deep.equal(result2);
    });
  });

});
