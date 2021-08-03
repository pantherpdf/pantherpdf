const Dotenv = require('dotenv-webpack')
const webpack = require('webpack')

module.exports = {
  plugins: [
    new Dotenv({
      path: '../.env',
      safe: false,
    }),

    // prevent from importing canvas - its not installed and would not work with lambda
    new webpack.IgnorePlugin(/canvas/, /jsdom$/),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["css-loader"],
      },
    ],
  },
}
