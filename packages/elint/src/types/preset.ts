export interface ElintPreset {
  /**
   * 需要移动到根目录的的配置文件
   *
   * 例如 `.eslintrc`, `.prettierrc`
   */
  configFiles?: string[]
  /**
   * 启用的 plugin 名称
   */
  plugins: string[]
  /**
   * 各种工具的自定义配置放在这里
   */
  configs?: {
    [key: string]: unknown
  }
}
