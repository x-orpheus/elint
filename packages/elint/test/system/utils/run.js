import { execa } from 'execa'

// 执行命令
/**
 * @param {string} command
 * @param {string} cwd
 */
function run(
  command,
  cwd,
  { stdio = 'inherit', disableNotifier = true, customEnv } = {}
) {
  const strs = command.match(/(?:[^\s"]+|"[^"]*")+/g)

  if (!strs) {
    throw new Error('command error')
  }

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    env: {
      INIT_CWD: cwd,
      FORCE_COLOR: true,
      ELINT_DISABLE_UPDATE_NOTIFIER: disableNotifier,
      ...customEnv
    }
  })
}

export default run
