var ENCODING = "utf-8";
var EOL = '\n';

var fs = require("fs");
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;

var files = [
	"third-party/json3.js",
	"third-party/eventemitter2.js",
	"third-party/easyXDM/easyXDM.min.js",
	"core/preamble.js",
	"core/constants.js",
	"core/container.js"
];


console.log("Compiling Debug Package...");
var contents = files.map(function(f) {
	return fs.readFileSync(f, ENCODING);
});
fs.writeFileSync("f2.debug.js", contents.join(EOL), ENCODING);
console.log("COMPLETE");


console.log("Compiling Minified Package...");
var contents = files.map(function(f) {

	var code = fs.readFileSync(f, ENCODING);
	var comments = [];
	var token = '"F2: preserved commment block"';

	// borrowed from enter-js
	code = code.replace(/\/\*![\s\S]*?\*\//g, function(comment) {
		comments.push(comment)
		return ';' + token + ';'
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