const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = env => {
  const isDev = env === "development";


  const extractCSS = (
    new ExtractTextPlugin({
      filename: "css/[name].[hash].css",
      allChunks: true,
      disable: isDev,
    })
  );

  const makeExtractor = (opts = {}) => extractCSS.extract({
    fallback: "style-loader",
    use: [
      {
        loader: "css-loader",
        options: {
          // importLoaders: 1,
          modules: opts.modules,
          // sourceMap: !isDev,
        }
      },
    ]
  });

  return {
    context: __dirname,

    entry: {
      main: "./src/index",
      vendor: ["react", "react-dom"]
    },

    output: {
      path: path.resolve(__dirname, "build"),
      filename: isDev
        ? "js/[name].js"
        : "js/[name].[hash].js",
      sourceMapFilename: isDev
        ? "js/[name].map"
        : "js/[name].[chunkhash].map",
      publicPath: "/",
      hashDigestLength: 7,
    },

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
            }
          },
          include: [path.resolve(__dirname, "src")]
        },
        {
          test: /\.css$/,
          use: makeExtractor({ modules: true }),
        },
      ]
    },

    plugins: [
      extractCSS,
      new webpack.DefinePlugin({
        process: {
          env: {
            NODE_ENV: isDev
              ? JSON.stringify("development")
              : JSON.stringify("production")
          }
        }
      }),
      new webpack.optimize.CommonsChunkPlugin({
        names: ["vendor"],
        minChunks: Infinity
      }),
      // new webpack.SourceMapDevToolPlugin({
      //   exclude: /\.css$/,
      //   filename: "js/[name].map",
      // })
    ]
    .concat(
      isDev
      ? [new webpack.NamedModulesPlugin()]
      : [new CleanWebpackPlugin(["build/**/*.*"]),
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false,
            screw_ie8: true,
            conditionals: true,
            unused: true,
            comparisons: true,
            sequences: true,
            dead_code: true,
            evaluate: true,
            if_return: true,
            join_vars: true,
            drop_console: true,
          },
          output: { comments: false },
          sourceMap: true,
        })]
    ),

    resolve: {
      modules: [
        path.resolve(__dirname, "src"),
        path.resolve(__dirname, "node_modules"),
      ],
      extensions: [".js", ".json", ".jsx"],
    },

    bail: true,
    target: "web",
    devtool: isDev ? "eval-cheap-module-source-map" : "source-map",
  };
};
