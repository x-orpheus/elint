export interface ElintCliLintOptions {
  fix?: boolean
  cache?: boolean
  cacheLocation?: string
  preset?: string
  ignore?: boolean
  notifier?: boolean
  forceNotifier?: boolean
  git?: boolean
}

export interface ElintCliPrepareOptions {
  preset?: string
  project?: string
}

export interface ElintCliResetOptions {
  preset?: string
  cacheLocation?: string
}

export interface ElintCliInvalidOptions {
  version?: boolean
}
