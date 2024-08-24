const path = require('path');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpackConfig = require('./webpack.config');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

'use strict';

const isProduction = process.env.NODE_ENV === 'production';

module.exports = merge(webpackConfig, {
  mode: 'production',
  devtool: false,
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: isProduction,
          },
          format: {
            comments: false,
          },
        },
      }),
      new CssMinimizerPlugin(), // 压缩 CSS
    ],
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], { root: path.resolve(__dirname, '../') }),
    
    // Keep modules.id stable when vendor modules do not change
    // new webpack.HashedModuleIdsPlugin(),
  ].filter(Boolean), // Filter out any falsy plugins, such as HtmlWebpackPlugin if commented out
});
