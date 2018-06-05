# ELint

[![NPM version][npm-image]][npm-url] [![License][license-image]][license-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url]

专为团队开发的 lint 工具

**目录**：

<!-- TOC -->

- [1. 安装](#1-安装)
- [2. 使用指南](#2-使用指南)
  - [2.1. 什么是 elint](#21-什么是-elint)
  - [2.2. preset](#22-preset)
  - [2.3. 内部细节](#23-内部细节)
- [3. 命令](#3-命令)
- [4. 常见问题](#4-常见问题)
  - [4.1. cnpm, yarn](#41-cnpm-yarn)
  - [4.2. 为什么不建议全局安装](#42-为什么不建议全局安装)

<!-- /TOC -->

## 1. 安装

安装 elint

```shell
npm install elint --save-dev
```

安装 preset

```shell
npm install elint-preset-<name> --save-dev
```

> 如果你使用 cnpm, yarn，请继续阅读下文

> 强烈**不建议**全局安装

## 2. 使用指南

### 2.1. 什么是 elint

elint 是一个代码校验工具，基于 eslint、stylelint、commitlint 封装而成，主要功能是：

- 支持 eslint, stylelint
- 支持 commitlint (git hooks)
- 编写定制化的 preset，包含所有的验证规则，**保证团队内校验规则的一致性和可复用**

### 2.2. preset

preset 是用户自己编写的规则集合，大概长这样：

```shell
elint-preset-<name>
├── .commitlintrc.js
├── .eslintrc.js
├── .huskyrc.js
├── index.js
├── node_modules
├── package.json
├── package-lock.json
└── .stylelintrc.js
```

要求：

1. linter 的配置文件名称必须是 `.commitlintrc.js`, `.eslintrc.js`, `.stylelintrc.js`
2. git hooks (使用 husky) 的配置文件名称必须是 `.huskyrc.js`
3. 所有配置文件必须放在 preset 的根目录
4. npm package name 必须以 `elint-preset-` 开头，如： `elint-preset-<name>`
5. 依赖的 linter plugin（例如 eslint-plugin-react），必须明确定义在 `package.json` 的 `dependencies` 中

满足以上 5 点要求 npm package 就是一个合法的 elint preset

### 2.3. 内部细节

作为一个项目的维护者，当你将 elint 集成到你的项目中时，了解一些细节会非常有帮助

#### 2.3.1. 安装 & 初始化过程

如果你编写好了用于自己团队的 preset，并且按照前面介绍的安装方式安装完成，你会发现，elint 将所有的配置文件从 preset 复制到了项目的根目录，这么做的目的是为了兼容在 IDE、build 工具中使用 lint。所以使用 elint 的同时，你仍然可以按照原来的方式，配置你的 IDE，webpack 等，他们与 elint 完全不冲突

具体的 preset 初始化过程（install 后自动执行），分为如下两步：

1. 将配置文件 (`.eslintrc.js` 等) 复制项目的根目录
2. 将 preset 的 `dependencies` 安装，并保存到项目的 `devDependencies` 中

安装（并初始化）完成后，可以根据你的项目的实际情况，添加 npm scripts，例如 test 时执行 `elint lint '**/*.js' '**/*.less'`

无论你是先安装 elint，还是先安装 preset，亦或者同时安装，elint 都能准确的感知到 preset 的存在，并完成所有初始化操作。这以功能主要借助于 [npm hook scripts](https://docs.npmjs.com/misc/scripts#hook-scripts)，这也是你使用 cnpm 等需要注意的问题。

#### 2.3.2. 执行过程

执行过程比较简单，对代码的 lint 的过程可以概括为一句话：“elint 根据你的输入收集文件，交由 eslint、stylelint 执行，并且讲结果输出至命令行”

对 git commit 信息的 lint，主要借助于 husky 和 commitlint。安装过程中，会添加 git hooks，当相应的 hooks 触发时，执行配置在 `.huskyrc.js` 中的命令，就这么简单。

> 执行 commit lint 时，git hook 可以选择 `commit-msg`

> 因为 git hooks 的注册是在 npm install 后自动执行的，所以，如果万一你的项目还未 git init，hooks 注册是失败的。解决办法是在 git init 之后，手动执行 `./node_modules/.bin/elint hooks install` 注册

## 3. 命令

因为我们不推荐全局安装，除了在 npm scripts 中使用时，下面的 `elint` 代指 `./node_modules/.bin/elint`：

```shell
# 校验 js 和 scss
$ elint lint "**/*.js" "**/*.scss"

# 校验 js
$ elint lint "**/*.js"
$ elint lint es "**/*.js"

# 校验 less
$ elint lint "**/*.less"
$ elint lint style "**/*.js"

# 校验 commit message
$ elint lint commit

# 安装 & 卸载 git hooks
$ elint hooks install
$ elint hooks uninstall

# 查看版本信息
$ elint -v

# 查看帮助信息
$ elint -h
```

## 4. 常见问题

### 4.1. cnpm, yarn

使用 cnpm 的目的无外乎两点：解决网络问题和私有仓库。但问题是 cnpm 的私有实现不支持给 elint 带来极大便利的 [npm hook scripts](https://docs.npmjs.com/misc/scripts#hook-scripts)。无奈我们只能放弃 `cnpm` 命令，只使用它的仓库:

```shell
$ alias mynpm='npm --registry=http://registry.npm.example.com \
  --registryweb=http://npm.example.com \
  --userconfig=$HOME/.mynpmrc'
```

关于 yarn，暂时不支持

### 4.2. 为什么不建议全局安装

elint 强依赖 stylelint, eslint 等工具。而对于 eslint:

> Any plugins or shareable configs that you use must also be installed globally to work with a globally-installed ESLint.

[npm-image]: https://img.shields.io/npm/v/elint.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/elint
[license-image]: https://img.shields.io/github/license/keenwon/eazydict.svg?style=flat-square
[license-url]: https://github.com/keenwon/eazydict/blob/master/LICENSE
[travis-image]: https://img.shields.io/travis/keenwon/elint.svg?style=flat-square
[travis-url]: https://travis-ci.org/keenwon/elint
[coveralls-image]: https://img.shields.io/coveralls/keenwon/elint.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/keenwon/elint?branch=master
