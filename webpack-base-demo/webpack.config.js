const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')//ExtractTextPlugin：分离CSS和JS文件

module.exports = {
  devtool: 'eval-source-map',//用于打包的配置。有四个选项，该选项适用于中小项目开发过程中使用。
  entry: __dirname + '/app/main.js',// 入口文件
  output: {
    path: __dirname + "/build",// 打包后的文件地址。“__dirname”是node.js中的一个全局变量，它指向当前执行脚本所在的目录。
    filename: "bundle-[hash].js"//打包后输出文件的文件名
   /* path: __dirname + 'public',
    filename: 'bundle.js'*/
  },
  // 配合 npm run server =》"server": "webpack-dev-server --open"
  devServer: {
    contentBase: './public',// 本地服务器所在的页面所在的目录
    historyApiFallback: true,// 不跳转
    inline: true,//实时刷新
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          }, {
            loader: "css-loader",
            options: {
              modules: true
            }
          }
        ]
      },
      {
        test: /(\.jsx|\.js)$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "es2015", "react"
            ]
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin('版权所有，翻版必究'),
    new HtmlWebpackPlugin({
      template: __dirname + "/app/index.tmpl.html"//new 一个这个插件的实例，并传入相关的参数
    }),
    new webpack.HotModuleReplacementPlugin()//热加载插件
    new webpack.optimize.OccurrenceOrderPlugin(),// :为组件分配ID，通过这个插件webpack可以分析和优先考虑使用最多的模块，并为它们分配最小的ID
    new webpack.optimize.UglifyJsPlugin(),//压缩JS代码；
    new ExtractTextPlugin("style.css")//分离CSS和JS文件
  ]
}