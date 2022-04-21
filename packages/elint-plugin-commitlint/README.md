# elint-plugin-commitlint

elint 的 [commitlint](https://commitlint.js.org/#/) 插件

## 配置 preset

1. 安装依赖 `elint-plugin-commitlint`、`@commitlint/core`

2. 配置 `index.js`

```javascript
module.exports = {
  plugins: ['elint-plugin-commitlint']
}
```

3. 添加配置文件

https://commitlint.js.org/#/reference-configuration

## 执行

`elint-plugin-commitlint` 属于 `common` 类的插件，可以通过 `elint lint common` 或 `elint lint commit` 执行，默认总是激活态
