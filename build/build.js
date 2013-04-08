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
// change directory to root folder for simplicity
process.chdir('../');

var exec = require('child_process').exec;
var fs = require('fs-extra');
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
	.boolean('n').alias('n', 'nuget').describe('n', 'Build just the Nuget Package')
	.boolean('v').alias('v', 'version').describe('v', 'Output the verison information for F2')
	.boolean('y').alias('y', 'yuidoc').describe('y', 'Build the YUIDoc for the SDK')
	.string('prep').describe('prep', 'Updates F2Info, does \'build -a\' including rebuild of templates')
	.string('release').describe('release', 'Updates the sdk release version in F2.json and creates a tag on GitHub')
	.string('release-docs').describe('release-docs', 'Update the docs release version in F2.json')
	.string('release-sdk').describe('release-sdk', 'Update the sdk release version in F2.json')
	.argv;

// constants
var JS_HEADER = { src: 'sdk/src/template/header.js.tmpl', minify: false };
var JS_FOOTER = { src: 'sdk/src/template/footer.js.tmpl', minify: false };

// only the files that represent f2
var CORE_FILES = [
	{ src: 'sdk/src/F2.js', minify: true },
	{ src: 'sdk/src/classes.js', minify: true },
	{ src: 'sdk/src/constants.js', minify: true },
	{ src: 'sdk/src/events.js', minify: true },
	{ src: 'sdk/src/rpc.js', minify: true },
	{ src: 'sdk/src/ui.js', minify: true },
	{ src: 'sdk/src/container.js', minify: true }
];
var ENCODING = 'utf-8';
var EOL = '\n';
// files to be packaged
var PACKAGE_FILES = [
	// requirejs not yet necessary
	// { src: 'sdk/src/third-party/require.min.js', minify: false },
	{ src: 'sdk/src/third-party/json2.js', minify: true },
	{ src: 'sdk/src/third-party/jquery.min.js', minify: false },
	{ src: 'sdk/src/third-party/bootstrap-modal.js', minify: true },
	{ src: 'sdk/src/third-party/jquery.noconflict.js', minify: false },
	{ src: 'sdk/src/third-party/eventemitter2.js', minify: true },
	{ src: 'sdk/src/third-party/easyXDM/easyXDM.min.js', minify: false }
];
var VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)$/;
var globalUpdateBranch = true;

// a list of buildSteps that maps an argument to a function. the buildSteps need
// to be in order of dependency in case -a is passed
var buildSteps = [
	{ arg: 'j', f: js },
	//{ arg: 'n', f: nuget },  Don't want to force users to have Nuget at this time
	{ arg: 'l', f: less },
	{ arg: 'd', f: docs },
	{ arg: 'y', f: yuidoc },
	{ arg: 'g', f: ghp }
];

// build all if no args are passed
argv.a = argv.a || process.argv.length == 2;

// these have to be optionally inserted since we don't want them executing if
// -a is passed
if (argv['release-docs']) {
	buildSteps.unshift({ arg: 'release-docs', f: releaseDocs });
}
if (argv['release-sdk']) {
	buildSteps.unshift({ arg: 'release-sdk', f: releaseSdk });
}

if (argv['prep']){
	argv.a = true;
	buildSteps.unshift({ arg: 'prepareBranch', f: prepBranch });
}

// process -l if -d or -y is passed
argv.l = argv.l || argv.d || argv.y;

// show help
if (argv.h) {
	help();
// release
} else if (argv.release) {
	release();
// Nuget
} else if (argv.n) {
	nuget();
// version
} else if (argv.v) {
	version();
// everything else
} else {
	nextStep();
}

/**
 * Process the list of buildSteps that were requested. We have to use a queue
 * because of sync issues when running external processes.
 * @method nextStep
 */
function nextStep() {
	var option = buildSteps.shift();

	if (!option) { return; }

	if (argv[option.arg] || argv.a) {
		option.f();
	} else {
		nextStep();
	}
}

/**
 * Ends execution and displays an error message
 * @method die
 */
function die(message) {
	console.error('ERROR: ' + message);
	process.exit(1);
}

/**
 * Handlebars helper for precompilation
 */
