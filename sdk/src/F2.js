/*!
 * F2 v{{sdk.version}}
 * Copyright (c) 2013 Markit On Demand, Inc. http://www.openf2.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var F2;
/**
 * Open F2
 * @module f2
 * @main f2
 */

F2 = {
	/**
	 * A function to pass into F2.stringify which will prevent circular
	 * reference errors when serializing objects
	 * @method appConfigReplacer
	 */
	appConfigReplacer: function(key, value) {
		if (key == 'root' || key == 'ui' || key == 'height') {
			return undefined;
		} else {
			return value;
		}
	},
	/**
	 * The apps namespace is a place for app developers to put the javascript
	 * class that is used to initialize their app. The javascript classes should
	 * be namepaced with the {{#crossLink "F2.AppConfig"}}{{/crossLink}}.appId. 
	 * It is recommended that the code be placed in a closure to help keep the
	 * global namespace clean.
	 *
	 * If the class has an 'init' function, that function will be called 
	 * automatically by F2.
	 * @property Apps
	 * @type object
	 * @example
	 *     F2.Apps["com_example_helloworld"] = (function() {
	 *         var App_Class = function(appConfig, appContent, root) {
	 *             this._app = appConfig; // the F2.AppConfig object
	 *             this._appContent = appContent // the F2.AppManifest.AppContent object
	 *             this.$root = $(root); // the root DOM Element that contains this app
	 *         }
	 *
	 *         App_Class.prototype.init = function() {
	 *             // perform init actions
	 *         }
	 *
	 *         return App_Class;
	 *     })();
	 * @example
	 *     F2.Apps["com_example_helloworld"] = function(appConfig, appContent, root) {
	 *        return {
	 *            init:function() {
	 *                // perform init actions
	 *            }
	 *        };
	 *     };
	 * @for F2
	 */
	Apps: {},
	/**
	 * Creates a namespace on F2 and copies the contents of an object into
	 * that namespace optionally overwriting existing properties.
	 * @method extend
	 * @param {string} ns The namespace to create. Pass a falsy value to 
	 * add properties to the F2 namespace directly.
	 * @param {object} obj The object to copy into the namespace.
	 * @param {bool} overwrite True if object properties should be overwritten
	 * @return {object} The created object
	 */
	extend: function (ns, obj, overwrite) {
		var isFunc = typeof obj === 'function';
		var parts = ns ? ns.split('.') : [];
		var parent = this;
		obj = obj || {};
		
		// ignore leading global
		if (parts[0] === 'F2') {
			parts = parts.slice(1);
		}

		// create namespaces
		for (var i = 0, len = parts.length; i < len; i++) {
			if (!parent[parts[i]]) {
				parent[parts[i]] = isFunc && i + 1 == len ? obj : {};
			}
			parent = parent[parts[i]];
		}

		// copy object into namespace
		if (!isFunc) {
			for (var prop in obj) {
				if (typeof parent[prop] === 'undefined' || overwrite) {
					parent[prop] = obj[prop];
				} 
			}
		}

		return parent;
	},
	/** 
	 * Generates a somewhat random id
	 * @method guid
	 * @return {string} A random id
	 * @for F2
	 */
	guid: function() {
		var S4 = function() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	},
	/**
	 * Search for a value within an array.
	 * @method inArray
	 * @param {object} value The value to search for
	 * @param {Array} array The array to search
	 * @return {bool} True if the item is in the array
	 */
	inArray: function(value, array) {
		return jQuery.inArray(value, array) > -1;
	},
	/**
	 * Utility method to determine whether or not the argument passed in is or is not a native dom node.
	 * @method isNativeDOMNode
	 * @param {object} testObject The object you want to check as native dom node.
	 * @return {bool} Returns true if the object passed is a native dom node.
	 */
	isNativeDOMNode: function(testObject) {
		var bIsNode = (
			typeof Node === "object" ? testObject instanceof Node : 
			testObject && typeof testObject === "object" && typeof testObject.nodeType === "number" && typeof testObject.nodeName ==="string"
		);
		
		var bIsElement = (
			typeof HTMLElement === "object" ? testObject instanceof HTMLElement : //DOM2
			testObject && typeof testObject === "object" && testObject.nodeType === 1 && typeof testObject.nodeName ==="string"
		);
		
		return (bIsNode || bIsElement);
	},
	/**
	 * Wrapper logging function.
	 * @method log
	 * @param {object} obj An object to be logged
	 * @param {object} [obj2]* An object to be logged
	 */
	log: function() {
		if (window.console && window.console.log) {
			console.log([].slice.call(arguments));
		}
	},
	/**
	 * Wrapper to convert a JSON string to an object
	 * @method parse
	 * @param {string} str The JSON string to convert
	 * @return {object} The parsed object
	 */
	parse: function(str) {
		return JSON.parse(str);
	},
	/**
	 * Wrapper to convert an object to JSON
	 *
	 * **Note: When using F2.stringify on an F2.AppConfig object, it is
	 * recommended to pass F2.appConfigReplacer as the replacer function in
	 * order to prevent circular serialization errors.**
	 * @method stringify
	 * @param {object} value The object to convert
	 * @param {function|Array} replacer An optional parameter that determines
	 * how object values are stringified for objects. It can be a function or an 
	 * array of strings.
	 * @param {int|string} space An optional parameter that specifies the
	 * indentation of nested structures. If it is omitted, the text will be
	 * packed without extra whitespace. If it is a number, it will specify the
	 * number of spaces to indent at each level. If it is a string (such as '\t'
	 * or '&nbsp;'), it contains the characters used to indent at each level.
	 * @return {string} The JSON string
	 */
	stringify: function(value, replacer, space) {
		return JSON.stringify(value, replacer, space);
	},
	/** 
	 * Function to get the F2 version number
	 * @method version
	 * @return {string} F2 version number
	 */
	version: function() { return "{{sdk.version}}"; }
};

