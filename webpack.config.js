const webpack = require("webpack");

const webpackConfig = {
  resolve: {
    fallback: {
      buffer: require.resolve("buffer/"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};

module.exports = {
  webpackConfig,
}
