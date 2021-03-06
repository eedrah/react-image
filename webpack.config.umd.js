let path = require('path')

module.exports = {
  bail: true,
  entry: './src/index.js',
  mode: 'production',
  output: {
    library: 'ReactImageMulti',
    libraryTarget: 'umd',
    filename: 'index.js',
    path: path.resolve(__dirname, 'umd')
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.join(__dirname, 'src')],
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}
