'use strict'

/**
 * 处理 npm option
 * "saveDev" => "--save-dev"
 *
 * @param {string} option option
 * @return {string} parsed option
 */
function parseNpmOption (option) {
  if (!option || typeof option !== 'string') {
    return option
  }

  const parsedOption = option.replace(/([A-Z])/g, (match, p) => {
    return `-${p.toLowerCase()}`
  })

  return `--${parsedOption}`
}

module.exports = parseNpmOption
