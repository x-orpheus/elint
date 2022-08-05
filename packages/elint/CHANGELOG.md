# elint

## 3.0.0-beta.2

### Patch Changes

- - 插件的依赖改为从 preset 所在位置引入，避免出现多个依赖版本共存时引入错误的版本
  - lint 时不读取二进制文件
  - 修复控制台 log 换行
  - 修复 prettier 错误数量统计

## 3.0.0-beta.0

### Major Changes

- Node.js 最小支持版本为 v14
- 升级为 esm
- 使用 TypeScript 重构
- 新增插件系统,将 lint 功能与项目解耦
- 升级 preset 结构
- 支持缓存
