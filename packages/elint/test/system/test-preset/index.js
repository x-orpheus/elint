module.exports = {
  configFiles: [
    '.husky',
    '.eslintrc.js',
    '.eslintignore',
    '.prettierrc.js',
    '.commitlintrc.js',
    '.stylelintrc.js'
  ],
  plugins: [
    '@elint/plugin-eslint',
    '@elint/plugin-stylelint',
    '@elint/plugin-prettier',
    '@elint/plugin-commitlint'
  ],
  configs: {
    eslint: require.resolve('./configs/eslint')
  }
}
