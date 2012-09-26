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
var handlebars = require('Handlebars');
var jsp = require('uglify-js').parser;
var optimist = require('optimist');
var pro = require('uglify-js').uglify;
var f2Info = require('./F2.json');
var wrench = require('wrench');
var Y = require('yuidocjs');
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
	'sdk/src/events.js',
	'sdk/src/rpc.js',
	'sdk/src/ui.js',
	'sdk/src/container.js'
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

	// files to run handlebar substitutions
	var templateFiles = [
		'./docs/src/template/header.html'
	];

	processTemplateFile(templateFiles, f2Info, true);

	exec(
		'markitdown ./ --output-path ../ --header ./template/header.html --footer ./template/footer.html --head ./template/style.html --title ""',
		{ cwd:'./docs/src' },
		function(error, stdout, stderr) {
			if (error) {
				console.log(stderr);
			} else {
				processTemplateFileCleanup(templateFiles);

				// update Last Update Date and save F2.json
				f2Info.docs.lastUpdateDate = (new Date()).toJSON();
				saveF2Info();

				console.log('COMPLETE');
				processOptionQueue();
			}
		}
	);
};

/**
 * Copies all documentation to the gh-pages folder
 * @method ghp
 */
function ghp() {
	console.log('Copying documentation to gh-pages...');
	// temporary - do not overwrite the gh-pages index.html until launch
	fs.renameSync('./docs/index.html', './docs/index-temp.html');
	wrench.copyDirSyncRecursive('./docs', '../gh-pages', { preserve:true });
	// temporary - put index.html back to normal
	fs.renameSync('./docs/index-temp.html', './docs/index.html');
	wrench.copyDirSyncRecursive('./sdk/docs', '../gh-pages/sdk/docs');
	//delete the /src on gh-pages, we don't need it.
	wrench.rmdirSyncRecursive('../gh-pages/src');
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
	contents = processTemplate(contents.join(EOL), f2Info);
	fs.writeFileSync('./sdk/f2.no-third-party.js', contents, ENCODING);
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

		// borrowed from ender-js
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

	// update Last Update Date and save F2.json
	f2Info.sdk.lastUpdateDate = (new Date()).toJSON();
	saveF2Info();

	console.log('COMPLETE');
	processOptionQueue();
};

/**
 * Compile LESS into F2.css and F2.Docs.css
 * @method less
 */
function less() {
	console.log('Compiling LESS...');
	exec(
		'lessc ./template/less/bootstrap.less > ../css/F2.css --compress | lessc ./template/less/bootstrap-docs.less > ../css/F2.Docs.css --compress',
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
};

/**
 * Will replace handlebar placeholders for data
 * @method processTemplate
 * @param {string} content The template content or a path to the template content
 * @param {object} data The data to replace
 */
function processTemplate(content, data) {

	// 'crossLink' is a special helper that is used by YUIdoc. We need to leave it
	// alone so that it is processed later
	handlebars.registerHelper('crossLink', function(path) {
		return '{{#crossLink "' + path + '"}}{{/crossLink}}';
	});

	// compile and run the template
	var template = handlebars.compile(content);
	return template(data);
};

/**
 * Will replace handlebar placeholders for data within a file
 * @method processTemplateFile
 * @param {string|Array} filePath The path to the template content
 * @param {object} data The data to replace
 * @param {bool} [preserveOriginalFile] If true, the original file will be
 * copied with a .temp extension.  See
 * {{#crossLink "processTemplateFileCleanup"}}{{/crossLink}} for how to cleanup
 * the temp files that were created during this process
 */
function processTemplateFile(filePath, data, preserveOriginalFile) {

	filePath = [].concat(filePath);

	for (var i = 0; i < filePath.length; i++) {
		if (fs.existsSync(filePath[i])) {
			var content = fs.readFileSync(filePath[i], ENCODING);
			if (preserveOriginalFile) {
				fs.writeFileSync(filePath[i] + '.temp', content, ENCODING);
			}
			content = processTemplate(content, data);
			fs.writeFileSync(filePath[i], content, ENCODING);
		}	
	}
};

/**
 * Copies the temp files created by processTemplateFile back to their original
 * file names and removes the temp file
 * @method processTemplateFileCleanup
 * @param {string|Array} filePath The path to the template content
 */
function processTemplateFileCleanup(filePath) {

	filePath = [].concat(filePath);

	for (var i = 0; i < filePath.length; i++) {
		if (fs.existsSync(filePath[i]) && fs.existsSync(filePath[i] + '.temp')) {
			var content = fs.readFileSync(filePath[i] + '.temp', ENCODING);
			fs.writeFileSync(filePath[i], content, ENCODING);
			fs.unlinkSync(filePath[i] + '.temp');
		}	
	}
};

/**
 * Saves the F2.json object back to a file
 * @method saveF2Info
 */
function saveF2Info() {
	fs.writeFileSync('./F2.json', JSON.stringify(f2Info, null, '\t'), ENCODING);
};

/**
 * Build the YUIDoc for the sdk
 * @method yuidoc
 */
function yuidoc() {

	var docOptions = {
		quiet: true,
		norecurse: true,
		paths: ['./sdk/src'],
		outdir: './sdk/docs',
		themedir: './sdk/docs-theme'
	};

	console.log('Generating YUIDoc...');
	var json = (new Y.YUIDoc(docOptions)).run();
	// massage in some meta information from F2.json
	json.project = {
		version: f2Info.sdk.version
	};
	docOptions = Y.Project.mix(json, docOptions);
	(new Y.DocBuilder(docOptions, json)).compile(function() {
		console.log('COMPLETE');
		processOptionQueue();
	});
};