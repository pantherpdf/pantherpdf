const Dotenv = require('dotenv-webpack')
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
