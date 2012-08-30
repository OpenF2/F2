/**
 * Build script for F2
 *
 * This script requires that the following node packages be installed:
 *   - uglify-js (npm install uglify-js)
 *   - yuidocjs (npm install yuidocjs)
 *   - markitdown (npm install -g markitdown)
 *     also requires pandoc: http://johnmacfarlane.net/pandoc/installing.html
 *
 * Usage: node build.js
 */
var ENCODING = 'utf-8';
var EOL = '\n';

var exec = require('child_process').exec;
var fs = require('fs');
var jsp = require('uglify-js').parser;
var pro = require('uglify-js').uglify;
var Y = require('yuidocjs');

// files to be packaged
var packageFiles = [
	'sdk/src/third-party/json3.js',
	'sdk/src/third-party/eventemitter2.js',
	'sdk/src/third-party/easyXDM/easyXDM.min.js',
	'sdk/f2.no-third-party.js' // this file is created by the build process
];

// only the files that represent f2
var coreFiles = [
	'sdk/src/preamble.js',
	'sdk/src/classes.js',
	'sdk/src/constants.js',
	'sdk/src/container.js'
];


console.log('Building f2.no-third-party.js...');
var contents = coreFiles.map(function(f) {
	return fs.readFileSync(f, ENCODING);
});
fs.writeFileSync('./sdk/f2.no-third-party.js', contents.join(EOL), ENCODING);
console.log('COMPLETE');


console.log('Building Debug Package...');
var contents = packageFiles.map(function(f) {
	return fs.readFileSync(f, ENCODING);
});
fs.writeFileSync('./sdk/f2.debug.js', contents.join(EOL), ENCODING);
console.log('COMPLETE');


console.log('Building Minified Package...');
var contents = packageFiles.map(function(f) {

	var code = fs.readFileSync(f, ENCODING);
	var comments = [];
	var token = '"F2: preserved commment block"';

	// borrowed from enter-js
	code = code.replace(/\/\*![\s\S]*?\*\//g, function(comment) {
		comments.push(comment)
		return ';' + token + ';';
	});

	var ast = jsp.parse(code); // parse code and get the initial AST
	ast = pro.ast_mangle(ast); // get a new AST with mangled names
	ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
	code = pro.gen_code(ast); // compressed code here

	code = code.replace(RegExp(token, 'g'), function() {
		return EOL + comments.shift() + EOL;
	});

	return code;
});
fs.writeFileSync('./sdk/f2.min.js', contents.join(EOL), ENCODING);
console.log('COMPLETE');


console.log('Generating YUIDoc...');
var docOptions = {
	quiet:true,
	norecurse:true,
	paths:['./sdk/src'],
	outdir:'./sdk/docs',
	themedir:'./sdk/doc-theme'
};
var json = (new Y.YUIDoc(docOptions)).run();
docOptions = Y.Project.mix(json, docOptions);
(new Y.DocBuilder(docOptions, json)).compile();
console.log('COMPLETE');


console.log('Generating Docs...');
exec(
	'markitdown ./ --output-path ../html --header ./template/header.html --footer ./template/footer.html --head ./template/style.html --title "F2 Documentation"',
	{ cwd:'./docs/src' },
	function(error, stdout, stderr) {
		if (error) {
			console.log(stderr);
		} else {
			//console.log(stdout);
			console.log('COMPLETE');
		}
	}
);