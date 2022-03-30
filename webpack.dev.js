//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { merge } = require('webpack-merge');
const webpackBase = require('./webpack.base.js');

module.exports = merge(webpackBase, {
	devtool: 'eval',
	mode: 'development',
	optimization: {
		minimize: false
	},
	plugins: [
		//new BundleAnalyzerPlugin()
	]
});
