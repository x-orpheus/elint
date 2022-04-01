module.exports = {
  configFiles: [
    '.husky',
    '.eslintrc.js',
    '.eslintignore',
    '.prettierrc.js',
    '.commitlintrc.js'
  ],
  plugins: [
    'elint-plugin-eslint',
    'elint-plugin-stylelint',
    'elint-plugin-prettier',
    'elint-plugin-commitlint'
  ],
  eslint: require.resolve('./configs/eslint')
}
