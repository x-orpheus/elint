'use strict';

const exec = require('child_process').exec;

exec('npm -v', function (err, stdout, stderr) {
  if (err || stderr) {
    console.error(err || stderr);
    process.exit(1);
  }

  const version = stdout.trim();
  const versions = version.split('.');
  const major = +versions[0];
  const minor = +versions[1];

  if ((major === 5 && minor >= 4) || (major === 6 && minor < 1)) {
    console.error();
    console.error(`  elint 在当前的 npm 版本下（${version}）无法正常运行，请升级 npm 后再安装。`);
    console.error('  更多信息请访问：http://dwz.cn/8bkKLP');
    console.error();

    process.exit(1);
  }

  process.exit(0);
});
