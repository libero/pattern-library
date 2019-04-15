import path from 'path';

export default {
  mode: 'production',
  entry: path.join(__dirname, 'source/js/app/main.js'),

  output: {
    // TODO: This path should probably be supplied by Gulp, or at least derived from the same place as Gulp's
    path: path.join(__dirname, 'source/js/dist'),
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
