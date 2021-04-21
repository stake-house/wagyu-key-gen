
'use strict';

// pull in the 'path' module from node
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// export the configuration as an object
module.exports = {
  // development mode will set some useful defaults in webpack
  mode: 'development',
  // the entry point is the top of the tree of modules.
  // webpack will bundle this file and everything it references.
  entry: './src/react/index.tsx',
  // we specify we want to put the bundled result in the matching dist/ folder
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/react'),
  },
  module: {
    // rules tell webpack how to handle certain types of files
    rules: [
      // at the moment the only custom handling we have is for typescript files
      // .ts and .tsx files get passed to ts-loader
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      }, {
        test: /node_modules\/JSONStream\/index\.js$/,
        loader: 'shebang-loader'
      }
    ],
  },
  resolve: {
    // specify certain file extensions to get automatically appended to imports
    // ie we can write `import 'index'` instead of `import 'index.ts'`
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/react/index.html',
    }),
  ],
  target: 'electron-renderer'
};

