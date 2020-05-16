const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: "development",
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "../lolitor"),
    filename: "bundle.js"
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./build", to: "../lolitor/build" },
      ],
      options: {
        concurrency: 100
      }
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      //   title: "Index file",
      template: "index.html"
    })
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["file-loader"]
      }
    ]
  }
};
