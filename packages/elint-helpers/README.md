# elint-helpers

elint 的 preset 安装器，会将 preset 内携带的配置文件复制到根项目中

默认会复制 ESLint、Stylelint、commitlint、Prettier 和 husky（包含新版和旧版）的配置文件和对应的 ignore 文件

## 自定义复制文件

修改 preset `index.js` 中 `configFiles`，注意，当此值配置以后，将会忽略默认的复制配置

```javascript
module.exports = {
  configFiles: ['xxx.js']
}
```

### CLI参数

- `--preset <presetPath>`:
  preset 路径，默认为 `process.cwd()`
- `--project <projectPath>`:
  项目路径，默认为从 `process.cwd()` 起最近的一个 `node_modules` 上层路径（当在 yarn pnp 环境下，取最近的 `.yarn` 上层）路径

## API

```typescript
export interface InstallOptions {
    presetPath?: string;
    projectPath?: string;
}
export declare function install({ presetPath, projectPath }?: InstallOptions): void;
```