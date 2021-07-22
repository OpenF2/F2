const path = require('path');
const pkg = require('./package.json');
const webpack = require('webpack');

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'f2.js',
		library: {
			export: 'default',
			name: 'F2',
			type: 'umd'
		}
	},
	plugins: [
		new webpack.BannerPlugin({
			banner: () => {
				return `
F2 v${pkg.version} ${new Date().toLocaleString('en', { dateStyle: 'short' })}
Copyright (c) 2021 IHS Markit Digital https://www.openf2.org

"F2" is licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the specific
language governing permissions and limitations under the License.

Please note that F2 ("Software") may contain third party material that Markit
On Demand Inc. has a license to use and include within the Software (the
"Third Party Material"). A list of the software comprising the Third Party Material
and the terms and conditions under which such Third Party Material is distributed
are reproduced in the ThirdPartyMaterial.md file available at:

https://github.com/OpenF2/F2/blob/master/ThirdPartyMaterial.md

The inclusion of the Third Party Material in the Software does not grant, provide
nor result in you having acquiring any rights whatsoever, other than as stipulated
in the terms and conditions related to the specific Third Party Material, if any.`;
			}
		}),
		new webpack.DefinePlugin({
			VERSION: JSON.stringify(pkg.version)
		}),
		new webpack.optimize.ModuleConcatenationPlugin({
			// Examine all modules
			maxModules: Infinity,
			// Display bailout reasons
			optimizationBailout: true
		})
	]
};
