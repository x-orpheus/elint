'use strict';

const debug = require('debug')('elint:preset:diff');
const fs = require('fs-extra');
const path = require('path');
const jsDiff = require('diff');
const chalk = require('chalk');
const findConfigFiles = require('./findConfigFiles');
const { baseDir } = require('../utils/env');

function getConfigFiles() {
  const configFiles = findConfigFiles(baseDir);
  const result = [];

  configFiles.forEach(configFile => {
    const fileParsedObj = path.parse(configFile);
    const newFileName = `${fileParsedObj.name}${fileParsedObj.ext}`;
    const newFilePath = configFile;
    const oldFileName = `${fileParsedObj.name}.old${fileParsedObj.ext}`;
    const oldFilePath = path.join(baseDir, oldFileName);

    if (!fs.existsSync(oldFilePath)) {
      return;
    }

    const newFileContent = fs.readFileSync(newFilePath, { encoding: 'utf-8' });
    const oldFileContent = fs.readFileSync(oldFilePath, { encoding: 'utf-8' });

    result.push([
      {
        name: oldFileName,
        content: oldFileContent
      },
      {
        name: newFileName,
        content: newFileContent
      }
    ]);
  });

  return result;
}

function diff() {
  const files = getConfigFiles();

  debug('diff files: %o', files);

  const output = [];

  files.forEach(f => {
    const result = jsDiff.structuredPatch(f[0].name, f[1].name, f[0].content, f[1].content);

    debug('diff result: %o', result);

    output.push('-------------------------------------------------\n');
    // eslint-disable-next-line max-len
    output.push(`compare ${chalk.red(result.oldFileName)} with ${chalk.green(result.newFileName)}\n`);
    output.push('-------------------------------------------------\n');

    result.hunks.forEach(hunk => {
      const lines = hunk.lines.map(line => {
        if (line.startsWith('+')) {
          return chalk.green(line);
        }
        if (line.startsWith('-')) {
          return chalk.red(line);
        }
        return line;
      });

      output.push(lines.join('\n'));
      output.push('\n');
    });

    output.push('\n');
  });

  console.log(output.join(''));
}

module.exports = diff;
