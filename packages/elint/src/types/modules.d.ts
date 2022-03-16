declare module 'staged-git-files' {
  type SgfStatus =
    | 'Added'
    | 'Copied'
    | 'Deleted'
    | 'Modified'
    | 'Renamed'
    | 'Type-Changed'
    | 'Unmerged'
    | 'Unknown'

  type SgfItem = {
    filename: string
    status: SgfStatus
  }

  interface StagedGitFiles {
    (callback: (error?: unknown, result: SgfItem[]) => void): void
    (): Promise<SgfItem[]>
    cwd: string
    includeContent: boolean
    debug: boolean
  }

  const sgf: StagedGitFiles

  export default sgf
}
