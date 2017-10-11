'use strict'
require('./check-versions')()//加载这个文件，导出这个函数，后面的() 相当于直接执行该函数

process.env.NODE_ENV = 'production'
//这些所有的插件，都可以去npm官网查
const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')//输出彩色的插件
const webpack = require('webpack')
const config = require('../config')//配置，读里面的index文件
const webpackConfig = require('./webpack.prod.conf')

const spinner = ora('building for production...')
spinner.start()
//路径模块
rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})
