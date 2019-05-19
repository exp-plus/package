# Exp Plus
与腾讯云结合，快速启动应用。


## 测试
``` bash
# 在 config 文件夹中以 template.js 为模板填写好相关第三方服务的 id、key、secret 等之后可运行。
$ yarn
$ yarn test
```

## 目录结构
```
├── config          配置文件目录
├── exceptions      枚举的错误
├── global          全局变量，如 env 等
├── images          测试图片
├── middlewares     中间件
├── node_modules
├── services        应用服务
├── third-party     第三方服务
└── utils           工具方法
```


## 小技巧

``` bash
# 生成目录结构，需先安装 tree
$ tree -d -L 1
```