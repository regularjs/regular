const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: {
    main: './lib/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "regular.js",
    library: {
      name: 'Regular',
      type: 'umd',
    },
    globalObject: 'this',
  },
};
