const Dotenv = require('dotenv-webpack')
const webpack = require('webpack')
const fs = require('fs')

module.exports = {
  plugins: [
    new Dotenv({
      path: (fs.existsSync('../.env') ? '../.env' : undefined),
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
