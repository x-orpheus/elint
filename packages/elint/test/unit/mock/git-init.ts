import { execa } from 'execa'
import { getBaseDir } from '../../../src/env.js'

async function gitInit() {
  const options = {
    cwd: getBaseDir()
  }

  await execa('git', ['init'], options)
  await execa('git', ['config', 'core.autocrlf', 'false'], options)
  // avoid sgf error when init git
  await execa(
    'git',
    ['commit', '--allow-empty', '-m', '"initial empty commit"'],
    options
  )
  await execa('git', ['add', '.'], options)
}

export default gitInit
