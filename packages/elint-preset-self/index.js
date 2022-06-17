module.exports = {
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
