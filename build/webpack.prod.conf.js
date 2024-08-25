const path = require("path");
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpackConfig = require("./webpack.config");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

("use strict");

const isProduction = process.env.NODE_ENV === "production";

module.exports = merge(webpackConfig, {
  mode: "production",
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
      new CssMinimizerPlugin(), // Minify CSS
    ],
    splitChunks: {
      chunks: "all",
      maxSize: 200 * 1024, // Try to keep chunks under 200 KiB
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name(module, chunks, cacheGroupKey) {
            // Clean module name to prevent invalid characters
            const moduleName = module
              .identifier()
              .split("/")
              .reduceRight((item) => item)
              .replace(/[^\w-]/g, ""); // Remove invalid characters

            return `${cacheGroupKey}-${moduleName}`;
          },
          chunks: "all",
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["dist"],
      root: path.resolve(__dirname, "../"),
    }),

    // Keep modules.id stable when vendor modules do not change
    // new webpack.HashedModuleIdsPlugin(),
  ].filter(Boolean), // Filter out any falsy plugins, such as HtmlWebpackPlugin if commented out
});