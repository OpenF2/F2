/*!
 * F2 v<%= version%> <%= grunt.template.today("mm-dd-yyyy")%>
 * Copyright (c) 2014 Markit On Demand, Inc. http://www.openf2.org
 *
 * "F2" is licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed 
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 *
 * Please note that F2 ("Software") may contain third party material that Markit 
 * On Demand Inc. has a license to use and include within the Software (the 
 * "Third Party Material"). A list of the software comprising the Third Party Material 
 * and the terms and conditions under which such Third Party Material is distributed 
 * are reproduced in the ThirdPartyMaterial.md file available at:
 * 
 * https://github.com/OpenF2/F2/blob/master/ThirdPartyMaterial.md
 * 
 * The inclusion of the Third Party Material in the Software does not grant, provide 
 * nor result in you having acquiring any rights whatsoever, other than as stipulated 
 * in the terms and conditions related to the specific Third Party Material, if any.
 *
 */

var F2;
/**
 * Open F2
 * @module f2
 * @main f2
 */

F2 = (function () {

    /**
     * Abosolutizes a relative URL
     * @method _absolutizeURI
     * @private
     * @param {e.g., location.href} base
     * @param {URL to absolutize} href
     * @returns {string} URL
     * Source: https://gist.github.com/Yaffle/1088850
     * Tests: http://skew.org/uri/uri_tests.html
     */
    var _absolutizeURI = function (base, href) {// RFC 3986

        function removeDotSegments(input) {
            var output = [];
            input.replace(/^(\.\.?(\/|$))+/, '')
                .replace(/\/(\.(\/|$))+/g, '/')
                .replace(/\/\.\.$/, '/../')
                .replace(/\/?[^\/]*/g, function (p) {
                    if (p === '/..') {
                        output.pop();
                    } else {
                        output.push(p);
                    }
                });
            return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
        }

        href = _parseURI(href || '');
        base = _parseURI(base || '');

        return !href || !base ? null : (href.protocol || base.protocol) +
        (href.protocol || href.authority ? href.authority : base.authority) +
        removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
        (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
        href.hash;
    };

    /**
     * Parses URI
     * @method _parseURI
     * @private
     * @param {The URL to parse} url
     * @returns {Parsed URL} string
     * Source: https://gist.github.com/Yaffle/1088850
     * Tests: http://skew.org/uri/uri_tests.html
     */
    var _parseURI = function (url) {
        var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
        // authority = '//' + user + ':' + pass '@' + hostname + ':' port
        return (m ? {
            href: m[0] || '',
            protocol: m[1] || '',
            authority: m[2] || '',
            host: m[3] || '',
            hostname: m[4] || '',
            port: m[5] || '',
            pathname: m[6] || '',
            search: m[7] || '',
            hash: m[8] || ''
        } : null);
    };

    return {
        /**
         * A function to pass into F2.stringify which will prevent circular
         * reference errors when serializing objects
         * @method appConfigReplacer
         */
        appConfigReplacer: function (key, value) {
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
        guid: function () {
            var S4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
        },
        /**
         * Search for a value within an array.
         * @method inArray
         * @param {object} value The value to search for
         * @param {Array} array The array to search
         * @return {bool} True if the item is in the array
         */
        inArray: function (value, array) {
            return jQuery.inArray(value, array) > -1;
        },
        /**
         * Tests a URL to see if it's on the same domain (local) or not
         * @method isLocalRequest
         * @param {URL to test} url
         * @returns {bool} Whether the URL is local or not
         * Derived from: https://github.com/jquery/jquery/blob/master/src/ajax.js
         */
        isLocalRequest: function (url) {
            var rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
                urlLower = url.toLowerCase(),
                parts = rurl.exec(urlLower),
                ajaxLocation,
                ajaxLocParts;

            try {
                ajaxLocation = location.href;
            } catch (e) {
                // Use the href attribute of an A element
                // since IE will modify it given document.location
                ajaxLocation = document.createElement('a');
                ajaxLocation.href = '';
                ajaxLocation = ajaxLocation.href;
            }

            ajaxLocation = ajaxLocation.toLowerCase();

            // uh oh, the url must be relative
            // make it fully qualified and re-regex url
            if (!parts) {
                urlLower = _absolutizeURI(ajaxLocation, urlLower).toLowerCase();
                parts = rurl.exec(urlLower);
            }

            // Segment location into parts
            ajaxLocParts = rurl.exec(ajaxLocation) || [];

            // do hostname and protocol and port of manifest URL match location.href? (a "local" request on the same domain)
            var matched = !(parts &&
            (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] ||
            (parts[3] || (parts[1] === 'http:' ? '80' : '443')) !==
            (ajaxLocParts[3] || (ajaxLocParts[1] === 'http:' ? '80' : '443'))));

            return matched;
        },
        /**
         * Utility method to determine whether or not the argument passed in is or is not a native dom node.
         * @method isNativeDOMNode
         * @param {object} testObject The object you want to check as native dom node.
         * @return {bool} Returns true if the object passed is a native dom node.
         */
        isNativeDOMNode: function (testObject) {
            var bIsNode = (
                typeof Node === 'object' ? testObject instanceof Node :
                testObject && typeof testObject === 'object' && typeof testObject.nodeType === 'number' && typeof testObject.nodeName === 'string'
            );

            var bIsElement = (
                typeof HTMLElement === 'object' ? testObject instanceof HTMLElement : //DOM2
                testObject && typeof testObject === 'object' && testObject.nodeType === 1 && typeof testObject.nodeName === 'string'
            );

            return (bIsNode || bIsElement);
        },
        /**
         * A utility logging function to write messages or objects to the browser console. This is a proxy for the [`console` API](https://developers.google.com/chrome-developer-tools/docs/console).
         * @method log
         * @param {object|string} Object/Method An object to be logged _or_ a `console` API method name, such as `warn` or `error`. All of the console method names are [detailed in the Chrome docs](https://developers.google.com/chrome-developer-tools/docs/console-api).
         * @param {object} [obj2]* An object to be logged
         * @example
         //Pass any object (string, int, array, object, bool) to .log()
         F2.log('foo');
         F2.log(myArray);
         //Use a console method name as the first argument.
         F2.log('error', err);
         F2.log('info', 'The session ID is ' + sessionId);
         * Some code derived from [HTML5 Boilerplate console plugin](https://github.com/h5bp/html5-boilerplate/blob/master/js/plugins.js)
         */
        log: function () {
            var _log;
            var _logMethod = 'log';
            var method;
            var noop = function () {
            };
            var methods = [
                'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
                'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
                'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
                'timeStamp', 'trace', 'warn'
            ];
            var length = methods.length;
            var console = (window.console = window.console || {});
            var args;

            while (length--) {
                method = methods[length];

                // Only stub undefined methods.
                if (!console[method]) {
                    console[method] = noop;
                }

                //if first arg is a console function, use it.
                //defaults to console.log()
                if (arguments && arguments.length > 1 && arguments[0] == method) {
                    _logMethod = method;
                    //remove console func from args
                    args = Array.prototype.slice.call(arguments, 1);
                }
            }

            if (Function.prototype.bind) {
                _log = Function.prototype.bind.call(console[_logMethod], console);
            } else {
                _log = function () {
                    Function.prototype.apply.call(console[_logMethod], console, (args || arguments));
                };
            }

            _log.apply(this, (args || arguments));
        },
        /**
         * Wrapper to convert a JSON string to an object
         * @method parse
         * @param {string} str The JSON string to convert
         * @return {object} The parsed object
         */
        parse: function (str) {
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
        stringify: function (value, replacer, space) {
            return JSON.stringify(value, replacer, space);
        },
        /**
         * Function to get the F2 version number
         * @method version
         * @return {string} F2 version number
         */
        version: function () {
            return '<%= version%>';
        }
    };
})();
