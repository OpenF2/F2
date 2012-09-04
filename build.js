#!/usr/bin/env node
/**
 * Build script for F2
 *
 * This script requires that the following node packages be installed:
 *   - markitdown (npm install -g markitdown)
 *   - optimist (npm install optimist)
 *   - uglify-js (npm install uglify-js)
 *   - wrench-js (npm install wrench)
 *   - yuidocjs (npm install yuidocjs)
 *     also requires pandoc: http://johnmacfarlane.net/pandoc/installing.html
 */
var exec = require('child_process').exec;
var fs = require('fs');
var jsp = require('uglify-js').parser;
var pro = require('uglify-js').uglify;
var wrench = require('wrench');
var Y = require('yuidocjs');
var optimist = require('optimist');
var argv = optimist
	.usage('Build script for F2\nUsage: $0 [options]')
	.boolean('a').alias('a', 'all').describe('a', 'Build all')
	.boolean('d').alias('d', 'docs').describe('d', 'Build the docs')
	.boolean('l').alias('l', 'less').describe('l', 'Compile LESS')
	.boolean('g').alias('g', 'gh-pages').describe('g', 'Copy docs to gh-pages folder. Must have the gh-pages branch cloned to ../gh-pages')
	.boolean('h').alias('h', 'help').describe('h', 'Display this help information')
	.boolean('j').alias('j', 'js-sdk').describe('j', 'Build just the JS SDK')
	.boolean('y').alias('y', 'yuidoc').describe('y', 'Build the YUIDoc for the SDK')
	.argv;

// constants
// only the files that represent f2
var CORE_FILES = [
	'sdk/src/preamble.js',
	'sdk/src/classes.js',
	'sdk/src/constants.js',
	'sdk/src/container.js',
	'sdk/src/rpc.js',
	'sdk/src/ui.js',
	'sdk/src/ui-dialogs.js'
];
var ENCODING = 'utf-8';
var EOL = '\n';
// files to be packaged
var PACKAGE_FILES = [
	'sdk/src/third-party/json3.js',
	'sdk/src/third-party/eventemitter2.js',
	'sdk/src/third-party/easyXDM/easyXDM.min.js',
	'sdk/f2.no-third-party.js' // this file is created by the build process
];
// a list of options that maps an argument to a function. the options need to be
// in order of dependency, in case the user specifies -a
var OPTIONS = [
	{ arg: 'j', f: js },
	{ arg: 'd', f: docs },
	{ arg: 'l', f: less },
	{ arg: 'y', f: yuidoc },
	{ arg: 'g', f: ghp }
];

// build all if no args are passed
argv.a = argv.a || process.argv.length == 2;
// process -l if -d is passed
argv.l = argv.l || argv.d;

// if help option was passed, only display help
if (argv.h) {
	help();
// else process all options
} else {
	processOptionQueue();
}

/**
 * Process the list of options that were passed. We have to use a queue because
 * of sync issues when running external processes.
 * @method processOptionQueue
 */
function processOptionQueue() {
	var option = OPTIONS.shift();

	if (!option) { return; }

	if (argv[option.arg] || argv.a) {
		option.f();
	} else {
		processOptionQueue();
	}
}

/**
 * Build the documentation for GitHub Pages. The documentation generation is
 * asynchronous, so if anything needs to execute after the generation is
 * complete, those functions can be passed as parameters.
 * @method docs
 */
function docs() {
	console.log('Generating Docs...');
	var callbacks = arguments;

	exec(
		'markitdown ./ --output-path ../html --header ./template/header.html --footer ./template/footer.html --head ./template/style.html --title "F2 Documentation"',
		{ cwd:'./docs/src' },
		function(error, stdout, stderr) {
			if (error) {
				console.log(stderr);
			} else {
				console.log('COMPLETE');
				processOptionQueue();
			}
		}
	);
};

/**
 * Compile LESS into f2.css
 * @method less
 */
function less(){
	console.log('Compiling LESS...');
	exec(
		'lessc ./template/less/bootstrap.less > ../html/css/F2.css', //--compress
		{ cwd: './docs/src' },
		function(error, stdout, stderr){
			if (error){
				console.log(stderr);
			} else {
				console.log("COMPLETE");
				processOptionQueue();
			}
		}
	);
}

/**
 * Copies all documentation to the gh-pages folder
 * @method ghp
 */
function ghp() {
	console.log('Copying documentation to gh-pages...');
	// temporary - do not overwrite the gh-pages index.html until launch
	fs.renameSync('./docs/html/index.html', './docs/html/index-temp.html');
	wrench.copyDirSyncRecursive('./docs/html', '../gh-pages', { preserve:true });
	// temporary - put index.html back to normal
	fs.renameSync('./docs/html/index-temp.html', './docs/html/index.html');
	wrench.copyDirSyncRecursive('./sdk/docs', '../gh-pages/sdk');
	console.log('COMPLETE');

	processOptionQueue();
};

/**
 * Display the help information
 * @method help
 */
function help() {
	optimist.wrap(80).showHelp();
};

/**
 * Build the debug, minified, and no-third-party sdk files
 * @method js
 */
function js() {
	console.log('Building f2.no-third-party.js...');
	var contents = CORE_FILES.map(function(f) {
		return fs.readFileSync(f, ENCODING);
	});
	fs.writeFileSync('./sdk/f2.no-third-party.js', contents.join(EOL), ENCODING);
	console.log('COMPLETE');


	console.log('Building Debug Package...');
	var contents = PACKAGE_FILES.map(function(f) {
		return fs.readFileSync(f, ENCODING);
	});
	fs.writeFileSync('./sdk/f2.debug.js', contents.join(EOL), ENCODING);
	console.log('COMPLETE');


	console.log('Building Minified Package...');
	var contents = PACKAGE_FILES.map(function(f) {

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

	processOptionQueue();
};

/**
 * Build the YUIDoc for the sdk
 * @method yuidoc
 */
function yuidoc() {
	var callbacks = arguments;
	var docOptions = {
		quiet:true,
		norecurse:true,
		paths:['./sdk/src'],
		outdir:'./sdk/docs',
		themedir:'./sdk/doc-theme'
	};

	console.log('Generating YUIDoc...');
	var json = (new Y.YUIDoc(docOptions)).run();
	docOptions = Y.Project.mix(json, docOptions);
	(new Y.DocBuilder(docOptions, json)).compile(function() {
		console.log('COMPLETE');
		processOptionQueue();
	});
};