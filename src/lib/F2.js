/* global jQuery */

/**
  Open F2
  @module f2
  @main f2
*/
var F2 = (function() {
  /**
    Test whether a value is a native Node
    @method _isNode
    @private
    @param {object} test Any value to test
    @returns {boolean} True if Node
  */
  function _isNode(test) {
    if (typeof Node === 'object') {
      return test instanceof Node;
    }

    return test && typeof test === 'object' && typeof test.nodeType === 'number' && typeof test.nodeName === 'string';
  }

  /**
    Test whether a value is a native Element
    @method _isElement
    @private
    @param {object} test Any value to test
    @returns {boolean} True if Element
  */
  function _isElement(test) {
    if (typeof HTMLElement === 'object') {
      return test instanceof HTMLElement;
    }

    return test && typeof test === 'object' && test.nodeType === 1 && typeof test.nodeName === 'string';
  }

  /**
    Abosolutizes a relative URL
    @method _absolutizeURI
    @private
    @param {string} base The base domain
    @param {strong} href The relative url to make absolute
    @returns {string} URL
    Source: https://gist.github.com/Yaffle/1088850
    Tests: http://skew.org/uri/uri_tests.html
  */
  function _absolutizeURI(base, href) { // RFC 3986
    function removeDotSegments(input) {
      var output = [];
      input.replace(/^(\.\.?(\/|$))+/, '')
        .replace(/\/(\.(\/|$))+/g, '/')
        .replace(/\/\.\.$/, '/../')
        .replace(/\/?[^\/]*/g, function(p) {
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
  }

  /**
    Parses URI into its component parts
    @private
    @method _parseURI
    @param {string} url The url to be parsed
    @returns {object} The parts of the url
    Source: https://gist.github.com/Yaffle/1088850
    Tests: http://skew.org/uri/uri_tests.html
  */
  function _parseURI(url) {
    var whitespacePattern = /^\s+|\s+$/g;
    var uriPattern = /^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/;
    var match = String(url).replace(whitespacePattern, '').match(uriPattern);

    if (match) {
      return {
        href: match[0] || '',
        protocol: match[1] || '',
        authority: match[2] || '',
        host: match[3] || '',
        hostname: match[4] || '',
        port: match[5] || '',
        pathname: match[6] || '',
        search: match[7] || '',
        hash: match[8] || ''
      };
    }
  }

  return {
    /**
      A function to pass into F2.stringify which will prevent circular
      reference errors when serializing objects
      @method appConfigReplacer
      @param {string} key The key being examined
      @param {*} value The value being examined
      @returns {*} Returns the original allowed value or undefined
    */
    appConfigReplacer: function(key, value) {
      if (key === 'root' || key === 'ui' || key === 'height') {
        return undefined;
      } else {
        return value;
      }
    },
    /**
      The apps namespace is a place for app developers to put the javascript
      class that is used to initialize their app. The javascript classes should
      be namepaced with the {{#crossLink "F2.AppConfig"}}{{/crossLink}}.appId.
      It is recommended that the code be placed in a closure to help keep the
      global namespace clean.
      If the class has an 'init' function, that function will be called
      automatically by F2.
      @property Apps
      @type object
      @for F2
      @example
        F2.Apps['com_example_helloworld'] = (function() {
          var App_Class = function(appConfig, appContent, root) {
            this._app = appConfig; // the F2.AppConfig object
            this._appContent = appContent // the F2.AppManifest.AppContent object
            this.$root = $(root); // the root DOM Element that contains this app
          }

          App_Class.prototype.init = function() {
            // perform init actions
          }

          return App_Class;
        })();
      @example
        F2.Apps['com_example_helloworld'] = function(appConfig, appContent, root) {
         return {
           init: function() {
             // Perform init actions
           }
         };
        };
    */
    Apps: {},
    /**
      Creates a namespace on F2 and copies the contents of an object into that
      namespace optionally overwriting existing properties.
      @method extend
      @param {string} ns The namespace to create. Pass a falsy value to
      add properties to the F2 namespace directly.
      @param {object} obj The object to copy into the namespace.
      @param {bool} overwrite True if object properties should be overwritten
      @return {object} The created object
    */
    extend: function(ns, obj, overwrite) {
      var isFunc = typeof obj === 'function';
      var parts = ns ? ns.split('.') : [];
      var parent = this;
      obj = obj || {};

      // Ignore leading global
      if (parts[0] === 'F2') {
        parts = parts.slice(1);
      }

      // Create namespaces
      for (var i = 0, len = parts.length; i < len; i++) {
        if (!parent[parts[i]]) {
          parent[parts[i]] = isFunc && (i + 1 === len) ? obj : {};
        }
        parent = parent[parts[i]];
      }

      // Copy object into namespace
      if (!isFunc) {
        for (var prop in obj) {
          if (parent[prop] === undefined || overwrite) {
            parent[prop] = obj[prop];
          }
        }
      }

      return parent;
    },
    /**
      Generates a somewhat random id
      @method guid
      @return {string} A random id
      @for F2
    */
    guid: function() {
      function s4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return (s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4());
    },
    /**
      Search for a value within an array.
      @method inArray
      @param {object} value The value to search for
      @param {Array} array The array to search
      @return {bool} True if the item is in the array
    */
    inArray: function(value, array) {
      return jQuery.inArray(value, array) > -1;
    },
    /**
      Tests a URL to see if it's on the same domain (local) or not
      @method isLocalRequest
      @param {string} url The url to test
      @returns {bool} Whether the URL is local or not
      Derived from: https://github.com/jquery/jquery/blob/master/src/ajax.js
    */
    isLocalRequest: function(url){
      var urlPattern = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/;
      var urlLower = url.toLowerCase();
      var parts = urlPattern.exec(urlLower);
      var ajaxLocation;
      var ajaxLocParts;

      try {
        ajaxLocation = location.href;
      } catch (e) {
        // Use the href of an anchor since IE accounts for document.location
        ajaxLocation = document.createElement('a');
        ajaxLocation.href = '';
        ajaxLocation = ajaxLocation.href;
      }

      ajaxLocation = ajaxLocation.toLowerCase();

      // The url must be relative, so fully qualify it and re-regex url
      if (!parts) {
        urlLower = _absolutizeURI(ajaxLocation, urlLower).toLowerCase();
        parts = urlPattern.exec(urlLower);
      }

      // Segment location into parts
      ajaxLocParts = urlPattern.exec(ajaxLocation) || [];

      // Do hostname and protocol and port of manifest URL match location.href? (a "local" request on the same domain)
      var matched = !(parts &&
        (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] ||
        (parts[3] || (parts[1] === 'http:' ? '80' : '443')) !==
        (ajaxLocParts[3] || (ajaxLocParts[1] === 'http:' ? '80' : '443'))));

      return matched;
    },
    /**
      Utility method to determine whether or not the argument passed in is or
      is not a native DOM node.
      @method isNativeDOMNode
      @param {object} testObject The object you want to check as native DOM
      node.
      @return {bool} Returns true if the object passed is a native DOM node.
    */
    isNativeDOMNode: function(testObject) {
      return _isNode(testObject) || _isElement(testObject);
    },
    /**
      A utility logging function to write messages or objects to the browser
      console. This is a proxy for the
      [`console` API](https://developers.google.com/chrome-developer-tools/docs/console).
      @method log
      @param {object|string} Object/Method An object to be logged _or_ a
      `console` API method name, such as `warn` or `error`. All of the console
      method names are
      [detailed in the Chrome docs](https://developers.google.com/chrome-developer-tools/docs/console-api).
      @param {object} [obj2]* An object to be logged
      @example
        Pass any value (string, int, array, object, bool).
          F2.log('foo');
          F2.log([1, 2, 3]);
      @example
        Use a console method name as the first argument.
          F2.log('error', err);
          F2.log('info', 'The session ID is ' + sessionId);
    */
    log: function() {
      if (!window.console) {
        return;
      }

      var method = 'log';
      var args = Array.prototype.slice.apply(arguments);

      if (args.length > 1 && args[0] in window.console) {
        method = args.shift();
      }

      if (window.console[method]) {
        window.console[method].apply(window.console, args);
      }
    },
    /**
      Wrapper to convert a JSON string to an object
      @method parse
      @param {string} str The JSON string to convert
      @return {object} The parsed object
    */
    parse: function(str) {
      return JSON.parse(str);
    },
    /**
      Wrapper to convert an object to JSON
      **Note: When using F2.stringify on an F2.AppConfig object, it is
      recommended to pass F2.appConfigReplacer as the replacer function in
      order to prevent circular serialization errors.**
      @method stringify
      @param {object} value The object to convert
      @param {function|Array} replacer An optional parameter that determines
      how object values are stringified for objects. It can be a function or an
      array of strings.
      @param {int|string} space An optional parameter that specifies the
      indentation of nested structures. If it is omitted, the text will be
      packed without extra whitespace. If it is a number, it will specify the
      number of spaces to indent at each level. If it is a string (such as '\t'
      or '&nbsp;'), it contains the characters used to indent at each level.
      @return {string} The JSON string
    */
    stringify: function(value, replacer, space) {
      return JSON.stringify(value, replacer, space);
    },
    /**
      Function to get the F2 version number
      @method version
      @return {string} F2 version number
    */
    version: function() {
      return '<%= version%>';
    }
  };
})();

module.exports = F2;
