/*
-检查node和npm的版本、引入相关插件和配置
-webpack对源码进行编译打包并返回compiler对象
-创建express服务器
-配置开发中间件（webpack-dev-middleware）和热重载中间件（webpack-hot-middleware）
-挂载代理服务和中间件
-配置静态资源
-启动服务器监听特定端口（8080）
-自动打开浏览器并打开特定网址（localhost:8080）
说明： express服务器提供静态文件服务，不过它还使用了http-proxy-middleware，一个http请求代理的中间件。前端开发过程中需要使用到后台的API的话，可以通过配置proxyTable来将相应的后台请求代理到专用的API服务器。*/
'use strict'
require('./check-versions')()
// 检查nodejs和npm的版本

const config = require('../config')
// 获取基本的配置
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}
// 如果Node的环境变量中没有设置当前的环境（NODE_ENV）,则使用config中的dev环境配置作为当前的环境

const opn = require('opn')
// opn 是一个可以调用默认浏览器打开网址、图片、文件等内容的插件
// 这里用它来调用默认浏览器打开dev-server监听的端口，例如：localhost:8080

const path = require('path')
// nodejs内置的路径模块
const express = require('express')
const webpack = require('webpack')
const proxyMiddleware = require('http-proxy-middleware')
// http-proxy-middleware是一个express中间件，用于将http请求代理到其他服务器
// 例：localhost:8080/api/xxx  -->  localhost:3000/api/xxx
// 这里使用该插件可以将前端开发中涉及到的请求代理到提供服务的后台服务器上，方便与服务器对接
const webpackConfig = require('./webpack.dev.conf')
// 引入webpack配置文件

// default port where dev server listens for incoming traffic
// dev-server 监听的端口，如果没有在命令行传入端口号，则使用config.dev.port设置的端口，例如8080
const port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
// 用于判断是否要自动打开浏览器的布尔变量，当配置文件中没有设置自动打开浏览器的时候其值为 false
const autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyTable = config.dev.proxyTable
// HTTP代理表，指定规则，将某些API请求代理到相应的服务器
// 创建express服务器
const app = express()
const compiler = webpack(webpackConfig)
// 下面这块也不是很理解
// compiler=用webpack根据webpackConfig这个配置打包
// webpack-dev-middleware将webpack编译打包后得到的产品文件存放在内存中而没有写进磁盘
// 将这个中间件挂到express上使用之后即可提供这些编译后的产品文件服务
const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})
// 设置访问路径为webpack配置中的output里面所对应的路径
// 设置为true，使其不要在控制台输出日志

// webpack-hot-middleware，用于实现热重载功能的中间件。热重载是：页面的每次改动，不需要手动去刷新，可自动刷新。
//  log: false,关闭控制台的日志输出
//  heartbeat: 2000 发送心跳包的频率
const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
// currently disabled until this is resolved:
// https://github.com/jantimon/html-webpack-plugin/issues/680
// compiler.plugin('compilation', function (compilation) {
//   compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
//     hotMiddleware.publish({ action: 'reload' })
//     cb()
//   })
// })

// enable hot-reload and state-preserving
// compilation error display
// 挂载热重载中间件
app.use(hotMiddleware)

// proxy api requests
// 根据 proxyTable 中的代理请求配置来设置express服务器的http代理规则
Object.keys(proxyTable).forEach(function (context) {
  const options = proxyTable[context]
  if (typeof options === 'string') {
    options = {target: options}
  }
  // 格式化options，例如将'www.example.com'变成{ target: 'www.example.com' }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
// 重定向不存在的URL，用于支持SPA（单页应用）
// 例如使用vue-router并开启了history模式
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
// 挂载webpack-dev-middleware中间件，提供webpack编译打包后的产品文件服务
app.use(devMiddleware)

// serve pure static assets
// 提供static文件夹上的静态文件服务
const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

// 访问链接
const uri = 'http://localhost:' + port

// 创建promise，在应用服务启动之后resolve
// 便于外部文件require了这个dev-server之后的代码编写
var _resolve
var _reject
var readyPromise = new Promise((resolve, reject) => {
  _resolve = resolve
  _reject = reject
})

var server
var portfinder = require('portfinder')
portfinder.basePort = port

console.log('> Starting dev server...')
// webpack-dev-middleware等待webpack完成所有编译打包之后输出提示语到控制台，表明服务正式启动
// 服务正式启动才自动打开浏览器进入页面
devMiddleware.waitUntilValid(() => {
  portfinder.getPort((err, port) => {
    if (err) {
      _reject(err)
    }
    process.env.PORT = port
    var uri = 'http://localhost:' + port
    console.log('> Listening at ' + uri + '\n')
    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
      opn(uri)
    }
    // 启动express服务器并监听相应的端口
    server = app.listen(port)
    _resolve()
  })
})

// 暴露本模块的功能给外部使用，例如下面这种用法
// var devServer = require('./build/dev-server')
// devServer.ready.then(() => {...})
// if (...) { devServer.close() }
module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
