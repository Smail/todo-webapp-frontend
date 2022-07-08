const webpack = require("webpack");

const webpackConfig = {
  rules: [
    {
      test: /\.scss$/,
      use: [
        "vue-style-loader",
        "css-loader",
        "sass-loader",
      ]
    }
  ],
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
