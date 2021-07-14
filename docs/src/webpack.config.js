const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');
const pkg = require('../../package.json');

module.exports = {
	entry: {
		site: './docs/src/css/less/site.less'
	},
	output: {
		path: path.resolve(__dirname, '../dist/css')
	},
	module: {
		rules: [
			{
				test: /\.less/i,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							url: false
						}
					},
					{
						loader: 'less-loader',
						options: {
							lessOptions: {
								banner: `/*! F2 v${pkg.version} ${new Date().toLocaleString('en', { dateStyle: 'short' })} Copyright IHS Markit Digital */\n`,
								compress: true,
								modifyVars: {
									imgPath: '',
									version: `${pkg.version}`
								},
								sourceMap: true,
								sourceMapURL: '/css/site.css.map'
							}
						}
					}
				]
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css'
		})
	]
}