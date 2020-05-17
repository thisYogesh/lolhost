const path = require("path");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "development",
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "../lolitor"),
    filename: "[name].bundle.js"
  },

  watch: true,
  watchOptions: {
    ignored: /build/
  },

  devServer: {
    contentBase: "../lolitor",
    hot: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "./build", to: "../lolitor/build" }],
      options: {
        concurrency: 100
      }
    }),
    // new CleanWebpackPlugin(),
    // new HtmlWebpackPlugin({
      //   title: "Index file",
    //   template: "index.html"
    // }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: '[id].css',
    })
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        // use: ["file-loader"],
        loader: 'file-loader?name=[name].[ext]' 
      }
    ]
  }
};
