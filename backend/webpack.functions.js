const Dotenv = require('dotenv-webpack')
const webpack = require('webpack')
const fs = require('fs')

const dotenvConf = {
  safe: false,
}
if (fs.existsSync('../.env')) {
  dotenvConf.path = '../.env'
}

module.exports = {
  plugins: [
    new Dotenv(dotenvConf),

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
