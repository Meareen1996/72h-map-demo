const path = require('path');
const { merge } = require('webpack-merge'); 
const webpackConfig = require('./webpack.config');



module.exports = merge(webpackConfig, {
  devtool: 'eval-cheap-source-map', 
  mode: 'development',
  devServer: {
    port: 9000,
    host: 'localhost',
    bonjour: true,
    static: {
      directory: path.resolve(__dirname, '../dist') // path.join 可能需要替换为 path.resolve
    },
    compress: true
  },
  plugins: []
});
