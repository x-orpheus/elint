# Contributing

## 依赖安装

使用 `pnpm` v9 安装依赖

```bash
# 第一次安装时忽略 scripts，因为 prepare 钩子会调用 elint 的方法
pnpm install --ignore-scripts

# 编译项目
pnpm run build

# 用于执行 elint prepare 命令，完成配置文件移动和插件初始化
pnpm install
```

## 运行

1. 使用编译后的 elint lint 项目本身 `pnpm run lint`
2. 运行 elint 源码 lint 项目本身 `pnpm run start`
3. 执行全部测试 `pnpm run test`
4. 执行 elint 单元测试 `pnpm --filter elint run test:unit`
5. 执行 elint 系统测试 `pnpm --filter elint run test:system`
