var ENCODING = "utf-8";
var EOL = '\n';

var fs = require("fs");
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;
var Y = require("yuidocjs");

// files to be packaged
var packageFiles = [
	"src/third-party/json3.js",
	"src/third-party/eventemitter2.js",
	"src/third-party/easyXDM/easyXDM.min.js",
	"f2.no-third-party.js" // this file is created by the build process
];

// only the files that represent f2
var coreFiles = [
	"src/preamble.js",
	"src/classes.js",
	"src/constants.js",
	"src/container.js"
];


console.log("Building f2.no-third-party.js...");
var contents = coreFiles.map(function(f) {
	return fs.readFileSync(f, ENCODING);
});
fs.writeFileSync("f2.no-third-party.js", contents.join(EOL), ENCODING);
console.log("COMPLETE");


console.log("Building Debug Package...");
var contents = packageFiles.map(function(f) {
	return fs.readFileSync(f, ENCODING);
});
fs.writeFileSync("f2.debug.js", contents.join(EOL), ENCODING);
console.log("COMPLETE");


console.log("Building Minified Package...");
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
fs.writeFileSync("f2.min.js", contents.join(EOL), ENCODING);
console.log("COMPLETE");


console.log("Generating YUIDoc...");
var docOptions = {
	quiet:true,
	norecurse:true,
	paths:["./src"],
	outdir:"./docs",
	themedir:"./doc-theme"
};
var json = (new Y.YUIDoc(docOptions)).run();
docOptions = Y.Project.mix(json, docOptions);
(new Y.DocBuilder(docOptions, json)).compile();
console.log("COMPLETE");