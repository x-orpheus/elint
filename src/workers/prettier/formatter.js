const chalk = require('chalk')

function formatter(messages) {
  if (!messages) {
    return '\n'
  }
  if (!messages.length) {
    return `  ${chalk.green.bold('✔')}  文件已格式化\n`
  }
  return messages
    .map((message) => {
      let output = `${message.filename}\n`
      switch (message.level) {
        case 'warn':
          output += `  ${chalk.yellow.bold('!')}`
          break
        case 'error':
          output += `  ${chalk.red.bold('✖')}`
          break
      }
      output += `  ${message.text}\n`
      return output
    })
    .join('\n')
}

module.exports = formatter
