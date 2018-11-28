# ELint

[![Node engine][node-image]][node-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependencies Status][dependencies-image]][dependencies-url]
[![Devdependencies Status][devdependencies-image]][devdependencies-url]

|Linux|macOS|Windows|
|:--:|:--:|:--:|
|[![Linux build status][circleci-image]][circleci-url]|[![macOS build status][travis-image]][travis-url]|[![Windows build status][appveyor-image]][appveyor-url]|

专为团队设计的 lint 工具

**目录**：

<!-- TOC -->

- [1. 核心概念](#1-核心概念)
  - [1.1. ELint](#11-elint)
  - [1.2. Preset](#12-preset)
- [2. 使用指南](#2-使用指南)
  - [2.1. 安装 elint](#21-安装-elint)
  - [2.2. 编写 preset](#22-编写-preset)
    - [2.2.1. 新建一个 npm package](#221-新建一个-npm-package)
    - [2.2.2. 添加 eslint 配置文件（可选）](#222-添加-eslint-配置文件可选)
    - [2.2.3. 添加 stylelint 配置文件（可选）](#223-添加-stylelint-配置文件可选)
    - [2.2.4. 添加 commitlint 配置文件（可选）](#224-添加-commitlint-配置文件可选)
    - [2.2.5. 添加 git hooks（可选）](#225-添加-git-hooks可选)
    - [2.2.6. 发布 npm package](#226-发布-npm-package)
  - [2.3. 安装 preset](#23-安装-preset)
  - [2.4. 定义 npm scripts](#24-定义-npm-scripts)
    - [2.4.1. npm test](#241-npm-test)
    - [2.4.2. npm beforecommit](#242-npm-beforecommit)
- [3. ELint CLI](#3-elint-cli)
  - [3.1. lint](#31-lint)
  - [3.2. hooks](#32-hooks)
  - [3.3. version](#33-version)
  - [3.4. install](#34-install)
  - [3.5. diff](#35-diff)
- [4. 细节 & 原理](#4-细节--原理)
  - [4.1. 安装 & 初始化过程](#41-安装--初始化过程)
  - [4.2. 执行过程](#42-执行过程)
- [5. 常见问题](#5-常见问题)
  - [5.1. cnpm, yarn](#51-cnpm-yarn)
  - [5.2. 为什么不建议全局安装](#52-为什么不建议全局安装)
  - [5.3. 安装失败](#53-安装失败)
  - [5.4. git hooks 不执行或报错](#54-git-hooks-不执行或报错)
  - [5.5. 配置文件是不是可以 git ignore](#55-配置文件是不是可以-git-ignore)
  - [5.6. 是否可以安装多个 preset](#56-是否可以安装多个-preset)
  - [5.7. 某些文件没有被校验到](#57-某些文件没有被校验到)
  - [5.8. 为什么添加了 fix 选项还是有问题输出](#58-为什么添加了-fix-选项还是有问题输出)
  - [5.9. 如何禁用颜色输出](#59-如何禁用颜色输出)
  - [5.10. lint 执行失败，提示包缺失](#510-lint-执行失败提示包缺失)
  - [5.11. fix 和 force-fix 的区别](#511-fix-和-force-fix-的区别)
- [6. 参考](#6-参考)

<!-- /TOC -->

## 1. 核心概念

在使用 elint 之前，需要先了解几个核心概念。

### 1.1. ELint

elint 是一款代码校验工具，基于 eslint、stylelint、commitlint 等工具封装而成。elint 本身不包含任何校验规则，校验规则通过 preset 定义。elint 的主要功能包括：

- 支持对 js，css 的校验 (eslint, stylelint)。
- 支持对 git commit message 的校验 (husky, commitlint)。
- **编写**定制化、场景化的 preset，preset 包含所有验证规则，**保证团队内部校验规则的一致性和可复用**。

### 1.2. Preset

简单来说，preset 就是一个 npm package，可以理解为”规则集“。

只有 elint 是不够的，因为它不知道具体的校验规则，而 preset 就是用来定义规则的。preset 大概长这样：

```shell
elint-preset-<name>
├── .commitlintrc.js    # 定义 commitlint 规则，用于 git commit message 的校验
├── .eslintignore       # 定义 eslint 忽略规则
├── .eslintrc.js        # 定义 eslint 规则，用于 js 的校验
├── .huskyrc.js         # 定义 git hooks, 可在 commit 前执行 commitlint 等操作
├── node_modules
├── package.json
├── package-lock.json
├── .stylelintignore    # 定义 stylelint 忽略规则
└── .stylelintrc.js     # 定义 stylelint 的规则，用于 css 的校验
```

要求：

1. npm package name 必须以 `elint-preset-` 开头，如： `elint-preset-<name>` 或 `@team/elint-preset-<name>`。
2. linter 的配置文件名必须是 `.commitlintrc.js`, `.eslintrc.js`, `.stylelintrc.js`。
3. 对于 eslint 和 stylelint，支持使用 `.eslintignore`, `.stylelintignore` 定义需要忽略校验的文件和文件夹。
4. git hooks (使用 husky) 的配置文件名必须是 `.huskyrc.js`。
5. 所有配置文件必须放在 preset 的根目录。
6. 依赖的 linter plugin（例如 eslint-plugin-react），必须明确定义在 `package.json` 的 `dependencies` 中。

满足以上要求的 npm package 就是一个合法的 elint preset。

> 一般来说，不建议把 `.eslintignore`，`.stylelintignore` 添加到 preset 中，因为 preset 应该对所有项目都是适用的（除非你的 preset 限定在一个很小的范围内使用，各个项目的目录结构都是一致的，此时可以使用它们来定义需要忽略校验的文件和文件夹）。

> 在 `package.json` 中添加关键字 `elint-preset` 会方便大家找到。[这里](https://npms.io/search?q=keywords%3Aelint-preset)可以查找现有的 preset。

> eslint, stylelint, commitlint, husky 等配置文件的语法规则，请阅读[参考](#6-参考)一节提供的文档。

## 2. 使用指南

开始使用 elint 之前，请先检查下你使用 node 和 npm 版本。运行 elint 需要：

- node：>= 6.0.0，建议尽量使用新版本。
- npm：>= 3.8.6，同样建议使用新版本。另外部分版本有 bug，可能会导致安装失败，详情查看[常见问题](#53-安装失败)。

下面我们一起从零开始，一步一步的看看如何将 elint 集成到项目中。

### 2.1. 安装 elint

首先要安装 elint：

```shell
# 假设项目是 test-project
cd test-project

# 安装 elint
npm install elint --save-dev
```

> 如果你使用 yarn，cnpm（包括基于 cnpm 创建的私有仓库） 等包管理工具，请参考"[内部细节](#4-细节--原理)"和"[常见问题](#51-cnpm-yarn)"章节，我们的示例中统一使用 npm。

> 强烈**不建议**全局安装（具体原因，请阅读[常见问题](#52-为什么不建议全局安装)）。

### 2.2. 编写 preset

安装完 elint 后，我们需要安装 preset，因为所有的校验规则（rules）都定义在 preset 中。一般来说，一个团队应该有一套编码规范，根据编码规范编写好 preset 后，团队中的各个项目直接安装使用即可，不必为每个项目都新建一个 preset。

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

#### 2.2.2. 添加 eslint 配置文件（可选）

> 这步是可选的，如果你不需要校验 js 文件，可以直接跳过（下同）

首先新建配置文件，名称必须是 `.eslintrc.js`, 参考上文的 [preset 约定](#12-preset)：

```shell
touch .eslintrc.js
```

`.eslintrc.js` 写入如下内容：

```js
module.exports = {
  'extends': [
    // 使用 plugin eslint-plugin-react
    'plugin:react/recommended'
  ],
  'rules': {
    // 禁止 console
    'no-console': 2
  }
};
```

因为使用了 plugin `eslint-plugin-react`，所以必须使用 npm 安装，且保存到 `package.json` 的 `dependencies` 中（无论是从语义方面考虑，还是上文关于 preset 的约定，都应该保存到 `dependencies` 中）：

```shell
npm install eslint-plugin-react --save
```

> 因为我们使用 elint 执行校验，而 elint 已经集成了 eslint，stylelint 等工具，所以这里不需要再安装了，只需安装额外的 plugin。

#### 2.2.3. 添加 stylelint 配置文件（可选）

此处省略，和 eslint 一样的做法。

#### 2.2.4. 添加 commitlint 配置文件（可选）

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
    'type-enum': [2, 'always', [
      'build',
      'ci'
    ]]
  }
};
```

#### 2.2.5. 添加 git hooks（可选）

新建配置文件 `.huskyrc.js`：

```shell
touch .huskyrc.js
```

`.huskyrc.js` 写入如下内容

```js
module.exports = {
  'hooks': {
    /**
     * beforecommit 可以在项目的 package.json 中自由定义
     * 例如可以执行代码校验和 commitlint，或者都执行
     */
    'commit-msg': 'npm run beforecommit'
  }
}
```

> 这里配置 git hooks 执行 `npm run beforecommit`，所以你可以在项目中自由定义要执行的操作（下面会详细解释）。

> **注意**：
>
> 可能你会觉得，命名为 `precommit` 比 `beforecommit` 更合适。没错，单纯从命名的角度讲，`precommit` 确实更好。但这会与 husky 的规则产生冲突。旧版本的 husky 支持在 package.json 的 scripts 中定义 git hooks。

#### 2.2.6. 发布 npm package

此时项目的目录结构应该是：

```shell
elint-preset-test
├── .commitlintrc.js
├── .eslintrc.js
├── .huskyrc.js
├── node_modules
├── package.json
└── package-lock.json

1 directory, 5 files
```

发布 npm package，执行：

```shell
npm publish
```
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

#### 2.4.1. npm test

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

#### 2.4.2. npm beforecommit

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

> 万一（虽然不建议）你在 commit 之前什么都不想执行，为了不报错，也要写 `exit 0`。

> 当 lint 运行在 git hooks 中时，文件的范围限定在 **git 暂存区**，也就是你将要提交的文件（详见 [ELint CLI](#31-lint)）。

## 3. ELint CLI

因为我们不推荐全局安装，除了在 npm scripts 和 `.huskyrc.js` 中使用，下面的 `elint` 均代指 `./node_modules/.bin/elint`（或者也可以使用 npm 5.2.0 起内置的 [npx](https://github.com/zkat/npx) 命令）：

### 3.1. lint

`lint` 命令用来执行代码校验和 git commit message 校验。当 lint 运行在 git hooks 中时，文件的搜索范围限定在 **git 暂存区**，也就是只从你将要 commit 的文件中，找到需要校验的文件，执行校验。

```shell
elint lint [options] [type] [files...]
```

type 可选的值：

- es: 执行 eslint
- style: 执行 stylelint
- commit: 执行 commitlint

如果不指定 type，默认执行 eslint 和 stylelint

options 可选的值：

- -f, --fix: 自动修复，git hooks 中无效，[为什么这么做？](#511-fix-和-force-fix-的区别)
- -ff, --force-fix: 强制自动修复，git hooks 中依然有效
- --no-ignore: 忽略 elint 遍历文件时的默认忽略规则

当添加 `--fix` 或者 `--force-fix` 时，会尝试自动修复问题，无法自动修复的问题依旧会输出出来。

例子：

```shell
# 校验 js 和 scss
$ elint lint "**/*.js" "**/*.scss"

# 校验 js 和 scss，执行自动修复
$ elint lint "**/*.js" "**/*.scss" --fix

# 校验 js
$ elint lint "**/*.js"
$ elint lint es "**/*.js"

# 校验 less
$ elint lint "**/*.less"
$ elint lint style "**/*.js"

# 校验 commit message
$ elint lint commit
```

**注意**:

当你在 Terminal（或者 npm scripts） 中运行 `elint lint **/*.js` 的时候，glob 会被 Terminal 解析，然后输入给 elint。glob 语法解析的差异可能会导致文件匹配的差异。所以建议，glob 使用引号包裹，防止在输入到 elint 前，被意外解析。

### 3.2. hooks

`hooks` 命令用来安装 & 卸载 git hooks（一般不会用到）：

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

`presetName` 可以忽略 `elint-preset-` 前缀。

支持的 options:

- --registry: 指定 npm 仓库地址，可以输入 url 或者 alias。支持如下的 alias：
  - npm: [https://registry.npmjs.org/](https://registry.npmjs.org/)
  - cnpm: [http://r.cnpmjs.org/](http://r.cnpmjs.org/)
  - taobao: [https://registry.npm.taobao.org/](https://registry.npm.taobao.org/)
  - nj: [https://registry.nodejitsu.com/](https://registry.nodejitsu.com/)
  - rednpm: [http://registry.mirror.cqupt.edu.cn](http://registry.mirror.cqupt.edu.cn)
  - skimdb: [https://skimdb.npmjs.com/registry](https://skimdb.npmjs.com/registry)
- --keep: 不覆盖旧的配置文件（文件完全一样肯定是不会覆盖的，keep 选项只在有文件有差异时生效）

例子：

```shell
# 安装 elint-preset-test
$ elint install test

# 从 cnpm 安装 elint-preset-test
$ elint install test --registry=https://registry.npm.taobao.org/

# 从 cnpm 安装 elint-preset-test, 使用 alias
$ elint install test --registry=cnpm
```

这两种安装方式的最大区别就是："否将 preset 视为项目的依赖"：

|安装方式|区别|
|:--|:--|
|`npm install`|把 preset 当成依赖，执行 `npm install` 时，项目根目录的配置文件都可能被更新|
|`elint install`|把 preset 当成配置源，更新时需要再次执行 `elint install`|

除了上面列举的区别外，`elint install` 无视 cnpm，yarn 的限制，如果你十分依赖 cnpm，yarn 时，可以考虑使用 `elint install` 来安装，但要留意保持 preset 的最新。

没有主推这种方式的原因在于，**elint 的设计初衷就是统一团队规范，规范一旦制定，需要严格执行**。`npm install` 会自动更新并覆盖项目根目录的配置文件，一定程度上避免了随意修改配置文件带来的（不同项目之间）校验规则不统一。另外一点就是由于不推荐全局安装 elint，所以 elint 命令需要用 `./node_modules/.bin/elint` 执行，略显麻烦。

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

## 4. 细节 & 原理

作为一个项目的维护者，当你将 elint 集成到你的项目中时，了解一些细节会非常有帮助。

### 4.1. 安装 & 初始化过程

如果你编写好了用于自己团队的 preset，并且按照前面介绍的安装方式安装完成，你会发现，elint 将所有的配置文件从 preset 复制到了项目的根目录，这么做的目的是为了兼容在 IDE、build 工具中使用 lint。所以使用 elint 的同时，你仍然可以按照原来的方式，配置你的 IDE，webpack 等，他们与 elint 完全不冲突。

具体的 preset 初始化过程（install 后自动执行），分为如下两步：

1. 将配置文件 (`.eslintrc.js` 等) 复制到项目的根目录。
2. 安装 preset 的 `dependencies`，并保存到项目的 `devDependencies` 中。

安装（并初始化）完成后，可以根据你的项目的实际情况，添加 npm scripts，例如 test 时执行 `elint lint '**/*.js' '**/*.less'`

无论是先安装 elint，还是先安装 preset，亦或者同时安装，elint 都能准确的感知到 preset 的存在，并完成所有初始化操作。这项功能主要借助于 [npm hook scripts](https://docs.npmjs.com/misc/scripts#hook-scripts)，这也是当你使用 cnpm 时需要格外注意的原因（解决办法参考下面的[常见问题](#51-cnpm-yarn)）。

### 4.2. 执行过程

执行过程比较简单，对代码的 lint 的过程可以概括为一句话：“elint 根据你输入的 glob，收集并整理文件，交由 eslint、stylelint 执行，然后将结果输出至命令行展示”。

对 git commit 信息的 lint，主要借助于 husky 和 commitlint。安装过程中，会自动添加 git hooks，当 hooks 触发时，执行配置在 `.huskyrc.js` 中的相应命令，就这么简单。

> 执行 commit lint 时，git hook 可以选择 `commit-msg`。

> 因为 git hooks 的注册是在 npm install 后自动执行的，所以，如果万一你的项目还未 git init，hooks 注册必然是失败的。解决办法是在 git init 之后，手动执行 `./node_modules/.bin/elint hooks install`。

## 5. 常见问题

### 5.1. cnpm, yarn

使用 cnpm 的目的无外乎两点：解决网络问题、私有仓库。但问题是 cnpm 的私有实现不支持给 elint 带来极大便利的 [npm hook scripts](https://docs.npmjs.com/misc/scripts#hook-scripts)。所以我们只能放弃 `cnpm` 命令，仅使用它的仓库。

如果你只是单纯想从 cnpm 的仓库安装 npm package，提高安装速度。可以删除 `cnpm`，然后定义 alias:

```shell
$ alias cnpm='npm --registry=https://registry.npm.taobao.org/ \
  --registryweb=https://npm.taobao.org/ \
  --userconfig=$HOME/.cnpmrc'
```

如果你需要使用私有仓库，同样可以删除 `cnpm`，然后定义自己的命令:

```shell
$ alias mynpm='npm --registry=http://registry.npm.example.com \
  --registryweb=http://npm.example.com \
  --userconfig=$HOME/.mynpmrc'
```

关于 yarn，很可惜，目前不支持

> 上面的 `alias` 命令只是临时修改，终端关闭即实现，永久添加请修改 `.bashrc` 或 `.zshrc`。

### 5.2. 为什么不建议全局安装

elint 强依赖 stylelint, eslint 等工具。而对于 eslint，其文档中写到:

> Any plugins or shareable configs that you use must also be installed globally to work with a globally-installed ESLint.

全局安装 lint 工具和所有的 plugin，项目数量较多时容易引起混乱，且可能对 ci、部署等带来麻烦。

### 5.3. 安装失败

可能是 npm 的 [bug](https://github.com/npm/npm-lifecycle/pull/13) 引起的。如果你的 npm 版本在 5.1.0 ～ 6.1.0 之间，请升级至最新版本的 npm。

elint 安装过程中会检测 npm 版本，具体以检测结果为准。

> windows 升级 npm 请参考：[How can I update npm on Windows?](https://stackoverflow.com/questions/18412129/how-can-i-update-npm-on-windows)

### 5.4. git hooks 不执行或报错

如果 git hooks 不执行或者报错，尝试下面的方法:

- 项目处于 git 管理的前提下，执行 `npm install` 安装依赖。
- 如果你在新建项目，先执行 `npm install`，然后执行 `git init` 的话，手动注册 git hooks（上文的 hooks 命令）。
- 检查 `.git/hooks` 目录，是否存在非 `.sample` 结尾的文件，如果不存在，手动注册 git hooks。
- 还是有问题？报 bug。

### 5.5. 配置文件是不是可以 git ignore

如果你能想到这个问题，那么说明你真的理解了 elint 的运作方式。忽略配置文件，防止意外被修改，所有团队成员使用 preset 定义的配置，听起来非常不错。那么从 preset 复制到项目中的各种配置文件，是否可以添加到 `.gitignore` 呢？这要看你的使用场景：

- 如果代码提交到 git 仓库，执行 ci 的过程中会安装依赖。
- 如果部署项目时，build 过程中不再执行 lint，或者先安装依赖，然后再执行 build。

总之，只要执行 `npm install` 安装依赖，配置文件就会自动添加到项目里；只要你能保证需要用到配置文件的时候它存在（例如你在 webpack 里用了 eslint-loader），就可以忽略它。

再次强调，elint 的设计原则是保证团队规范的严格执行，如果你觉得规则有问题，那么应该提出并推动修改 preset，而不是直接改项目里的配置。

### 5.6. 是否可以安装多个 preset

不可以。安装过程中，如果两个 preset 存在相同的配置文件，后安装会覆盖之前的。如果 package.json 中的依赖包含多个 preset，先后顺序由 npm 决定。

### 5.7. 某些文件没有被校验到

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
];

// 除此之外还有 .gitignore 定义的忽略规则
```

### 5.8. 为什么添加了 fix 选项还是有问题输出

并不是所有规则都支持自动修复，具体可以查看 [eslint rules](https://eslint.org/docs/rules/) 和 [stylelint rules](https://stylelint.io/user-guide/rules/)，可以自动修复的规则都有标识。

### 5.9. 如何禁用颜色输出

设置环境变量 `FORCE_COLOR` 为 `0` 即可，例如：

```shell
$ FORCE_COLOR=0 elint lint "src/**/*.js"
```

### 5.10. lint 执行失败，提示包缺失

如果遇到如下错误，特别在 CI 环境下。可能是 `package-lock.json` 引起的。

```shell
Error: Cannot find module 'eslint-config-xxx'
```

请按照如下步骤尝试修复：

1. 删除 `node_modules` 和 `package-lock.json`。
2. 查看 `package.json` 文件，使用 elint 时只需安装 elint 和 preset，清理掉遗留的 eslint 等依赖。
3. 重新执行 `npm install`

### 5.11. fix 和 force-fix 的区别

`--fix` 非常好用，可以自动修改大量问题。但是，当在 git hooks 中使用时会有点小问题：git commit 时执行 fix，某些文件被修改，因此文件状态变为 modified，并且未被提交。此时不得不再次提交被 fix 过的文件，这通常与我们的预期不符。

为了降低上述情景带来的意外影响，`--fix` 在 git hooks 模式下不生效，同时新增了任何时候都会生效的 `--force-fix`。

建议使用 `--fix`，提交时如果代码有问题，直接报错打断，修复后再重新提交。

## 6. 参考

- eslint: [Github](https://github.com/eslint/eslint) | [文档](http://eslint.org)
- stylelint: [Github](https://github.com/stylelint/stylelint) | [文档](https://stylelint.io)
- commitlint: [Github](https://github.com/marionebl/commitlint) | [文档](http://marionebl.github.io/commitlint/#/)
- husky: [Github](https://github.com/typicode/husky)
- git hooks: [文档](https://git-scm.com/docs/githooks)
- glob primer: [文档](https://github.com/isaacs/node-glob#glob-primer)

[node-image]: https://img.shields.io/node/v/elint.svg?maxAge=3600
[node-url]: https://nodejs.org
[npm-image]: https://badge.fury.io/js/elint.svg
[npm-url]: https://www.npmjs.com/package/elint
[license-image]: https://img.shields.io/github/license/keenwon/elint.svg?maxAge=3600
[license-url]: https://github.com/keenwon/elint/blob/master/LICENSE
[circleci-image]: https://circleci.com/gh/keenwon/elint.svg?style=svg
[circleci-url]: https://circleci.com/gh/keenwon/elint
[travis-image]: https://api.travis-ci.org/keenwon/elint.svg?branch=master
[travis-url]: https://travis-ci.org/keenwon/elint
[appveyor-image]: https://ci.appveyor.com/api/projects/status/8ji6bpeea0aiwp0i/branch/master?svg=true
[appveyor-url]: https://ci.appveyor.com/project/keenwon/elint
[coveralls-image]: https://coveralls.io/repos/github/keenwon/elint/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/keenwon/elint?branch=master
[dependencies-image]: https://david-dm.org/keenwon/elint.svg
[dependencies-url]: https://david-dm.org/keenwon/elint
[devdependencies-image]: https://david-dm.org/keenwon/elint/dev-status.svg
[devdependencies-url]: https://david-dm.org/keenwon/elint?type=dev
