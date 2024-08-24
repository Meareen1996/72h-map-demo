const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const _PROD_ = process.env.NODE_ENV === 'production';
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: _PROD_ ? 'production' : 'development',

  entry: {
    app: './src/index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: process.env.PUBLIC_URL || '/',
    filename: 'static/js/[name].[contenthash].js',
    chunkFilename: 'static/js/[name].[contenthash].js',
  },

  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'src')],
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.json', '.scss']
  },

  module: {
    rules: [
      {
        test: /\.js$/, //匹配所有的.js文件
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
            },
          },
        ]
      },

      {
        test: /\.(eot|woff|woff2|ttf)(\?\S*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[contenthash][ext][query]',
        },
      },
      {
        test: /\.(svg|png|jpe?g|gif)(\?\S*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/imgs/[name].[contenthash][ext][query]',
        },
      },
      // 处理全局的 CSS 文件
      {
        test: /\.css$/,
        use: [
          _PROD_ ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer')({
                    overrideBrowserslist: ['> 1%', 'last 2 versions'],
                  }),
                ],
              },
            },
          },
        ],
      },

      // 处理 SCSS 文件 (全局)
      {
        test: /\.scss$/,
        use: [
          _PROD_ ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer')({
                    overrideBrowserslist: ['> 1%', 'last 2 versions']
                  })
                ]
              }
            }
          },
          'sass-loader'
        ]
      },

      // 处理 CSS Modules（用于模块化的 SCSS 文件）
      {
        test: /\.module\.scss$/,
        use: [
          _PROD_ ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: _PROD_
                  ? '[hash:base64]'
                  : '[path][name]__[local]--[hash:base64:5]',  // 生产环境使用简短的哈希
              },
              sourceMap: !_PROD_,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer')({
                    overrideBrowserslist: ['> 1%', 'last 2 versions'],
                  }),
                ],
              },
            },
          },
          'sass-loader',  // 将 SCSS 转换为 CSS
        ],
      }
      
    ],
  },

  optimization: {
    minimize: _PROD_,
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      cacheGroups: {
        react: {
          name: 'vendor',
          test: /[\\/]node_modules\/(react|mobx)[\\/]/,
          priority: 1,
        },
        antd: {
          name: 'vendor1',
          test: /[\\/]node_modules\/antd[\\/]/,
          priority: 0,
        },
        default: {
          name: 'common',
          minChunks: 2,
          priority: -10,
          reuseExistingChunk: true,
        },
      },
    },
  },

  plugins: [

    // 生产环境下提取 CSS 到独立文件中
    new MiniCssExtractPlugin({
      filename: _PROD_ ? '[name].[contenthash].css' : '[name].css',
      chunkFilename: _PROD_ ? '[id].[contenthash].css' : '[id].css',
    }),

    new HtmlWebpackPlugin({
      title: 'map-demo',
      filename: 'index.html',
      template: './public/index.html',
      favicon: './public/favicon.ico',
      manifest: './public/manifest.json',
      inject: true,
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeAttributeQuotes: true,
        minifyJS: true,
      },
    }),
    // You can add other plugins like webpack.ProvidePlugin, CopyWebpackPlugin, etc.
  ],

  // source map 配置（开发模式下开启）
  devtool: _PROD_ ? false : 'source-map',
};
