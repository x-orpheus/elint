'use strict';

const co = require('co');
const _ = require('lodash');
const walker = require('./walker');
const report = require('./utils/report');
const eslint = require('./works/eslint');
const stylelint = require('./works/stylelint');

/**
 * 主函数
 *
 * @param {string[]} files 待执行 lint 的文件
 * @param {string} [type] lint type
 * @returns {void}
 */
function elint(files, type) {
  co(function* () {
    const fileList = yield walker(files);

    // 没有匹配到任何文件，直接退出
    if (!fileList.es.length && !fileList.style.length) {
      process.exit();
    }

    const linters = {
      es: eslint,
      style: stylelint
    };

    let works = [];
    if (type) {
      works.push(linters[type](...fileList[type]));
    } else {
      // 兼容 node v6
      _.toPairs(linters).forEach(([linterType, linter]) => {
        works.push(linter(...fileList[linterType]));
      });
    }

    Promise.all(works).then(results => {
      const outputs = [];
      let success = true;

      results.forEach(result => {
        const output = JSON.parse(result.stdout);
        outputs.push(output);
        success = success && output.success;
      });

      report(outputs);

      process.exit(success ? 0 : 1);
    });
  });
}

module.exports = elint;
