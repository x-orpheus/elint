import log from '../utils/log.js'

export function logErrorMap(
  errorMap: Record<string, unknown>,
  presetName: string,
  event: string
) {
  if (Object.keys(errorMap).length === 0) {
    log.success(`[elint] preset ${presetName} ${event} successfully`)
  } else {
    Object.entries(errorMap).forEach(([pluginId, error]) => {
      log.error(`[elint] preset ${presetName} ${event} with error`)
      log.error(` ${pluginId} error: `, error)
    })

    process.exit(1)
  }
}
