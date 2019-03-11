/**
 * from https://github.com/sindresorhus/is-npm
 *
 * is-npm 3.0 要求 Node.js >= 8，同时调整了调用方式，代码很简单，改到本地 utils
 */

module.exports =
  'npm_config_username' in process.env ||
  'npm_package_name' in process.env ||
  'npm_config_heading' in process.env
