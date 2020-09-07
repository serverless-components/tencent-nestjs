# Serverless Nest.js

**腾讯云 Nest.js 组件** ⎯⎯⎯ 通过使用 [Serverless Framework](https://github.com/serverless/components/tree/cloud)，基于云上 Serverless 服务（如网关、云函数等），实现“0”配置，便捷开发，极速部署你的 Nest.js 应用。

> 注意：本项目仅支持使用 [ExpressAdapter](https://docs.nestjs.com/faq/http-adapter) 的 Nest.js 项目。

### 安装

通过 npm 安装最新版本的 Serverless Framework

```bash
$ npm install -g serverless
```

### 创建

通过如下命令和模板链接，快速创建一个 Nest.js 应用：

```bash
$ npm i -g @nestjs/cli
$ nest new serverless-nestjs
$ cd serverless-nestjs
```

执行如下命令，安装应用的对应依赖

```
$ npm install
```

### 项目改造

1. 由于云端函数执行时不需要监听端口的，所以我们需要修改下入口文件 `src/main.ts`，如下：

```typescript
import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  return app;
}

// TODO: 通过注入 NODE_ENV 为 local，来方便本地启动服务，进行开发调试
const isLocal = process.env.NODE_ENV === 'local';
if (isLocal) {
  bootstrap().then(app => {
    app.listen(3000, () => {
      console.log(`Server start on http://localhost:3000`);
    });
  });
}

// 导出启动函数，给 sls.js 使用
export { bootstrap };
```

2. 项目根目录下新增 `sls.js` 文件，用来提供给 Nest.js 组件使用：

```js
// 注意: 根据实际项目入口文件名进行修改，此 demo 为默认情况
const { bootstrap } = require('./dist/main');

module.exports = bootstrap;
```

> 注意：实际开发可根据个人项目路径，来导出启动函数 `bootstrap`。

### 部署

由于 Nest.js 项目是 TypeScript，部署前需要编译成 JavaScript，在项目中执行编译命令即可：

```bash
$ npm run build
```

在 `serverless.yml` 文件下的目录中运行 `serverless deploy` 进行 Nest.js 项目的部署。第一次部署可能耗时相对较久，但后续的二次部署会在几秒钟之内完成。部署完毕后，你可以在命令行的输出中查看到你 nestjs 应用的 URL 地址，点击地址即可访问你的 Nest.js 项目。

> **注意：** 如您的账号未 [登录](https://cloud.tencent.com/login) 或 [注册](https://cloud.tencent.com/register) 腾讯云，您可以直接通过 `微信` 扫描命令行中的二维码进行授权登陆和注册。

如果希望查看更多部署过程的信息，可以通过`sls deploy --debug` 命令查看部署过程中的实时日志信息，`sls`是 `serverless` 命令的缩写。

### 配置

nestjs 组件支持 0 配置部署，也就是可以直接通过配置文件中的默认值进行部署。但你依然可以修改更多可选配置来进一步开发该 nestjs 项目。

以下是 nestjs 组件的 `serverless.yml` 简单配置示例：

```yml
# serverless.yml

component: nestjs # (required) name of the component. In that case, it's nestjs.
name: nestjsDemo # (required) name of your nestjs component instance.
org: orgDemo # (optional) serverless dashboard org. default is the first org you created during signup.
app: appDemo # (optional) serverless dashboard app. default is the same as the name property.
stage: dev # (optional) serverless dashboard stage. default is dev.

inputs:
  src:
    src: ./ # (optional) path to the source folder. default is a hello world app.
    exclude:
      - .env
  functionName: nestjsDemo
  region: ap-guangzhou
  runtime: Nodejs10.15
  apigatewayConf:
    protocols:
      - http
      - https
    environment: release
```

点此查看[全量配置及配置说明](https://github.com/serverless-components/tencent-nestjs/tree/master/docs/configure.md)

当你根据该配置文件更新配置字段后，再次运行 `serverless deploy` 或者 `serverless` 就可以更新配置到云端。

### 远程调试云函数

部署了 nestjs.js 应用后，可以通过开发调试能力对该项目进行二次开发，从而开发一个生产应用。在本地修改和更新代码后，不需要每次都运行 `serverless deploy` 命令来反复部署。你可以直接通过 `serverless dev` 命令对本地代码的改动进行检测和自动上传。

可以通过在 `serverless.yml`文件所在的目录下运行 `serverless dev` 命令开启开发调试能力。

`serverless dev` 同时支持实时输出云端日志，每次部署完毕后，对项目进行访问，即可在命令行中实时输出调用日志，便于查看业务情况和排障。

除了实时日志输出之外，针对 Node.js 应用，当前也支持云端调试能力。在开启 `serverless dev` 命令之后，将会自动监听远端端口，并将函数的超时时间临时配置为 900s。此时你可以通过访问 chrome://inspect/#devices 查找远端的调试路径，并直接对云端代码进行断点等调试。在调试模式结束后，需要再次部署从而将代码更新并将超时时间设置为原来的值。详情参考[开发模式和云端调试](https://cloud.tencent.com/document/product/1154/43220)。

### 查看状态

在`serverless.yml`文件所在的目录下，通过如下命令查看部署状态：

```
$ serverless info
```

### 移除

在`serverless.yml`文件所在的目录下，通过以下命令移除部署的 nestjs 服务。移除后该组件会对应删除云上部署时所创建的所有相关资源。

```
$ serverless remove
```

和部署类似，支持通过 `sls remove --debug` 命令查看移除过程中的实时日志信息，`sls`是 `serverless` 命令的缩写。

## 账号配置

当前默认支持 CLI 扫描二维码登录，如您希望配置持久的环境变量/秘钥信息，也可以本地创建 `.env` 文件

```console
$ touch .env # 腾讯云的配置信息
```

在 `.env` 文件中配置腾讯云的 SecretId 和 SecretKey 信息并保存

如果没有腾讯云账号，可以在此[注册新账号](https://cloud.tencent.com/register)。

如果已有腾讯云账号，可以在[API 密钥管理](https://console.cloud.tencent.com/cam/capi)中获取 `SecretId` 和`SecretKey`.

```
# .env
TENCENT_SECRET_ID=123
TENCENT_SECRET_KEY=123
```

## License

MIT License

Copyright (c) 2020 Tencent Cloud, Inc.
