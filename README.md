# ELint

[![NPM version][npm-image]][npm-url] [![License][license-image]][license-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url]

专为团队设计的 lint 工具

**目录**：

<!-- TOC -->

- [1. 安装](#1-安装)
- [2. 使用指南](#2-使用指南)
  - [2.1. elint](#21-elint)
  - [2.2. preset](#22-preset)
  - [2.3. 内部细节](#23-内部细节)
- [3. 命令](#3-命令)
  - [3.1. lint](#31-lint)
  - [3.2. hooks](#32-hooks)
  - [3.3. version](#33-version)
  - [3.4. install](#34-install)
  - [3.5. diff](#35-diff)
- [4. 常见问题](#4-常见问题)
  - [4.1. cnpm, yarn](#41-cnpm-yarn)
  - [4.2. 为什么不建议全局安装](#42-为什么不建议全局安装)
  - [4.3. 安装完成后没有配置文件](#43-安装完成后没有配置文件)
  - [4.4. git hooks 不执行或报错](#44-git-hooks-不执行或报错)
  - [4.5. 配置文件是不是可以 git ignore](#45-配置文件是不是可以-git-ignore)
- [5. 参考](#5-参考)

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

### 2.1. elint

elint 是一个代码校验工具，基于 eslint、stylelint、commitlint 等封装而成，主要功能是：

- 支持对 js，css 的校验 (eslint, stylelint)
- 支持对 git commit message 的校验 (husky, commitlint)
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

1. linter 的配置文件名必须是 `.commitlintrc.js`, `.eslintrc.js`, `.stylelintrc.js`
2. 对于 eslint 和 stylelint，支持 `.eslintignore`, `.stylelintignore`
3. git hooks (使用 husky) 的配置文件名必须是 `.huskyrc.js`
4. 所有配置文件必须放在 preset 的根目录
5. npm package name 必须以 `elint-preset-` 开头，如： `elint-preset-<name>`
6. 依赖的 linter plugin（例如 eslint-plugin-react），必须明确定义在 `package.json` 的 `dependencies` 中

满足以上要求 npm package 就是一个合法的 elint preset

### 2.3. 内部细节

作为一个项目的维护者，当你将 elint 集成到你的项目中时，了解一些细节会非常有帮助

#### 2.3.1. 安装 & 初始化过程

如果你编写好了用于自己团队的 preset，并且按照前面介绍的安装方式安装完成，你会发现，elint 将所有的配置文件从 preset 复制到了项目的根目录，这么做的目的是为了兼容在 IDE、build 工具中使用 lint。所以使用 elint 的同时，你仍然可以按照原来的方式，配置你的 IDE，webpack 等，他们与 elint 完全不冲突

具体的 preset 初始化过程（install 后自动执行），分为如下两步：

1. 将配置文件 (`.eslintrc.js` 等) 复制项目的根目录
2. 将 preset 的 `dependencies` 安装，并保存到项目的 `devDependencies` 中

安装（并初始化）完成后，可以根据你的项目的实际情况，添加 npm scripts，例如 test 时执行 `elint lint '**/*.js' '**/*.less'`

无论你是先安装 elint，还是先安装 preset，亦或者同时安装，elint 都能准确的感知到 preset 的存在，并完成所有初始化操作。这项功能主要借助于 [npm hook scripts](https://docs.npmjs.com/misc/scripts#hook-scripts)，这也是当你使用 cnpm 等是需要格外注意的原因（具体见下面的常见问题）。

#### 2.3.2. 执行过程

执行过程比较简单，对代码的 lint 的过程可以概括为一句话：“elint 根据你的输入收集文件，交由 eslint、stylelint 执行，并且将结果输出至命令行展示”

对 git commit 信息的 lint，主要借助于 husky 和 commitlint。安装过程中，会添加 git hooks，当 hooks 触发时，执行配置在 `.huskyrc.js` 中的相应命令，就这么简单。

> 执行 commit lint 时，git hook 可以选择 `commit-msg`

> 因为 git hooks 的注册是在 npm install 后自动执行的，所以，如果万一你的项目还未 git init，hooks 注册必然是失败的。解决办法是在 git init 之后，手动执行 `./node_modules/.bin/elint hooks install` 注册

## 3. 命令

因为我们不推荐全局安装，除了在 npm scripts 和 `.huskyrc.js` 中使用时，下面的 `elint` 均代指 `./node_modules/.bin/elint`：

### 3.1. lint

`lint` 命令用来执行代码校验和 git commit message 校验:

```shell
elint lint [type] [files...]
```

如果不指定 type，默认执行 eslint 和 stylelint

例子：

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
```

### 3.2. hooks

`hooks` 命令用来安装 & 卸载 git hooks，一般不会用到

```shell
elint hooks [action]
```

支持的 action：install、uninstall

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

  elint             : 1.2.0-rc.1
  elint-preset-test : 1.0.15

  Dependencies:
    eslint     : 4.19.1
    stylelint  : 9.2.1
    commitlint : 7.0.0
    husky      : 1.0.0-rc.8
```

### 3.4. install

前面讲到的 preset 安装，都是直接执行 `npm install`。其实除了这种方式，还可以直接使用 `elint install` 命令安装：

```shell
elint install [presetName] [options]
```

- `presetName`: 可以忽略 `elint-preset-` 前缀
- `options.registry`: 制定 npm 仓库地址
- `options.keep`: 不覆盖旧的配置文件（如果有差异的话），很少用

例子：

```shell
# 安装 elint-preset-test
$ elint install test

# 从 cnpm 安装 elint-preset-test
$ elint install test --registry=https://registry.npm.taobao.org/
```

这两种安装方式的最大区别就是，你是否将 preset 视为项目的依赖：

|安装方式|区别|
|:--|:--|
|`npm install`|把 preset 当成依赖，执行 `npm install` 时，都可能被更新|
|`elint install`|把 preset 当成配置源，更新时需要再次执行 `elint install`|

除了上面列举的区别外，`elint isntall` 无视 cnpm，yarn 的限制，如果你十分依赖 cnpm，yarn 时，可以考虑使用 `elint install` 来安装，但要留意保持 preset 的最新。

没有主推这种方式的原因在于，elint 的设计初衷就是统一团队规范，规范一旦制定，需要严格执行。`npm install` 会自动更新并覆盖项目根目录的配置文件，一定程度上避免了随意修改带来的不统一。另外一点就是不推荐全局安装 elint，所以 elint 命令需要用 `./node_modules/.bin/elint` 执行，略显麻烦。

### 3.5. diff

万一你使用了 `elint install`，万一你加了 `keep`，万一你没有趁手的 diff 工具，可以尝试：

```shell
$ elint diff
```

输出类似：

```diff
-------------------------------------------------
diff .eslintrc.js .eslintrc.old.js
-------------------------------------------------
  2 |   'extends': [
  3 |     'plugin:react/recommended'
  4 |   ],
  5 |   'rules': {
-   |     'no-console': 0
+ 6 |     'no-console': 2
  7 |   }
  8 | };
```

## 4. 常见问题

### 4.1. cnpm, yarn

使用 cnpm 的目的无外乎两点：解决网络问题和私有仓库。但问题是 cnpm 的私有实现不支持给 elint 带来极大便利的 [npm hook scripts](https://docs.npmjs.com/misc/scripts#hook-scripts)。所以我们只能放弃 `cnpm` 命令，只使用它的仓库:

```shell
$ alias mynpm='npm --registry=http://registry.npm.example.com \
  --registryweb=http://npm.example.com \
  --userconfig=$HOME/.mynpmrc'
```

关于 yarn，暂时不支持

### 4.2. 为什么不建议全局安装

elint 强依赖 stylelint, eslint 等工具。而对于 eslint，其文档中写到:

> Any plugins or shareable configs that you use must also be installed globally to work with a globally-installed ESLint.

全局安装 lint 工具和所有的 plugin，项目数量较多时容易引起混乱，且可能对 ci、部署等带来麻烦

### 4.3. 安装完成后没有配置文件

可能是 npm 的 [bug](https://github.com/npm/npm-lifecycle/commit/67adc2dc63d7066d8abbc4017e333247577433e6) 引起的，如果你的 npm 版本在 5.4.0 ～ 6.1.0 之间：

- npm v5.6 以上的，重装 npm，哪怕还是装原来的版本，依赖也会升级上去
- npm v5.4 ~ v5.6 的，升级 npm

### 4.4. git hooks 不执行或报错

如果 git hooks 不执行或者报错，尝试下面的方法:

- 项目处于 git 管理的前提下，执行 `npm install` 安装依赖
- 如果你在新建项目，先执行 `npm install`，然后执行 `git init` 的话，手动注册 git hooks（上文的 hooks 命令）
- 检查 `.git/hooks` 目录，是否存在非 `.sample` 结尾的文件，如果不存在，手动注册 git hooks
- 还是有问题？报 bug

### 4.5. 配置文件是不是可以 git ignore

如果你能想到这个问题，那么说明你真的理解了 elint 的运作方式。忽略配置文件，防止意外被修改，所有团队成员使用 preset 定义的配置，听起来非常不错。那么从 preset 复制到项目中的各种配置文件，是否可以添加到 `.gitignore` 呢？这要看你的使用场景：

- 如果代码提交到 git 仓库，执行 ci 的过程中会安装依赖
- 如果部署项目时，build 过程中不再执行 lint，或会安装依赖在 build

总之，只要执行 `npm install` 安装依赖，配置文件就会自动添加到项目里；只要你能保证需要用到配置文件的时候它存在（例如你在 webpack 里用了 eslint-loader），就可以忽略它。

再次强调，elint 的设计原则是保证团队规范的严格执行，如果你觉得规则有问题，那么应该提出并推动修改 preset

## 5. 参考

- eslint: [Github](https://github.com/eslint/eslint) | [文档](http://eslint.org)
- stylelint: [Github](https://github.com/stylelint/stylelint) | [文档](https://stylelint.io)
- commitlint: [Github](https://github.com/marionebl/commitlint) | [文档](http://marionebl.github.io/commitlint/#/)
- husky: [Github](https://github.com/typicode/husky)
- git hooks: [文档](https://git-scm.com/docs/githooks)

[npm-image]: https://img.shields.io/npm/v/elint.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/elint
[license-image]: https://img.shields.io/github/license/keenwon/eazydict.svg?style=flat-square
[license-url]: https://github.com/keenwon/eazydict/blob/master/LICENSE
[travis-image]: https://img.shields.io/travis/keenwon/elint.svg?style=flat-square
[travis-url]: https://travis-ci.org/keenwon/elint
[coveralls-image]: https://img.shields.io/coveralls/keenwon/elint.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/keenwon/elint?branch=master
