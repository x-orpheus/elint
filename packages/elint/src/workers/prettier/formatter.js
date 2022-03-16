const chalk = require('chalk')

function formatter (messages) {
  if (!messages || !messages.length) {
    return ''
  }
  return messages
    .map((message) => {
      let output = `${chalk.underline(message.filename)}\n`
      switch (message.level) {
        case 'warn':
          output += `   ${chalk.yellow.bold('!')}`
          break
        case 'error':
          output += `   ${chalk.red.bold('✖')}`
          break
      }
      output += `  ${message.text}\n`
      return output
    })
    .join('\n')
}

module.exports = formatter
