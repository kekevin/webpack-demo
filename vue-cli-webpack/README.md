# dinomall

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

#项目文件夹

* build 打包的配置文件所在的文件夹
  --webpack.base.conf.js打包核心的文件
  --build.js 构建生产版本，打生产的包
* config webpack打包的配置
  --index.js配置的环境、端口
* src 代码所在地
* static 静态文件所在地
* package.json
  -- "dev": "node build/dev-server.js",
  执行build中的dev-server.js
  -- "start": "npm run dev",
  -- "build": "node build/build.js",
