const { merge } = require('webpack-merge');
const webpackBase = require('./webpack.base.js');

module.exports = merge(webpackBase, {
	devtool: 'source-map',
	mode: 'production',
	optimization: {
		minimize: true
	}
});
