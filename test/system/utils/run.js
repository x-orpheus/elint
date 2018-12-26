'use strict'

const execa = require('execa')

// 执行命令
function run (command, cwd, sync = false) {
  const strs = command.match(/(?:[^\s"]+|"[^"]*")+/g)
  const method = sync ? execa.sync : execa

  let program = strs[0]
  const argus = strs.slice(1).map(s => {
    if (/^".+"$/.test(s)) {
      return s.slice(1, -1)
    }

    return s
  })

  if (process.platform === 'win32' && program === 'node') {
    program = 'cmd'
    argus.unshift('/d /s /c')
  }

  const env = Object.assign({}, process.env, {
    INIT_CWD: cwd,
    FORCE_COLOR: true
  })

  console.log(`run: ${program} ${argus.join(' ')}, in ${cwd}`)
  return method(program, argus, {
    stdio: 'inherit',
    cwd,
    env
  })
}

module.exports = run
