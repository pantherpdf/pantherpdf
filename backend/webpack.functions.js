const Dotenv = require('dotenv-webpack')

module.exports = {
  plugins: [
    new Dotenv({
      path: '../.env',
      safe: '../.env.example',
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
