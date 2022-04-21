# elint-plugin-prettier

elint 的 [Prettier](https://prettier.io/) 插件

## 配置 preset

1. 安装依赖 `elint-plugin-prettier`、`prettier`

2. 配置 `index.js`

```javascript
module.exports = {
  plugins: ['elint-plugin-prettier']
}
```

3. 添加配置文件

https://prettier.io/docs/en/configuration.html

> 注意：此插件总是会忽略 `EditorConfig` 配置

## 调整格式化检查的文件范围

此插件默认激活的扩展名为以下列表，如果想修改可以通过配置 `overridePluginConfig` 进行修改

```json
[
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".css",
  ".less",
  ".sass",
  ".scss",
  ".md",
  ".mdx",
  ".json",
  ".vue",
  ".yml"
]
```
