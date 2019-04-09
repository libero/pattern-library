import path from 'path';

export default {
  mode: 'production',
  entry: path.join(__dirname, 'source/js/main'),

  output: {
    path: path.join(__dirname, 'dist-for-webpack-test'),
    filename: '[name].bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
    ]
  },

  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    usedExports: true
  },

  stats: {
    colors: true
  },

  devtool: 'source-map'

};
