import { execa } from 'execa'

// 执行命令
function run(command, cwd, { stdio = 'inherit', disableNotifier = true } = {}) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const strs = command.match(/(?:[^\s"]+|"[^"]*")+/g)

  let program = strs[0]
  const argus = strs.slice(1).reduce((pv, s) => {
    if (/^".+"$/.test(s) && /^--?/.test(pv[pv.length - 1])) {
      return pv.concat(s.slice(1, -1))
    }

    return pv.concat(s)
  }, [])

  if (process.platform === 'win32' && program === 'node') {
    program = 'cmd'
    argus.unshift('/d /s /c')
  }

  console.log(`run: ${program} ${argus.join(' ')}, in ${cwd}`)

  return execa(program, argus, {
    stdio,
    cwd,
    env: {
      INIT_CWD: cwd,
      FORCE_COLOR: true,
      ELINT_DISABLE_UPDATE_NOTIFIER: disableNotifier
    }
  })
}

export default run