handlebars.registerHelper('if', function(conditional, options) {
	if (options.hash.desired === options.hash.test) {
		return options.fn(this);
	}
});

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
		'./docs/src/template/baseTemplate.html',
		'./docs/src/template/style.html',
		'./docs/src/template/header.html',
		'./docs/src/template/footer.html',
		'./docs/src/index.md',
		'./docs/src/app-development.md',
		'./docs/src/container-development.md',
		'./docs/src/f2js-sdk.md',
		'./docs/src/extending-f2.md'
	],
	dat = new Date();

	// update Last Update Date and save F2.json
	console.log("Setting last updated date...");
	f2Info.docs.lastUpdateDate = dat.toJSON();
	f2Info.docs.lastUpdateDateFormatted = dateFormat(dat);
	saveF2Info();

	processTemplateFile(templateFiles, f2Info, true);
	console.log("Markitdown...");
	exec(
		'markitdown ./ --output-path ../ --docTemplate ./template/baseTemplate.html --header ./template/header.html --footer ./template/footer.html --head ./template/style.html --title "F2"',
		{ cwd:'./docs/src' },
		function(error, stdout, stderr) {
			if (error) {
				die(stderr);
			} else {
				processTemplateFileCleanup(templateFiles);
				console.log('COMPLETE');

				nextStep();
			}
		}
	);
};

/**
 * Date format helper for F2.json
 * Returns date "October 15, 2012"
 *
 * @method dateFormat
 * @param new Date() (optional)
 */
function dateFormat(dat){
	var dat = dat || new Date(),
		month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	return dat.getDate() + " " + month[dat.getMonth()] + " " + dat.getFullYear();
}

/**
 * Copies all documentation to the gh-pages folder
 * @method ghp
 */
function ghp() {
	console.log('Copying documentation to gh-pages...');
	wrench.copyDirSyncRecursive('./docs', '../gh-pages', { preserve:true });
	//delete the /src on gh-pages, we don't need it.
	wrench.rmdirSyncRecursive('../gh-pages/src');
	console.log('COMPLETE');

	nextStep();
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
	var files, contents;
	console.log('Building f2.no-third-party.js...');
	
	files = [JS_HEADER]
		.concat(CORE_FILES)
		.concat([JS_FOOTER]);

	contents = files.map(function(f) {
		return fs.readFileSync(f.src, ENCODING);
	});

	contents = processTemplate(contents.join(EOL), f2Info);
	fs.writeFileSync('./sdk/f2.no-third-party.js', contents, ENCODING);
	console.log('COMPLETE');


	console.log('Building Debug Package...');
	files = [JS_HEADER]
		.concat(PACKAGE_FILES)
		.concat(CORE_FILES)
		.concat([JS_FOOTER]);

	contents = files.map(function(f) {
		return fs.readFileSync(f.src, ENCODING);
	});
	contents = processTemplate(contents.join(EOL), f2Info);
	fs.writeFileSync('./sdk/f2.debug.js', contents, ENCODING);
	console.log('COMPLETE');


	console.log('Building Minified Package...');
	contents = files.map(function(f) {

		var code = fs.readFileSync(f.src, ENCODING);

		if (f.minify) {
			var comments = [];
			var token = '"F2: preserved commment block"';

			// borrowed from ender-js
			code = code.replace(/\/\*![\s\S]*?\*\//g, function(comment) {
				comments.push(comment);
				return token;
				//return ';' + token + ';';
			});

			var ast = jsp.parse(code); // parse code and get the initial AST
			ast = pro.ast_mangle(ast); // get a new AST with mangled names
			ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
			code = pro.gen_code(ast); // compressed code here

			code = code.replace(RegExp(token, 'g'), function() {
				return EOL + comments.shift() + EOL;
			});
		}

		return code;
	});
	contents = processTemplate(contents.join(';' + EOL), f2Info);
	fs.writeFileSync('./sdk/f2.min.js', contents, ENCODING);

	// update Last Update Date and save F2.json
	f2Info.sdk.lastUpdateDate = (new Date()).toJSON();
	saveF2Info();

	console.log('COMPLETE');

	//copy F2.min.js over to docs/js folder so it makes to gh-pages
	console.log('Copying f2.min.js to ./docs/js/f2.js...');
	fs.copy('./sdk/f2.min.js', './docs/js/f2.js', function(err){
		if (err) {
			die(err);
		} else {
			console.log("COMPLETE");
			// Issue #35
			console.log('Copying f2.min.js to ./docs/js/f2.min.js...');
			fs.copy('./sdk/f2.min.js', './docs/js/f2.min.js', function(err){
				if (err) {
					die(err);
				} else {
					console.log("COMPLETE");

					console.log('Copying F2.min.js to /f2.js...');
					fs.copy('./sdk/f2.min.js', './f2.js', function(err){
						if (err) {
							die(err);
						} else {
							console.log("COMPLETE");
							nextStep();
						}
					});
				}
			});
		}
	});
};

