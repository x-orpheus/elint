# @elint/plugin-stylelint

elint 的 [Stylelint](https://stylelint.io/) 插件

## 配置 preset

1. 安装依赖 `@elint/plugin-stylelint`、`stylelint`

2. 配置 `index.js`

```javascript
module.exports = {
  plugins: ['@elint/plugin-stylelint']
}
```

3. 添加配置文件

https://stylelint.io/user-guide/configure

## 预处理器或其他文件中的 CSS

根据 stylelint 的升级指南 [Migrating to 14.0](https://stylelint.io/migration-guide/to-14)，stylelint 14 以后不再内置语法处理器，因此需要在 preset 中安装对应处理器依赖

例如支持 `.less`，需要安装 `postcss-less` 依赖，并在规则中指定 `customSyntax: require('postcss-less')`

插件默认激活的扩展名有 `['.less', '.sass', '.scss', '.css']`，如果希望使用其他语言或者 CSS-in-JS，需要额外在 preset 配置中覆盖插件的激活配置（注意上面提到的语法处理器也需要正确配置）

一个 CSS-in-JS 的例子：

```javascript
module.exports = {
  plugins: ['@elint/plugin-stylelint'],
  overridePluginConfig: {
    '@elint/plugin-stylelint': {
      activateConfig: {
        extensions: ['.jsx', '.tsx']
      }
    }
  }
}
```
