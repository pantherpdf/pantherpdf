const Dotenv = require('dotenv-webpack')

module.exports = {
  plugins: [
    new Dotenv({
      path: '../.env',
      safe: false,
    })
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