/**
 * Compile LESS into F2.css and F2.Docs.css
 * @method less
 */
function less() {
	console.log('Compiling LESS...');
	exec(
		'lessc ./template/less/bootstrap.less > ../css/F2.css --compress | lessc ./template/less/bootstrap-docs.less > ../css/F2.Docs.css --compress | lessc ./template/less/bootstrap-sdk.less > ../css/F2.Sdk.css --compress',
		{ cwd: './docs/src' },
		function(error, stdout, stderr){
			if (error){
				die(error);
			} else {
				console.log("COMPLETE");
				nextStep();
			}
		}
	);
};

/**
 * Build the Nuget package for publishing on Nuget.org
 * @method nuget
 */
function nuget() {
	console.log('Building Nuget Package...');
	processTemplateFile('./sdk/f2.nuspec', f2Info, true);
	exec(
		'nuget pack f2.nuspec',
		{ cwd: './sdk' },
		function(error, stdout, stderr){
			if (error){
				die(error);
			} else {
				processTemplateFileCleanup('./sdk/f2.nuspec');
				console.log("COMPLETE");
				//nextStep();
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
 * Creates a tag of "master" on GitHub using the SDK release version as the tag
 * name
 * @method release
 */
function release() {

	var v = argv.release;
	
	if (typeof v !== 'boolean') {
		// git status
		exec('git status', function(error, stdout, stderr) {
			if (error) {
				die(stderr);
			} else if (/Changes not staged for commit/i.test(stdout) || /Changes to be committed/i.test(stdout)) {
				die('Changes must be committed or stashed before creating a release');
			} else {
				// no uncommitted changes, ready to proceed with the build queue
				// we'll add a final step to the queue that will commit and tag the 
				// release in github.  The first few steps will rebuild the files with
				// the new version number
				buildSteps.push({
					arg: 'release',
					f: function() {
						exec('git commit -a -m "Tagging ' + f2Info.sdk.version + ' release"', function(error, stdout, stderr) {
							if (error) {
								die(stderr);
							} else {
								exec('git tag ' + f2Info.sdk.version, function(error, stdout, stderr) {
									if (error) {
										die(stderr);
									} else {
										console.log('Release ' + f2Info.sdk.version + ' has been created\n\nYou must run the `git push origin ' + f2Info.sdk.version + '` command for the tag to make it to GitHub\n');
									}
								});
							}
						});
					}
				});

				// make sure these steps are run
				argv.j = argv.y = argv.l = true;

				// run the queue by starting with releaseSdk
				releaseSdk(argv.release);
			}
		});
	} else {
		die('Version number must be passed with "--release" option');
	}
};

/**
 * Updates the docs version and release date
 * @method releaseDocs
 * @param {string} [v] The version number
 */
function releaseDocs(v) {

	v = v || argv['release-docs'];

	if (typeof v !== 'boolean' && versionCheck(v)) {
		f2Info.docs.releaseDate = (new Date()).toJSON();
		f2Info.docs.shortVersion = v.split('.').slice(0, 2).join('.');
		f2Info.docs.version = v;
		saveF2Info();

		console.log('Docs Version Updated: ', v);
		nextStep();
	} else {
		die('Version number must be passed with "--release-docs" option');
	}
};

/**
 * Updates the SDK version and release date
 * @method releaseSdk
 * @param {string} [v] The version number
 */
function releaseSdk(v) {

	v = v || argv['release-sdk'];

	if (typeof v !== 'boolean' && versionCheck(v)) {
		var parts = v.split('.');
		f2Info.sdk.releaseDate = (new Date()).toJSON();
		f2Info.sdk.shortVersion = v.split('.').slice(0, 2).join('.');
		f2Info.sdk.version = v;
		saveF2Info();

		console.log('SDK Version Updated: ', v);
		nextStep();
	} else {
		die('Version number must be passed with "--release-sdk" option');
	}
};

/**
 * Gets and sets current git branch to F2.json
 * @method setCurrentBranch
 */
function setCurrentBranch(callback){
	exec(
		'git rev-parse --abbrev-ref HEAD',
		function(error,stdout,stderr){
			if (error){
				die(stderr);
			} else {
				//add git branch to F2Info
				f2Info.branch = String(stdout).replace(/^\s*|\s*$/g, '');//replace empty strings
				if (typeof callback == 'function'){
					callback();
				}
			}
		}
	);
}

/**
 * Saves the F2.json object back to a file
 * Adds current git branch to file
 * @method saveF2Info
 */
function saveF2Info() {
	//sometimes we don't want to update the F2Info.branch property
	if (!globalUpdateBranch){
		fs.writeFileSync('./build/F2.json', JSON.stringify(f2Info, null, '\t'), ENCODING);
		return;
	}
	setCurrentBranch(function(){
		fs.writeFileSync('./build/F2.json', JSON.stringify(f2Info, null, '\t'), ENCODING);
	});
};

/**
 * Display version information for F2
 * @method version
 */
function version() {
	console.log([
		'Docs Version: ' + f2Info.docs.version + ' (' + (new Date(f2Info.docs.releaseDate)).toDateString() + ')',
		'SDK Version:  ' + f2Info.sdk.version + ' (' + (new Date(f2Info.sdk.releaseDate)).toDateString() + ')',
		''
	].join('\n'));
};

function versionCheck(version) {
	if (!VERSION_REGEX.test(version)) {
		die('Version number (' + version + ') must follow semver.org standards.\n\n');
	}
	return true;
}

/**
 * Build the YUIDoc for the sdk
 * @method yuidoc
 */
function yuidoc() {

	console.log('Generating YUIDoc...');

	var builder,
		docOptions = {
			quiet: true,
			norecurse: true,
			paths: ['./sdk/src'],
			outdir: './docs/sdk/',
			themedir: './docs/src/sdk-template'
		},
		json,
		readmeMd = fs.readFileSync('README.md', ENCODING);

	json = (new Y.YUIDoc(docOptions)).run();
	// massage in some meta information from F2.json
	json.project = {
		docsAssets: '../',
		version: f2Info.sdk.version,
		docsVersion: f2Info.docs.version,
		docsLastUpdateDateFormatted: f2Info.docs.lastUpdateDateFormatted,
		branch: f2Info.branch
	};
	docOptions = Y.Project.mix(json, docOptions);

	// hasClassMembers
	// ensures that the class has members and isn't just an empty namespace
	Y.Handlebars.registerHelper('hasClassMembers', function() {

		for (var i = 0, len = json.classitems.length; i < len; i++) {
			//console.log(json.classitems[i].class, this.name);
			if (json.classitems[i].class === this.name) {
				return '';
			}
		}

		return 'hide';
	});

	// title tag
	Y.Handlebars.registerHelper('htmlTitle',function () {
		var name  = this.displayName || this.name,
				title = name;

		if (title) {
			title = 'F2 - ' + title;
		} else {
			title = 'F2 - The Open Financial Framework';
		}

		return title;
	});

	// insert readme markdown
	Y.Handlebars.registerHelper('readme', function() {
		return builder.markdown(readmeMd, true);	
	});

	builder = new Y.DocBuilder(docOptions, json);
	builder.compile(function() {
		console.log('COMPLETE');
		nextStep();
	});
};

/**
 * Added new build step to prepare branches refd in pull requests so they 
 * can more easily be merged from Github without re-building templates in 'master'.
 * 
 * This step is just for @markhealey and @brianbaker
 */
function prepBranch(){
	console.log("Preparing current branch for merging into master...");
	//set this to false to tell docs() not to touch branch prop 
	//before compiling templates
	globalUpdateBranch = false;
	//add FIRST step to update F2.json
	buildSteps.unshift({
		arg: 'updateF2Info', 
		f: function() {
			//sync-up dates
			var dat = new Date();
			f2Info.docs.releaseDate = f2Info.sdk.releaseDate = dat.toJSON();
			f2Info.docs.lastUpdateDate = f2Info.sdk.lastUpdateDate = dat.toJSON();
			f2Info.docs.lastUpdateDateFormatted = dateFormat(dat);
			//set branch name
			f2Info.branch = 'master';
			//save
			saveF2Info();
			//go
			nextStep();
		}
	});
	//add step to display version # (serenity now)...and then we're done.
	buildSteps.push({
		arg: 'versCheck',
		f: function(){
			version();
			console.log("PREP COMPLETE -- You can now commit changes & merge with 'master'.");
		}
	});
	//run all build steps
	//start queue
	nextStep();
}
