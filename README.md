# ELint

[![Node engine][node-image]][node-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Dependencies Status][dependencies-image]][dependencies-url]
[![Lgtm Alerts][lgtm-alerts-image]][lgtm-alerts-url]
[![Lgtm Grade][lgtm-grade-image]][lgtm-grade-url]

|                         unit                          |                           system                            |
| :---------------------------------------------------: | :---------------------------------------------------------: |
| [![unit test status][unit-test-image]][unit-test-url] | [![system test status][system-test-image]][system-test-url] |

专为团队设计的 lint 工具

**目录**：

<!-- TOC -->

- [ELint](#elint)
  - [1. 核心概念](#1-核心概念)
    - [1.1. ELint](#11-elint)
    - [1.2. Plugin](#12-plugin)
      - [1.2.1. 官方插件](#121-官方插件)
    - [1.3. Preset](#13-preset)
  - [2. 使用指南](#2-使用指南)
    - [2.1. 安装 elint](#21-安装-elint)
    - [2.2. 编写 preset](#22-编写-preset)
      - [2.2.1. 新建一个 npm package](#221-新建一个-npm-package)
      - [2.2.2. 安装 elint-helpers](#222-安装-elint-helpers)
      - [2.2.3. 配置入口文件](#223-配置入口文件)
      - [2.2.4. 配置 eslint（可选）](#224-配置-eslint可选)
      - [2.2.5. 配置 stylelint （可选）](#225-配置-stylelint-可选)
      - [2.2.6. 配置 prettier （可选）](#226-配置-prettier-可选)
      - [2.2.7. 配置 commitlint（可选）](#227-配置-commitlint可选)
      - [2.2.8. 支持 git hooks（可选）](#228-支持-git-hooks可选)
      - [2.2.9. 设置更新检测周期（可选）](#229-设置更新检测周期可选)
      - [2.2.10. 自定义配置文件复制列表](#2210-自定义配置文件复制列表)
      - [2.2.11. 覆盖插件配置](#2211-覆盖插件配置)
      - [2.2.12. 发布 npm package](#2212-发布-npm-package)
    - [2.3. 安装 preset](#23-安装-preset)
    - [2.4. 定义 npm scripts](#24-定义-npm-scripts)
      - [2.4.1. 安装 git hooks](#241-安装-git-hooks)
      - [2.4.2. npm test](#242-npm-test)
      - [2.4.3. npm beforecommit](#243-npm-beforecommit)
    - [2.5. 本地 preset](#25-本地-preset)
  - [3. ELint CLI](#3-elint-cli)
    - [3.1. lint](#31-lint)
    - [3.2. hooks](#32-hooks)
    - [3.3. version](#33-version)
    - [3.4. reset](#34-reset)
  - [4. 插件](#4-插件)
    - [4.1. 插件类型](#41-插件类型)
    - [4.2. 编写一个插件](#42-编写一个插件)
  - [5. 细节 & 原理](#5-细节--原理)
    - [5.1. 安装 & 初始化过程](#51-安装--初始化过程)
    - [5.2. 执行过程](#52-执行过程)
  - [6. 常见问题](#6-常见问题)
    - [6.1. 使用旧版 `husky`](#61-使用旧版-husky)
    - [6.2. 配置文件是不是可以 git ignore](#62-配置文件是不是可以-git-ignore)
    - [6.3. 是否可以安装多个 preset](#63-是否可以安装多个-preset)
    - [6.4. 某些文件没有被校验到](#64-某些文件没有被校验到)
    - [6.5. 为什么添加了 fix 选项还是有问题输出](#65-为什么添加了-fix-选项还是有问题输出)
    - [6.6. 如何禁用颜色输出](#66-如何禁用颜色输出)
  - [7. 参考](#7-参考)

<!-- /TOC -->

## 1. 核心概念

在使用 ELint 之前，需要先了解几个核心概念。

### 1.1. ELint

elint 是一款代码校验工具，通过插件系统可以将 ESLint、Stylelint、commitlint、Prettier 等工具整合使用。Elint 本身不包含任何校验规则，而是通过 preset 定义各个 lint 工具的配置。elint 的主要功能包括：

- 支持对 js，css 的校验 (eslint, stylelint)。
- 支持对 git commit message 的校验 (husky, commitlint)。
- 支持对代码进行格式化 (prettier)。
- **编写**定制化、场景化的 preset，preset 包含所有验证规则，**保证团队内部校验规则的一致性和可复用**。

### 1.2. Plugin

ELint 3.0 后不再内部依赖 ESLint、Stylelint 等 lint 工具，对于这些工具的支持将由 elint 插件提供。

#### 1.2.1. 官方插件

| 名称                      | 依赖                             | 描述                                         |
| ------------------------- | -------------------------------- | -------------------------------------------- |
| `elint-plugin-commitlint` | `"@commitlint/core": ">=16.0.0"` | commitlint 插件，支持校验 git commit message |
| `elint-plugin-eslint`     | `"eslint": ">=8.0.0"`            | eslint 插件                                  |
| `elint-plugin-prettier`   | `"prettier": ">=2.0.0"`          | prettier 插件，检查代码格式                  |
| `elint-plugin-stylelint`  | `"stylelint": ">=14.0.0"`        | stylelint 插件                               |

### 1.3. Preset

简单来说，preset 就是一个 npm package，可以理解为”规则集“。

只有 elint 是不够的，因为它不知道具体的校验规则，而 preset 就是用来定义规则的。preset 大概长这样：

```shell
elint-preset-<name>
├── .husky
├── configs             # 存放真正规则文件的地方
├── node_modules        # 定义 git hooks
├── .commitlintrc.js    # 定义 commitlint 规则，用于 git commit message 的校验
├── .eslintignore       # 定义 eslint 忽略规则
├── .eslintrc.js        # 定义 eslint 规则，用于 js 的校验
├── index.js            # preset 配置
├── package.json
├── package-lock.json
├── .prettierignore     # 定义 prettier 忽略规则
├── .prettierrc.js      # 定义 prettier 的规则
├── .stylelintignore    # 定义 stylelint 忽略规则
└── .stylelintrc.js     # 定义 stylelint 的规则，用于 css 的校验
```

要求：

1. npm package name 需要以 `elint-preset-` 开头，如： `elint-preset-<name>` 或 `@team/elint-preset-<name>`。
2. 入口文件需要默认导出 preset 配置
3. preset 配置中需要配置启用的插件列表，并将插件和插件的依赖定义在 `dependencies` 中
4. preset 需要安装依赖 `elint-helpers` 并添加 postinstall scripts: `elint-helpers install`
5. lint 工具配置的依赖（例如 eslint-plugin-react），必须明确定义在 `package.json` 的 `dependencies` 中。

满足以上要求的 npm package 就是一个合法的 elint preset。

> 一般来说，不建议把 `.eslintignore`，`.stylelintignore`, `.prettierignore` 添加到 preset 中，因为 preset 应该对所有项目都是适用的（除非你的 preset 限定在一个很小的范围内使用，各个项目的目录结构都是一致的，此时可以使用它们来定义需要忽略校验的文件和文件夹）。

> 在 `package.json` 中添加关键字 `elint-preset` 会方便大家找到。[这里](https://npms.io/search?q=keywords%3Aelint-preset)可以查找现有的 preset。

> eslint, stylelint, commitlint, husky 等配置文件的语法规则，请阅读[参考](#7-参考)一节提供的文档。

> 如果仅为了测试或不方便发布 npm 包，可以参考 [本地 preset](#25-本地-preset) 的方法。

## 2. 使用指南

开始使用 elint 之前，请先检查下你使用 node 和 npm 版本。运行 elint 需要：

- node：`^14.13.1 || >=16.0.0`，建议尽量使用新版本。

下面我们一起从零开始，一步一步的看看如何将 elint 集成到项目中。

### 2.1. 安装 elint

首先要安装 elint：

```shell
# 假设项目是 test-project
cd test-project

# 安装 elint
npm install elint --save-dev
```

> 强烈**不建议**全局安装（具体原因，请阅读[常见问题](#52-为什么不建议全局安装)）。

### 2.2. 编写 preset

安装完 elint 后，我们需要安装 preset，因为启用插件和校验规则（rules）都定义在 preset 中。一般来说，一个团队应该有一套编码规范，根据编码规范编写好 preset 后，团队中的各个项目直接安装使用即可，不必为每个项目都新建一个 preset。

> 在一个团队里，可能一个 preset 并不能适应全部场景，那么我们可以根据不同的场景定义多个 preset。例如 `@team/elint-preset-h5`, `@team/elint-preset-node` 等。要覆盖所有项目，并不需要多少 preset。

这里我们假设团队还没有任何 preset，一起看下如何新建它：

#### 2.2.1. 新建一个 npm package

上文已经讲过了，preset 本质上还是一个 npm package，所以新建 preset 的第一步就是新建 npm package：

```shell
# 假设叫 elint-preset-test
mkdir elint-preset-test

cd elint-preset-test

# 为了方便演示，全部使用默认值，实际项目中酌情修改
npm init -y
```

#### 2.2.2. 安装 elint-helpers

preset 包需要安装 `elint-helpers`, 并添加 npm scripts 以完成初始化工作：

```shell
npm i elint-helpers
```

```json
{
  "scripts": {
    "postinstall": "elint-helpers install"
  }
}
```

#### 2.2.3. 配置入口文件

默认入口文件为 `index.js`

配置其内容为：

```javascript
module.exports = {
  plugins: [
    // ...插件列表
  ]
}
```

#### 2.2.4. 配置 eslint（可选）

> 这步是可选的，如果你不需要校验 js 文件，可以直接跳过（下同）

首先安装 `elint-plugin-eslint` 和插件的依赖 `eslint`：

```shell
npm i elint-plugin-eslint eslint
```

之后在入口文件 `index.js` 中添加插件名称：

```javascript
module.exports = {
  plugins: ['elint-plugin-eslint']
}
```

新建 eslint 配置文件，下文使用 `.eslintrc.js`

```shell
touch .eslintrc.js
```

`.eslintrc.js` 写入如下内容：

```js
module.exports = {
  rules: {
    // 禁止 console
    'no-console': 2
  }
}
```

**使用 eslint 插件或预设配置**

由于不同包管理器依赖安装和解析方式不同，如果配置中需要继承预设配置或者使用插件，直接写插件名可能出现在运行时无法找到对应依赖的错误。

因此推荐将 lint 工具的实际配置写在 preset 中并导出，并在复制到外层的 linter 配置文件中引入 preset 内的配置，可以参考 `elint-preset-self` 中 `eslint` 配置的处理方式。

#### 2.2.5. 配置 stylelint （可选）

首先安装 `elint-plugin-stylelint` 和插件的依赖 `stylelint`：

```shell
npm i elint-plugin-stylelint stylelint
```

之后在入口文件 `index.js` 中添加插件名称：

```javascript
module.exports = {
  plugins: ['elint-plugin-stylelint']
}
```

添加对应的 stylelint 配置

#### 2.2.6. 配置 prettier （可选）

首先安装 `elint-plugin-prettier` 和插件的依赖 `prettier`：

```shell
npm i elint-plugin-prettier prettier
```

之后在入口文件 `index.js` 中添加插件名称：

```javascript
module.exports = {
  plugins: ['elint-plugin-prettier']
}
```

添加对应的 prettier 配置

#### 2.2.7. 配置 commitlint（可选）

首先安装 `elint-plugin-commitlint` 和插件的依赖 `@commitlint/core`：

```shell
npm i elint-plugin-commitlint @commitlint/core
```

之后在入口文件 `index.js` 中添加插件名称：

```javascript
module.exports = {
  plugins: ['elint-plugin-commitlint']
}
```

新建配置文件 `.commitlintrc.js`：

```shell
touch .commitlintrc.js
```

`.commitlintrc.js` 写入如下内容：

```js
module.exports = {
  rules: {
    // type 不能为空
    'type-empty': [2, 'never'],
    // type 必须是 build 或 ci
    'type-enum': [2, 'always', ['build', 'ci']]
  }
}
```

#### 2.2.8. 支持 git hooks（可选）

通过命令添加 commit 信息校验 hook

```bash
npx husky add .husky/commit-msg "npm run beforecommit"
```

> 更多使用方式可以参考 `husky` 官方文档 [Create a hook](https://typicode.github.io/husky/#/?id=create-a-hook)，创建对应的 hooks

#### 2.2.9. 设置更新检测周期（可选）

从 1.10.0 版本开始，elint 支持更新检测功能，提示用户更新到新版本的 preset。

要开启此功能，只需在 preset 的 package.json 文件中添加如下配置：

```json
{
  "elint": {
    "updateCheckInterval": "3d"
  }
}
```

上述配置会让 elint 每三天检测一次是否有新版本 preset。

#### 2.2.10. 自定义配置文件复制列表

如果 preset 中使用了非官方支持的插件，需要将其配置文件移动到项目目录，可以配置入口文件：

```javascript
module.exports = {
  plugins: [
    /* ... */
  ],
  configFiles: ['xxx.js']
}
```

这样在安装 preset 时就会将 `xxx.js` 移动到项目目录

#### 2.2.11. 覆盖插件配置

elint 各个插件内部有一个默认的扩展名支持列表，但是这个列表不一定能满足各种场景（例如使用 `stylelint` 检测 JS 文件中的内联样式）。这种情况下可以配置 `overridePluginConfig`，用以覆盖某个插件的具体配置

```javascript
module.exports = {
  plugins: ['elint-plugin-stylelint'],
  overridePluginConfig: {
    'elint-plugin-stylelint': {
      activateConfig: {
        extensions: ['.js']
      }
    }
  }
}
```

#### 2.2.12. 发布 npm package

发布 npm package，执行：

```shell
npm publish
```

> 如果使用 `pnpm` 来发布包，需要将 `husky` 配置文件列表添加到 `publishConfig.executableFiles` 列表中，详情参考 [package.json | pnpm](https://pnpm.io/package_json#publishconfigexecutablefiles)

> 如果希望更多人发现你的 preset，可以添加关键字 `elint-preset`，[点击此处](https://npms.io/search?q=keywords%3Aelint-preset)可以查看现有可用的 preset。

### 2.3. 安装 preset

刚刚我们已经编写并发布了 preset，现在安装到项目中就好了：

```shell
cd test-project

# 安装我们刚才新建的 elint-preset-test
npm install elint-preset-test --save-dev
```

安装完成后，你会发现刚才定义在 preset 中的各种配置文件（`.eslintrc.js` 等），都拷贝到了项目的根目录，这是为了兼容各种 IDE 和 build 工具（如 webpack），elint 与他们是可以共存的。

### 2.4. 定义 npm scripts

#### 2.4.1. 安装 git hooks

`husky` 不再支持自动配置 git hooks，因此需要我们在项目的 `package.json` 中添加 `prepare` 定义

```json
{
  "scripts": {
    "prepare": "elint hooks install"
  }
}
```

注意：`Yarn 2` 不支持 `prepare` 生命周期，可以参考 [Yarn 2 | husky](https://typicode.github.io/husky/#/?id=yarn-2) 进行修改

#### 2.4.2. npm test

按照常规套路，需要在 `package.json` 中定义 `npm test`，如果项目只有 lint，可以这样写：

```json
{
  "scripts": {
    "test": "elint lint 'src/**/*.js' 'src/**/*.css'"
  }
}
```

如果除了 lint 还有其他测试，可以这样写：

```json
{
  "scripts": {
    "test": "npm run test:lint && npm run test:other",
    "test:lint": "elint lint 'src/**/*.js' 'src/**/*.css'",
    "test:other": "..."
  }
}
```

> 注意: glob 最好加上引号，详见 [ELint CLI](#31-lint)

#### 2.4.3. npm beforecommit

刚才编写 preset 的时候，定义了在 commit 前执行 `npm run beforecommit`，所以我们必须定义好 beforecommit，否则会**报错**：

```json
{
  "scripts": {
    "beforecommit": "npm run test:lint && elint lint commit",
    "test": "npm run test:lint && npm run test:other",
    "test:lint": "elint lint 'src/**/*.js' 'src/**/*.css'",
    "test:other": "..."
  }
}
```

按照上面的写法，commit 之前会执行校验代码和 commit message。至此，elint 已经成功添加到项目中，执行 `npm test` 会校验代码，在 commit 前会校验代码和 commit message

> 当 lint 运行在 git hooks 中时，文件的范围限定在 **git 暂存区**，也就是你将要提交的文件（详见 [ELint CLI](#31-lint)）。

### 2.5. 本地 preset

如果为了测试 elint 或迁移之前没有使用 elint 的项目，可以采用本地 preset 的方案。

在项目中创建一个 JS 文件作为 preset 配置，参考 2.2.3 - 2.2.8 完成对应的操作。在执行 lint 操作时，传入 `--preset` 参数指定本地的 preset 配置文件即可。

## 3. ELint CLI

### 3.1. lint

`lint` 命令用来执行代码校验和 git commit message 校验。当 lint 运行在 git hooks 中时，文件的搜索范围限定在 **git 暂存区**，也就是只从你将要 commit 的文件中，找到需要校验的文件，执行校验。

```shell
elint lint [options] [type] [files...]
```

type 可选的值：

- file: 检测文件
- commit: 检测提交信息
- common: 检测所有 common 类型的插件

如果不指定 type，默认执行检测文件

options 可选的值：

- -f, --fix: 自动修复错误
- --cache: 使用缓存
- --cache-location: 指定缓存位置
- --preset: 指定 preset 位置
- --no-ignore: 忽略 elint 遍历文件时的默认忽略规则
- --no-notifier: 忽略 preset 更新检查
- --force-notifier: 强制检查 preset 更新

当添加 `--fix` 时，会尝试自动修复问题，无法自动修复的问题依旧会输出出来。

例子：

```shell
# 校验 js 和 scss
$ elint lint "**/*.js" "**/*.scss"

# 校验 js 和 scss，执行自动修复
$ elint lint "**/*.js" "**/*.scss" --fix

# 校验 js
$ elint lint "**/*.js"

# 校验 less
$ elint lint "**/*.less"

# 校验 commit message
$ elint lint commit
```

**注意**:

当你在 Terminal（或者 npm scripts） 中运行 `elint lint **/*.js` 的时候，glob 会被 Terminal 解析，然后输入给 elint。glob 语法解析的差异可能会导致文件匹配的差异。所以建议，glob 使用引号包裹，防止在输入到 elint 前，被意外解析。

### 3.2. hooks

`hooks` 命令用来安装 & 卸载 git hooks：

```shell
elint hooks [action]
```

支持的 action：

- install: 安装
- uninstall: 卸载

例子：

```shell
$ elint hooks install
$ elint hooks uninstall
```

### 3.3. version

输出版本信息

```shell
$ elint -v
> elint version

    elint          : 3.0.0
    husky(builtIn) : 8.0.1

  Preset:

    elint-preset-self : unknown

  Plugins:

    elint-plugin-eslint     : 3.0.0
      eslint                : 8.16.0
    elint-plugin-stylelint  : 3.0.0
      stylelint             : 14.8.5
    elint-plugin-prettier   : 3.0.0
      prettier              : 2.6.2
    elint-plugin-commitlint : 3.0.0
      @commitlint/core      : 17.0.0
```

### 3.4. reset

`reset` 用于重置缓存，执行此命令将会清空 elint 缓存，同时如果插件配置了 `reset` 方法，也会同时执行。

## 4. 插件

### 4.1. 插件类型

插件分为三种类型：

- `formatter` 格式化工具，如 `prettier`
- `linter` lint 检查，如 `eslint`、`stylelint`
- `common` 公共检查工具，如 `commitlint`

其中 `formatter` 和 `linter` 是基于文件粒度，每个文件均会经过插件检查；而 `common` 是全局粒度，一次检查仅会执行一次

**`formatter` 的特殊行为**：格式化工具只能将代码格式化，自身没有检查的能力，因此当 `preset` 中使用了任意 `formatter` 时，会自动在所有 `formatter` 和 `linter` 执行结束后执行 elint 内部的插件 `builtIn:format-checker` 插件，判断代码是否被格式化

### 4.2. 编写一个插件

如果官方插件无法满足需求，例如需要支持旧版本 `eslint` 或添加其他文件的 lint 规则，可以自行编写一个插件。

```typescript
type Result = string
const elintPluginExample: ElintPlugin<Result> = {
  /**
   * plugin 名称(唯一)
   */
  id: 'elint-plugin-example',
  /**
   * 可读名称，用于控制台输出
   */
  name: '插件示例',
  /**
   * elint 插件类型
   *
   * - `linter` lint 检查工具
   * - `formatter` 格式化工具
   * - `common` 公共检查工具
   **/
  type: 'linter',
  /**
   * 插件激活配置
   **/
  activateConfig: {
    /**
     * 使用扩展名确定是否激活插件
     **/
    extensions: ['.js'],
    /**
     * 判断插件激活函数，如果传入了则会忽略上面的 extensions
     */
    activate: (options) => {
      return true
    }
  },
  execute: (text, options) => {
    return {
      source: '',
      output: '',
      errorCount: 0,
      warningCount: 0,
      message: '命令行输出文本',
      result: 'lint 工具执行结果'
    }
  },
  /**
   * 可选实现，用于重置插件的一些缓存
   */
  reset: () => {}
}
```

## 5. 细节 & 原理

作为一个项目的维护者，当你将 elint 集成到你的项目中时，了解一些细节会非常有帮助。

### 5.1. 安装 & 初始化过程

如果你编写好了用于自己团队的 preset，并且按照前面介绍的安装方式安装完成，你会发现，elint 将所有的配置文件从 preset 复制到了项目的根目录。这是通过定义在 postinstall 中的 `elint-helpers install` 命令完成的。

这么做的目的是为了兼容在 IDE、build 工具中使用 lint。所以使用 elint 的同时，你仍然可以按照原来的方式，配置你的 IDE，webpack 等，他们与 elint 完全不冲突。

安装（并初始化）完成后，可以根据你的项目的实际情况，添加 npm scripts，例如 test 时执行 `elint lint '**/*.js' '**/*.less'`

### 5.2. 执行过程

执行过程比较简单，对代码的 lint 的过程可以概括为一句话：“elint 根据你输入的 glob，收集并整理文件，交由各个插件执行，然后将结果输出至命令行展示”。

对 git commit 信息的 lint，主要借助于 husky 和 commitlint。安装过程中，会自动添加 git hooks，当 hooks 触发时，执行 husky 配置中的相应命令，就这么简单。

> 执行 commit lint 时，git hook 可以选择 `commit-msg`。

## 6. 常见问题

### 6.1. 使用旧版 `husky`

elint 在逻辑上和 `husky` 并没有绑定，因此如果想使用旧版本 `husky`，可以直接在项目中安装和配置。

注意：由于 `husky` 的特殊性，无法在 `preset` 中指定其版本

### 6.2. 配置文件是不是可以 git ignore

如果你能想到这个问题，那么说明你真的理解了 elint 的运作方式。忽略配置文件，防止意外被修改，所有团队成员使用 preset 定义的配置，听起来非常不错。那么从 preset 复制到项目中的各种配置文件，是否可以添加到 `.gitignore` 呢？这要看你的使用场景：

- 如果代码提交到 git 仓库，执行 ci 的过程中会安装依赖。
- 如果部署项目时，build 过程中不再执行 lint，或者先安装依赖，然后再执行 build。

总之，只要执行 `npm install` 安装依赖，配置文件就会自动添加到项目里；只要你能保证需要用到配置文件的时候它存在（例如你在 webpack 里用了 eslint-loader），就可以忽略它。

再次强调，elint 的设计原则是保证团队规范的严格执行，如果你觉得规则有问题，那么应该提出并推动修改 preset，而不是直接改项目里的配置。

### 6.3. 是否可以安装多个 preset

不可以。安装过程中，如果两个 preset 存在相同的配置文件，后安装会覆盖之前的。在 elint 执行时，如果发现有多个 preset，会抛出错误

### 6.4. 某些文件没有被校验到

1. 检查你的 glob 写法是否有问题。
2. 可能是 glob 被传入 elint 之前就被意外解析了，参考 [lint 命令](#31-lint)。
3. windows 7 + git bash 下测试时发现，npm scripts 里，glob 必须使用双引号包裹

```json
{
  "scripts": {
    "test:lint": "elint lint \"src/**/*.js\""
  }
}
```

4. elint 在遍历文件时，会应用一些默认的忽略规则，如果你的文件刚好命中这些规则，可以使用 `--no-ignore` 选项。

```js
const defaultIgnore = [
  '**/node_modules/**',
  '**/bower_components/**',
  '**/flow-typed/**',
  '**/.nyc_output/**',
  '**/coverage/**',
  '**/.git',
  '**/*.min.js',
  '**/*.min.css'
]
// 除此之外还有 .gitignore 定义的忽略规则
```

### 6.5. 为什么添加了 fix 选项还是有问题输出

并不是所有规则都支持自动修复，具体可以查看 [eslint rules](https://eslint.org/docs/rules/) 和 [stylelint rules](https://stylelint.io/user-guide/rules/)，可以自动修复的规则都有标识。

### 6.6. 如何禁用颜色输出

设置环境变量 `FORCE_COLOR` 为 `0` 即可，例如：

```shell
$ FORCE_COLOR=0 elint lint "src/**/*.js"
```

## 7. 参考

- eslint: [Github](https://github.com/eslint/eslint) | [文档](http://eslint.org)
- stylelint: [Github](https://github.com/stylelint/stylelint) | [文档](https://stylelint.io)
- commitlint: [Github](https://github.com/marionebl/commitlint) | [文档](https://commitlint.js.org/#/)
- prettier: [Github](https://github.com/prettier/prettier) | [文档](https://prettier.io/)
- husky: [Github](https://github.com/typicode/husky)
- git hooks: [文档](https://git-scm.com/docs/githooks)
- glob primer: [文档](https://github.com/isaacs/node-glob#glob-primer)

[node-image]: https://img.shields.io/node/v/elint.svg?maxAge=3600&style=flat-square&logo=node.js&logoColor=white
[node-url]: https://nodejs.org
[npm-image]: https://img.shields.io/npm/v/elint.svg?maxAge=3600&style=flat-square&logo=npm
[npm-url]: https://www.npmjs.com/package/elint
[license-image]: https://img.shields.io/github/license/x-orpheus/elint.svg?maxAge=3600&style=flat-square
[license-url]: https://github.com/x-orpheus/elint/blob/master/LICENSE
[unit-test-image]: https://img.shields.io/github/workflow/status/x-orpheus/elint/unit%20test?maxAge=3600&style=flat-square&logo=github
[unit-test-url]: https://github.com/x-orpheus/elint/actions?query=workflow%3A%22unit+test%22
[system-test-image]: https://img.shields.io/github/workflow/status/x-orpheus/elint/system%20test?maxAge=3600&style=flat-square&logo=github
[system-test-url]: https://github.com/x-orpheus/elint/actions?query=workflow%3A%22system+test%22
[codecov-image]: https://img.shields.io/codecov/c/github/x-orpheus/elint?token=30359e4823354cb78258bb1cea95a867&maxAge=3600&style=flat-square&logo=codecov
[codecov-url]: https://codecov.io/gh/x-orpheus/elint
[dependencies-image]: https://img.shields.io/david/x-orpheus/elint.svg?maxAge=3600&style=flat-square
[dependencies-url]: https://david-dm.org/x-orpheus/elint
[devdependencies-image]: https://img.shields.io/david/dev/x-orpheus/elint.svg?maxAge=3600&style=flat-square
[devdependencies-url]: https://david-dm.org/x-orpheus/elint?type=dev
[lgtm-alerts-image]: https://img.shields.io/lgtm/alerts/g/x-orpheus/elint.svg?logo=lgtm&logoWidth=18&maxAge=3600&style=flat-square
[lgtm-alerts-url]: https://lgtm.com/projects/g/x-orpheus/elint/alerts/
[lgtm-grade-image]: https://img.shields.io/lgtm/grade/javascript/g/x-orpheus/elint.svg?logo=lgtm&logoWidth=18&maxAge=3600&style=flat-square
[lgtm-grade-url]: https://lgtm.com/projects/g/x-orpheus/elint/context:javascript
