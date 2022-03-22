import _ from 'lodash'
import path from 'node:path'
import { elintWorkerEsLint } from './eslint'
import { elintWorkerPrettier } from './prettier'
import { elintWorkerStylelint } from './stylelint'
import { elintWorkerCommitLint } from './commitlint'
import type {
  ElintWorker,
  ElintWorkerActivateType,
  ElintWorkerLinter,
  ElintWorkerFormatter,
  ElintWorkerActivateOption
} from './types'

/**
 * 内置 worker
 */
export const builtInWorkers: Record<string, ElintWorker<unknown>> = {
  'elint-worker-eslint': elintWorkerEsLint,
  'elint-worker-stylelint': elintWorkerStylelint,
  'elint-worker-prettier': elintWorkerPrettier,
  'elint-worker-commitlint': elintWorkerCommitLint
}

const loadElintWorker = (name: string): ElintWorker<unknown> | null => {
  if (builtInWorkers[name]) {
    return builtInWorkers[name]
  }

  // 暂时不支持外部 worker
  return null
}

export const loadElintWorkers = (names: string[]) => {
  const workers = names
    .map((name) => loadElintWorker(name))
    .filter((worker): worker is ElintWorker<unknown> => !!worker)

  return workers
}

type ElintWorkerGroup<T extends string> = {
  [key in T]: ElintWorker<unknown>[]
}

export const groupElintWorkersByActivateType = (
  workers: ElintWorker<unknown>[]
) => {
  return _.groupBy(
    workers,
    (worker) => worker.activateConfig.type
  ) as ElintWorkerGroup<ElintWorkerActivateType>
}

type ElintWorkerGroupByType = {
  linter: ElintWorkerLinter<unknown>[]
  formatter: ElintWorkerFormatter<unknown>[]
}

export const groupElintWorkersByType = (workers: ElintWorker<unknown>[]) => {
  return _.groupBy(workers, (worker) => worker.type) as ElintWorkerGroupByType
}

export const checkElintWorkerActivation = (
  worker: ElintWorker<unknown>,
  option: ElintWorkerActivateOption
) => {
  if (worker.activateConfig.activate) {
    return worker.activateConfig.activate(option)
  }

  if (option.filePath && worker.activateConfig.extensions?.length) {
    if (
      worker.activateConfig.extensions.includes(path.extname(option.filePath))
    ) {
      return true
    }
  }

  return false
}
