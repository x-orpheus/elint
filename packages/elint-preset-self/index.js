module.exports = {
  configs: [
    '.eslintrc.js',
    '.eslintignore',
    '.prettierrc.js',
    '.commitlintrc.js'
  ],
  plugins: [
    'elint-plugin-eslint',
    'elint-plugin-stylelint',
    'elint-plugin-prettier'
  ],
  eslint: require.resolve('./configs/eslint')
}
