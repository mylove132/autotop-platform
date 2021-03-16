
const BrotliGzipPlugin = require('brotli-gzip-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
module.exports = {
  resolve: {
    alias: {}
  },
  plugins: [
    // 打包moment时，只打包中文对应的语言包
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
    new BrotliGzipPlugin({
      asset: '[path].br[query]', // 目标文件名
      algorithm: 'brotli', // 使用brotli+gzip压缩
      test: /\.(js|css|svg)$/,
      threshold: 10240, // 资源文件大于10240B=10kB时会被压缩
      minRatio: 0.8, // 最小压缩比达到0.8时才会被压缩
      deleteOriginalAssets: true
    })
  ]
}