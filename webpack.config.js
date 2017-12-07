var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // entry: './src/index.js',
  entry: './index.js',

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },

	// module: {
	// 	rules: [
	// 		{ test: /\.css$/,
	// 			use: [ 'style-loader', 'css-loader' ],
	// 		}
	// 	]
	// },

	plugins: [
		new HtmlWebpackPlugin({
			title: 'Hello World',
		}),
	],

};
