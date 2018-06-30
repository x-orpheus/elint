# ELint System Test

elint 系统测试从 mocha 切换至 ava，目的在于提升效率，缩短测试用时。

## 执行流程

1. 初始化：输出系统信息，npm 打包测试使用的 elint 和 preset，预缓存测试项目。
2. 执行 ava 测试
3. 清理临时文件

## 优化点

优化点主要在两方面：

1. 利用 ava 的执行并发测试。
2. 在进行"功能测试"时，使用预先缓存好的，已安装完毕的测试项目。

`优化点1` 主要在本地和性能好的 ci 上效果明显：

||Circle CI|Travis CI|Appveyor|
|:--|:--|:--|:--|
|目标环境|Linux|macOS|Windows|
|配置（2018-07-01）|32核 CPU，59G 内存|2核 CPU，4G 内存|2核 CPU，2G 内存|
|平均耗时|~3min|~6min|~8min|

可以看到 Circle CI 的配置非常好，加上它并行执行4个 node 版本的测试，非常快就能完成。Appveyor 要依次执行 node 6到10的测试，而且配置最差，所以执行的最慢。（但是个人感觉 Appveyor 比 Travis CI 稳定）

`优化点2` 可以明显减少低版本 node（npm）的测试耗时（耗时减半）。原先使用 mocha 测试时，每个测试都需要先新建测试项目并安装依赖，而低版本 npm 安装耗时较长。
