import path from 'path';

export default {
  mode: 'development',
  // mode: 'production',
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
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    "useBuiltIns": "usage",
                    "corejs": 3,
                  }
                ]
              ]
            }
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

  stats: 'verbose',
  devtool: 'source-map'

};
