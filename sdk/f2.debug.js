;(function(exports) {

	if (exports.F2 && !exports.F2_TESTING_MODE) {
		return;
	}

/*
Copyright (c) 2016 http://component.github.io/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


 ;!function(exports, undefined) {
	/**
	 * Tests for browser support.
	 */

	var innerHTMLBug = false;
	var bugTestDiv;
	if (typeof document !== 'undefined') {
	  bugTestDiv = document.createElement('div');
	  // Setup
	  bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
	  // Make sure that link elements get serialized correctly by innerHTML
	  // This requires a wrapper element in IE
	  innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
	  bugTestDiv = undefined;
	}

	/**
	 * Wrap map from jquery.
	 */

	var map = {
	  legend: [1, '<fieldset>', '</fieldset>'],
	  tr: [2, '<table><tbody>', '</tbody></table>'],
	  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
	  // for script/link/style tags to work in IE6-8, you have to wrap
	  // in a div with a non-whitespace character in front, ha!
	  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
	};

	map.td =
	map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

	map.option =
	map.optgroup = [1, '<select multiple="multiple">', '</select>'];

	map.thead =
	map.tbody =
	map.colgroup =
	map.caption =
	map.tfoot = [1, '<table>', '</table>'];

	map.polyline =
	map.ellipse =
	map.polygon =
	map.circle =
	map.text =
	map.line =
	map.path =
	map.rect =
	map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

	/**
	 * Parse `html` and return a DOM Node instance, which could be a TextNode,
	 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
	 * instance, depending on the contents of the `html` string.
	 *
	 * @param {String} html - HTML string to "domify"
	 * @param {Document} doc - The `document` instance to create the Node for
	 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
	 * @api private
	 */

	function parse(html, doc) {
	  if ('string' != typeof html) throw new TypeError('String expected, got ' + typeof html);

	  // default to the global `document` object
	  if (!doc) doc = document;

	  // tag name
	  var m = /<([\w:]+)/.exec(html);
	  if (!m) return doc.createTextNode(html);

	  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

	  var tag = m[1];

	  // body support
	  if (tag == 'body') {
	    var el = doc.createElement('html');
	    el.innerHTML = html;
	    return el.removeChild(el.lastChild);
	  }

	  // wrap map
	  var wrap = map[tag] || map._default;
	  var depth = wrap[0];
	  var prefix = wrap[1];
	  var suffix = wrap[2];
	  var el = doc.createElement('div');
	  el.innerHTML = prefix + html + suffix;
	  while (depth--) el = el.lastChild;

	  // one element
	  if (el.firstChild == el.lastChild) {
	    return el.removeChild(el.firstChild);
	  }

	  // several elements
	  var fragment = doc.createDocumentFragment();
	  while (el.firstChild) {
	    fragment.appendChild(el.removeChild(el.firstChild));
	  }

	  return fragment;
	}

	exports.domify = parse; 

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);

(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod);
    global.fetchJsonp = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var defaultOptions = {
    timeout: 5000,
    jsonpCallback: 'callback',
    jsonpCallbackFunction: null
  };

  function generateCallbackFunction() {
    return 'jsonp_' + Date.now() + '_' + Math.ceil(Math.random() * 100000);
  }

  function clearFunction(functionName) {
    // IE8 throws an exception when you try to delete a property on window
    // http://stackoverflow.com/a/1824228/751089
    try {
      delete window[functionName];
    } catch (e) {
      window[functionName] = undefined;
    }
  }

  function removeScript(scriptId) {
    var script = document.getElementById(scriptId);
    if (script) {
      document.getElementsByTagName('head')[0].removeChild(script);
    }
  }

  function fetchJsonp(_url) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    // to avoid param reassign
    var url = _url;
    var timeout = options.timeout || defaultOptions.timeout;
    var jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback;

    var timeoutId = undefined;

    return new Promise(function (resolve, reject) {
      var callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction();
      var scriptId = jsonpCallback + '_' + callbackFunction;

      window[callbackFunction] = function (response) {
        resolve({
          ok: true,
          // keep consistent with fetch API
          json: function json() {
            return Promise.resolve(response);
          }
        });

        if (timeoutId) clearTimeout(timeoutId);

        removeScript(scriptId);

        clearFunction(callbackFunction);
      };

      // Check if the user set their own params, and if not add a ? to start a list of params
      url += url.indexOf('?') === -1 ? '?' : '&';

      var jsonpScript = document.createElement('script');
      jsonpScript.setAttribute('src', '' + url + jsonpCallback + '=' + callbackFunction);
      if (options.charset) {
        jsonpScript.setAttribute('charset', options.charset);
      }
      jsonpScript.id = scriptId;
      document.getElementsByTagName('head')[0].appendChild(jsonpScript);

      timeoutId = setTimeout(function () {
        reject(new Error('JSONP request to ' + _url + ' timed out'));

        clearFunction(callbackFunction);
        removeScript(scriptId);
        window[callbackFunction] = function () {
          clearFunction(callbackFunction);
        };
      }, timeout);

      // Caught if got 404/500
      jsonpScript.onerror = function () {
        reject(new Error('JSONP request to ' + _url + ' failed'));

        clearFunction(callbackFunction);
        removeScript(scriptId);
        if (timeoutId) clearTimeout(timeoutId);
      };
    });
  }

  // export as global function
  /*
  let local;
  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }
  local.fetchJsonp = fetchJsonp;
  */

  module.exports = fetchJsonp;
});
/**
 * @license
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash include="cloneDeep,noConflict" exports="global"`
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre-ES5 environments. */
  var undefined;

  /** Used as the semantic version number. */
  var VERSION = '4.17.5';

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG = 1,
      CLONE_FLAT_FLAG = 2,
      CLONE_SYMBOLS_FLAG = 4;

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      asyncTag = '[object AsyncFunction]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      nullTag = '[object Null]',
      objectTag = '[object Object]',
      promiseTag = '[object Promise]',
      proxyTag = '[object Proxy]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]',
      undefinedTag = '[object Undefined]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
  typedArrayTags[errorTag] = typedArrayTags[funcTag] =
  typedArrayTags[mapTag] = typedArrayTags[numberTag] =
  typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
  typedArrayTags[setTag] = typedArrayTags[stringTag] =
  typedArrayTags[weakMapTag] = false;

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
  cloneableTags[boolTag] = cloneableTags[dateTag] =
  cloneableTags[float32Tag] = cloneableTags[float64Tag] =
  cloneableTags[int8Tag] = cloneableTags[int16Tag] =
  cloneableTags[int32Tag] = cloneableTags[mapTag] =
  cloneableTags[numberTag] = cloneableTags[objectTag] =
  cloneableTags[regexpTag] = cloneableTags[setTag] =
  cloneableTags[stringTag] = cloneableTags[symbolTag] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[weakMapTag] = false;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /** Detect free variable `exports`. */
  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Detect free variable `process` from Node.js. */
  var freeProcess = moduleExports && freeGlobal.process;

  /** Used to access faster Node.js helpers. */
  var nodeUtil = (function() {
    try {
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }());

  /* Node.js helper references. */
  var nodeIsMap = nodeUtil && nodeUtil.isMap,
      nodeIsSet = nodeUtil && nodeUtil.isSet,
      nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

  /*--------------------------------------------------------------------------*/

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
  function arrayFilter(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  /*--------------------------------------------------------------------------*/

  /** Used for built-in method references. */
  var arrayProto = Array.prototype,
      funcProto = Function.prototype,
      objectProto = Object.prototype;

  /** Used to detect overreaching core-js shims. */
  var coreJsData = root['__core-js_shared__'];

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /** Used to restore the original `_` reference in `_.noConflict`. */
  var oldDash = root._;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /** Built-in value references. */
  var Buffer = moduleExports ? root.Buffer : undefined,
      Symbol = root.Symbol,
      Uint8Array = root.Uint8Array,
      allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined,
      getPrototype = overArg(Object.getPrototypeOf, Object),
      objectCreate = Object.create,
      propertyIsEnumerable = objectProto.propertyIsEnumerable,
      splice = arrayProto.splice,
      symToStringTag = Symbol ? Symbol.toStringTag : undefined;

  var defineProperty = (function() {
    try {
      var func = getNative(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols = Object.getOwnPropertySymbols,
      nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
      nativeKeys = overArg(Object.keys, Object);

  /* Built-in method references that are verified to be native. */
  var DataView = getNative(root, 'DataView'),
      Map = getNative(root, 'Map'),
      Promise = getNative(root, 'Promise'),
      Set = getNative(root, 'Set'),
      WeakMap = getNative(root, 'WeakMap'),
      nativeCreate = getNative(Object, 'create');

  /** Used to lookup unminified function names. */
  var realNames = {};

  /** Used to detect maps, sets, and weakmaps. */
  var dataViewCtorString = toSource(DataView),
      mapCtorString = toSource(Map),
      promiseCtorString = toSource(Promise),
      setCtorString = toSource(Set),
      weakMapCtorString = toSource(WeakMap);

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol ? Symbol.prototype : undefined,
      symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

  /*------------------------------------------------------------------------*/

  /**
   * Creates a `lodash` object which wraps `value` to enable implicit method
   * chain sequences. Methods that operate on and return arrays, collections,
   * and functions can be chained together. Methods that retrieve a single value
   * or may return a primitive value will automatically end the chain sequence
   * and return the unwrapped value. Otherwise, the value must be unwrapped
   * with `_#value`.
   *
   * Explicit chain sequences, which must be unwrapped with `_#value`, may be
   * enabled using `_.chain`.
   *
   * The execution of chained methods is lazy, that is, it's deferred until
   * `_#value` is implicitly or explicitly called.
   *
   * Lazy evaluation allows several methods to support shortcut fusion.
   * Shortcut fusion is an optimization to merge iteratee calls; this avoids
   * the creation of intermediate arrays and can greatly reduce the number of
   * iteratee executions. Sections of a chain sequence qualify for shortcut
   * fusion if the section is applied to an array and iteratees accept only
   * one argument. The heuristic for whether a section qualifies for shortcut
   * fusion is subject to change.
   *
   * Chaining is supported in custom builds as long as the `_#value` method is
   * directly or indirectly included in the build.
   *
   * In addition to lodash methods, wrappers have `Array` and `String` methods.
   *
   * The wrapper `Array` methods are:
   * `concat`, `join`, `pop`, `push`, `shift`, `sort`, `splice`, and `unshift`
   *
   * The wrapper `String` methods are:
   * `replace` and `split`
   *
   * The wrapper methods that support shortcut fusion are:
   * `at`, `compact`, `drop`, `dropRight`, `dropWhile`, `filter`, `find`,
   * `findLast`, `head`, `initial`, `last`, `map`, `reject`, `reverse`, `slice`,
   * `tail`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, and `toArray`
   *
   * The chainable wrapper methods are:
   * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`, `at`,
   * `before`, `bind`, `bindAll`, `bindKey`, `castArray`, `chain`, `chunk`,
   * `commit`, `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`,
   * `curry`, `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`,
   * `difference`, `differenceBy`, `differenceWith`, `drop`, `dropRight`,
   * `dropRightWhile`, `dropWhile`, `extend`, `extendWith`, `fill`, `filter`,
   * `flatMap`, `flatMapDeep`, `flatMapDepth`, `flatten`, `flattenDeep`,
   * `flattenDepth`, `flip`, `flow`, `flowRight`, `fromPairs`, `functions`,
   * `functionsIn`, `groupBy`, `initial`, `intersection`, `intersectionBy`,
   * `intersectionWith`, `invert`, `invertBy`, `invokeMap`, `iteratee`, `keyBy`,
   * `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`, `matchesProperty`,
   * `memoize`, `merge`, `mergeWith`, `method`, `methodOf`, `mixin`, `negate`,
   * `nthArg`, `omit`, `omitBy`, `once`, `orderBy`, `over`, `overArgs`,
   * `overEvery`, `overSome`, `partial`, `partialRight`, `partition`, `pick`,
   * `pickBy`, `plant`, `property`, `propertyOf`, `pull`, `pullAll`, `pullAllBy`,
   * `pullAllWith`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`, `reject`,
   * `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`, `shuffle`,
   * `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`, `takeRight`,
   * `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`, `toArray`,
   * `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`, `unary`,
   * `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`, `unset`,
   * `unshift`, `unzip`, `unzipWith`, `update`, `updateWith`, `values`,
   * `valuesIn`, `without`, `wrap`, `xor`, `xorBy`, `xorWith`, `zip`,
   * `zipObject`, `zipObjectDeep`, and `zipWith`
   *
   * The wrapper methods that are **not** chainable by default are:
   * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
   * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `conformsTo`, `deburr`,
   * `defaultTo`, `divide`, `each`, `eachRight`, `endsWith`, `eq`, `escape`,
   * `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`, `findLast`,
   * `findLastIndex`, `findLastKey`, `first`, `floor`, `forEach`, `forEachRight`,
   * `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `get`, `gt`, `gte`, `has`,
   * `hasIn`, `head`, `identity`, `includes`, `indexOf`, `inRange`, `invoke`,
   * `isArguments`, `isArray`, `isArrayBuffer`, `isArrayLike`, `isArrayLikeObject`,
   * `isBoolean`, `isBuffer`, `isDate`, `isElement`, `isEmpty`, `isEqual`,
   * `isEqualWith`, `isError`, `isFinite`, `isFunction`, `isInteger`, `isLength`,
   * `isMap`, `isMatch`, `isMatchWith`, `isNaN`, `isNative`, `isNil`, `isNull`,
   * `isNumber`, `isObject`, `isObjectLike`, `isPlainObject`, `isRegExp`,
   * `isSafeInteger`, `isSet`, `isString`, `isUndefined`, `isTypedArray`,
   * `isWeakMap`, `isWeakSet`, `join`, `kebabCase`, `last`, `lastIndexOf`,
   * `lowerCase`, `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `meanBy`,
   * `min`, `minBy`, `multiply`, `noConflict`, `noop`, `now`, `nth`, `pad`,
   * `padEnd`, `padStart`, `parseInt`, `pop`, `random`, `reduce`, `reduceRight`,
   * `repeat`, `result`, `round`, `runInContext`, `sample`, `shift`, `size`,
   * `snakeCase`, `some`, `sortedIndex`, `sortedIndexBy`, `sortedLastIndex`,
   * `sortedLastIndexBy`, `startCase`, `startsWith`, `stubArray`, `stubFalse`,
   * `stubObject`, `stubString`, `stubTrue`, `subtract`, `sum`, `sumBy`,
   * `template`, `times`, `toFinite`, `toInteger`, `toJSON`, `toLength`,
   * `toLower`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`, `trim`,
   * `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`, `upperCase`,
   * `upperFirst`, `value`, and `words`
   *
   * @name _
   * @constructor
   * @category Seq
   * @param {*} value The value to wrap in a `lodash` instance.
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * function square(n) {
   *   return n * n;
   * }
   *
   * var wrapped = _([1, 2, 3]);
   *
   * // Returns an unwrapped value.
   * wrapped.reduce(_.add);
   * // => 6
   *
   * // Returns a wrapped value.
   * var squares = wrapped.map(square);
   *
   * _.isArray(squares);
   * // => false
   *
   * _.isArray(squares.value());
   * // => true
   */
  function lodash() {
    // No operation performed.
  }

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} proto The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  var baseCreate = (function() {
    function object() {}
    return function(proto) {
      if (!isObject(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object;
      object.prototype = undefined;
      return result;
    };
  }());

  /*------------------------------------------------------------------------*/

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Hash(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : undefined;
  }

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
  }

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
    return this;
  }

  // Add methods to `Hash`.
  Hash.prototype.clear = hashClear;
  Hash.prototype['delete'] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;

  /*------------------------------------------------------------------------*/

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }

  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function listCacheDelete(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }

  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */
  function listCacheSet(key, value) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  // Add methods to `ListCache`.
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype['delete'] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;

  /*------------------------------------------------------------------------*/

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      'hash': new Hash,
      'map': new (Map || ListCache),
      'string': new Hash
    };
  }

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete(key) {
    var result = getMapData(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  function mapCacheSet(key, value) {
    var data = getMapData(this, key),
        size = data.size;

    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }

  // Add methods to `MapCache`.
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype['delete'] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;

  /*------------------------------------------------------------------------*/

  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */
  function stackClear() {
    this.__data__ = new ListCache;
    this.size = 0;
  }

  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function stackDelete(key) {
    var data = this.__data__,
        result = data['delete'](key);

    this.size = data.size;
    return result;
  }

  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function stackGet(key) {
    return this.__data__.get(key);
  }

  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function stackHas(key) {
    return this.__data__.has(key);
  }

  /**
   * Sets the stack `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Stack
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the stack cache instance.
   */
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }

  // Add methods to `Stack`.
  Stack.prototype.clear = stackClear;
  Stack.prototype['delete'] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;

  /*------------------------------------------------------------------------*/

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value),
        isArg = !isArr && isArguments(value),
        isBuff = !isArr && !isArg && isBuffer(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty.call(value, key)) &&
          !(skipIndexes && (
             // Safari 9 has enumerable `arguments.length` in strict mode.
             key == 'length' ||
             // Node.js 0.10 has enumerable non-index properties on buffers.
             (isBuff && (key == 'offset' || key == 'parent')) ||
             // PhantomJS 2 has enumerable non-index properties on typed arrays.
             (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
             // Skip index properties.
             isIndex(key, length)
          ))) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
        (value === undefined && !(key in object))) {
      baseAssignValue(object, key, value);
    }
  }

  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.assign` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssign(object, source) {
    return object && copyObject(source, keys(source), object);
  }

  /**
   * The base implementation of `_.assignIn` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssignIn(object, source) {
    return object && copyObject(source, keysIn(source), object);
  }

  /**
   * The base implementation of `assignValue` and `assignMergeValue` without
   * value checks.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function baseAssignValue(object, key, value) {
    if (key == '__proto__' && defineProperty) {
      defineProperty(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }

  /**
   * The base implementation of `_.clone` and `_.cloneDeep` which tracks
   * traversed objects.
   *
   * @private
   * @param {*} value The value to clone.
   * @param {boolean} bitmask The bitmask flags.
   *  1 - Deep clone
   *  2 - Flatten inherited properties
   *  4 - Clone symbols
   * @param {Function} [customizer] The function to customize cloning.
   * @param {string} [key] The key of `value`.
   * @param {Object} [object] The parent object of `value`.
   * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
   * @returns {*} Returns the cloned value.
   */
  function baseClone(value, bitmask, customizer, key, object, stack) {
    var result,
        isDeep = bitmask & CLONE_DEEP_FLAG,
        isFlat = bitmask & CLONE_FLAT_FLAG,
        isFull = bitmask & CLONE_SYMBOLS_FLAG;

    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject(value)) {
      return value;
    }
    var isArr = isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray(value, result);
      }
    } else {
      var tag = getTag(value),
          isFunc = tag == funcTag || tag == genTag;

      if (isBuffer(value)) {
        return cloneBuffer(value, isDeep);
      }
      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
        result = (isFlat || isFunc) ? {} : initCloneObject(value);
        if (!isDeep) {
          return isFlat
            ? copySymbolsIn(value, baseAssignIn(result, value))
            : copySymbols(value, baseAssign(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = initCloneByTag(value, tag, isDeep);
      }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new Stack);
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);

    if (isSet(value)) {
      value.forEach(function(subValue) {
        result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
      });

      return result;
    }

    if (isMap(value)) {
      value.forEach(function(subValue, key) {
        result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });

      return result;
    }

    var keysFunc = isFull
      ? (isFlat ? getAllKeysIn : getAllKeys)
      : (isFlat ? keysIn : keys);

    var props = isArr ? undefined : keysFunc(value);
    arrayEach(props || value, function(subValue, key) {
      if (props) {
        key = subValue;
        subValue = value[key];
      }
      // Recursively populate clone (susceptible to call stack limits).
      assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
    return result;
  }

  /**
   * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
   * `keysFunc` and `symbolsFunc` to get the enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @param {Function} symbolsFunc The function to get the symbols of `object`.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
  }

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }

  /**
   * The base implementation of `_.isMap` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   */
  function baseIsMap(value) {
    return isObjectLike(value) && getTag(value) == mapTag;
  }

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  /**
   * The base implementation of `_.isSet` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   */
  function baseIsSet(value) {
    return isObjectLike(value) && getTag(value) == setTag;
  }

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray(value) {
    return isObjectLike(value) &&
      isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn(object) {
    if (!isObject(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype(object),
        result = [];

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Creates a clone of  `buffer`.
   *
   * @private
   * @param {Buffer} buffer The buffer to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Buffer} Returns the cloned buffer.
   */
  function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var length = buffer.length,
        result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

    buffer.copy(result);
    return result;
  }

  /**
   * Creates a clone of `arrayBuffer`.
   *
   * @private
   * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
   * @returns {ArrayBuffer} Returns the cloned array buffer.
   */
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array(result).set(new Uint8Array(arrayBuffer));
    return result;
  }

  /**
   * Creates a clone of `dataView`.
   *
   * @private
   * @param {Object} dataView The data view to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned data view.
   */
  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }

  /**
   * Creates a clone of `regexp`.
   *
   * @private
   * @param {Object} regexp The regexp to clone.
   * @returns {Object} Returns the cloned regexp.
   */
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }

  /**
   * Creates a clone of the `symbol` object.
   *
   * @private
   * @param {Object} symbol The symbol object to clone.
   * @returns {Object} Returns the cloned symbol object.
   */
  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }

  /**
   * Creates a clone of `typedArray`.
   *
   * @private
   * @param {Object} typedArray The typed array to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned typed array.
   */
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }

  /**
   * Copies the values of `source` to `array`.
   *
   * @private
   * @param {Array} source The array to copy values from.
   * @param {Array} [array=[]] The array to copy values to.
   * @returns {Array} Returns `array`.
   */
  function copyArray(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property identifiers to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer
        ? customizer(object[key], source[key], key, object, source)
        : undefined;

      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue(object, key, newValue);
      }
    }
    return object;
  }

  /**
   * Copies own symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbols(source, object) {
    return copyObject(source, getSymbols(source), object);
  }

  /**
   * Copies own and inherited symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbolsIn(source, object) {
    return copyObject(source, getSymbolsIn(source), object);
  }

  /**
   * Creates an array of own enumerable property names and symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeys(object) {
    return baseGetAllKeys(object, keys, getSymbols);
  }

  /**
   * Creates an array of own and inherited enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeysIn(object) {
    return baseGetAllKeys(object, keysIn, getSymbolsIn);
  }

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key)
      ? data[typeof key == 'string' ? 'string' : 'hash']
      : data.map;
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }

  /**
   * Creates an array of the own enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols(object), function(symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };

  /**
   * Creates an array of the own and inherited enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
    var result = [];
    while (object) {
      arrayPush(result, getSymbols(object));
      object = getPrototype(object);
    }
    return result;
  };

  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  var getTag = baseGetTag;

  // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
  if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
      (Map && getTag(new Map) != mapTag) ||
      (Promise && getTag(Promise.resolve()) != promiseTag) ||
      (Set && getTag(new Set) != setTag) ||
      (WeakMap && getTag(new WeakMap) != weakMapTag)) {
    getTag = function(value) {
      var result = baseGetTag(value),
          Ctor = result == objectTag ? value.constructor : undefined,
          ctorString = Ctor ? toSource(Ctor) : '';

      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString: return dataViewTag;
          case mapCtorString: return mapTag;
          case promiseCtorString: return promiseTag;
          case setCtorString: return setTag;
          case weakMapCtorString: return weakMapTag;
        }
      }
      return result;
    };
  }

  /**
   * Initializes an array clone.
   *
   * @private
   * @param {Array} array The array to clone.
   * @returns {Array} Returns the initialized clone.
   */
  function initCloneArray(array) {
    var length = array.length,
        result = new array.constructor(length);

    // Add properties assigned by `RegExp#exec`.
    if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  /**
   * Initializes an object clone.
   *
   * @private
   * @param {Object} object The object to clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneObject(object) {
    return (typeof object.constructor == 'function' && !isPrototype(object))
      ? baseCreate(getPrototype(object))
      : {};
  }

  /**
   * Initializes an object clone based on its `toStringTag`.
   *
   * **Note:** This function only supports cloning values with tags of
   * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
   *
   * @private
   * @param {Object} object The object to clone.
   * @param {string} tag The `toStringTag` of the object to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag:
        return cloneArrayBuffer(object);

      case boolTag:
      case dateTag:
        return new Ctor(+object);

      case dataViewTag:
        return cloneDataView(object, isDeep);

      case float32Tag: case float64Tag:
      case int8Tag: case int16Tag: case int32Tag:
      case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
        return cloneTypedArray(object, isDeep);

      case mapTag:
        return new Ctor;

      case numberTag:
      case stringTag:
        return new Ctor(object);

      case regexpTag:
        return cloneRegExp(object);

      case setTag:
        return new Ctor;

      case symbolTag:
        return cloneSymbol(object);
    }
  }

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;

    return !!length &&
      (type == 'number' ||
        (type != 'symbol' && reIsUint.test(value))) &&
          (value > -1 && value % 1 == 0 && value < length);
  }

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
      ? (value !== '__proto__')
      : (value === null);
  }

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

    return value === proto;
  }

  /**
   * This function is like
   * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * except that it includes inherited enumerable properties.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  /*------------------------------------------------------------------------*/

  /**
   * This method is like `_.clone` except that it recursively clones `value`.
   *
   * @static
   * @memberOf _
   * @since 1.0.0
   * @category Lang
   * @param {*} value The value to recursively clone.
   * @returns {*} Returns the deep cloned value.
   * @see _.clone
   * @example
   *
   * var objects = [{ 'a': 1 }, { 'b': 2 }];
   *
   * var deep = _.cloneDeep(objects);
   * console.log(deep[0] === objects[0]);
   * // => false
   */
  function cloneDeep(value) {
    return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
  }

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
      !propertyIsEnumerable.call(value, 'callee');
  };

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  /**
   * Checks if `value` is a buffer.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
   * @example
   *
   * _.isBuffer(new Buffer(2));
   * // => true
   *
   * _.isBuffer(new Uint8Array(2));
   * // => false
   */
  var isBuffer = nativeIsBuffer || stubFalse;

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  /**
   * Checks if `value` is classified as a `Map` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   * @example
   *
   * _.isMap(new Map);
   * // => true
   *
   * _.isMap(new WeakMap);
   * // => false
   */
  var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

  /**
   * Checks if `value` is classified as a `Set` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   * @example
   *
   * _.isSet(new Set);
   * // => true
   *
   * _.isSet(new WeakSet);
   * // => false
   */
  var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

  /*------------------------------------------------------------------------*/

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
  }

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn(object) {
    return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
  }

  /*------------------------------------------------------------------------*/

  /**
   * Reverts the `_` variable to its previous value and returns a reference to
   * the `lodash` function.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @returns {Function} Returns the `lodash` function.
   * @example
   *
   * var lodash = _.noConflict();
   */
  function noConflict() {
    if (root._ === this) {
      root._ = oldDash;
    }
    return this;
  }

  /**
   * This method returns a new empty array.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {Array} Returns the new empty array.
   * @example
   *
   * var arrays = _.times(2, _.stubArray);
   *
   * console.log(arrays);
   * // => [[], []]
   *
   * console.log(arrays[0] === arrays[1]);
   * // => false
   */
  function stubArray() {
    return [];
  }

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */
  function stubFalse() {
    return false;
  }

  /*------------------------------------------------------------------------*/

  // Add methods that return wrapped values in chain sequences.
  lodash.keys = keys;
  lodash.keysIn = keysIn;

  /*------------------------------------------------------------------------*/

  // Add methods that return unwrapped values in chain sequences.
  lodash.cloneDeep = cloneDeep;
  lodash.eq = eq;
  lodash.isArguments = isArguments;
  lodash.isArray = isArray;
  lodash.isArrayLike = isArrayLike;
  lodash.isBuffer = isBuffer;
  lodash.isFunction = isFunction;
  lodash.isLength = isLength;
  lodash.isMap = isMap;
  lodash.isObject = isObject;
  lodash.isObjectLike = isObjectLike;
  lodash.isSet = isSet;
  lodash.isTypedArray = isTypedArray;
  lodash.stubArray = stubArray;
  lodash.stubFalse = stubFalse;
  lodash.noConflict = noConflict;

  /*------------------------------------------------------------------------*/

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type {string}
   */
  lodash.VERSION = VERSION;

  /*--------------------------------------------------------------------------*/

  // Export to the global object.
  root._ = lodash;
}.call(this));

/*!
 * Ensure no conflict for thirty party modules
 */
var _ = window._.noConflict();

/*!
 * Hij1nx requires the following notice to accompany EventEmitter:
 * 
 * Copyright (c) 2011 hij1nx 
 * 
 * http://www.twitter.com/hij1nx
 * 
 * Version: 2013-09-17
 * GitHub SHA: 3caacce662998d7903d368b0c0f847f259cae0f7
 * https://github.com/hij1nx/EventEmitter2
 * Diff this version to master: https://github.com/hij1nx/EventEmitter2/compare/3caacce662998d7903d368b0c0f847f259cae0f7...master
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the 'Software'), to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 */
 ;!function(exports, undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {

      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);
      conf.maxListeners && (this._events.maxListeners = conf.maxListeners);
      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    configure.call(this, conf);
  }

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }

    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else if(typeof tree._listeners === 'function') {
          tree._listeners = [tree._listeners, listener];
        }
        else if (isArray(tree._listeners)) {

          tree._listeners.push(listener);

          if (!tree._listeners.warned) {

            var m = defaultMaxListeners;

            if (typeof this._events.maxListeners !== 'undefined') {
              m = this._events.maxListeners;
            }

            if (m > 0 && tree._listeners.length > m) {

              tree._listeners.warned = true;
              console.error('(node) warning: possible EventEmitter memory ' +
                            'leak detected. %d listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit.',
                            tree._listeners.length);
              console.trace();
            }
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  }

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    this._events || init.call(this);
    this._events.maxListeners = n;
    if (!this._conf) this._conf = {};
    this._conf.maxListeners = n;
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function(event, fn) {
    this.many(event, 1, fn);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      fn.apply(this, arguments);
    }

    listener._origin = fn;

    this.on(event, listener);

    return self;
  };

  EventEmitter.prototype.emit = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) { return false; }
    }

    // Loop through the *_all* functions and invoke them.
    if (this._all) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        this._all[i].apply(this, args);
      }
    }

    // If there is no 'error' event listener then throw.
    if (type === 'error') {

      if (!this._all &&
        !this._events.error &&
        !(this.wildcard && this.listenerTree.error)) {

        if (arguments[1] instanceof Error) {
          throw arguments[1]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
        return false;
      }
    }

    var handler;

    if(this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    }
    else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      if (arguments.length === 1) {
        handler.call(this);
      }
      else if (arguments.length > 1)
        switch (arguments.length) {
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            var l = arguments.length;
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
            handler.apply(this, args);
        }
      return true;
    }
    else if (handler) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        this.event = type;
        listeners[i].apply(this, args);
      }
      return (listeners.length > 0) || this._all;
    }
    else {
      return this._all;
    }

  };

  EventEmitter.prototype.on = function(type, listener) {

    if (typeof type === 'function') {
      this.onAny(type);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if(this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else if(typeof this._events[type] === 'function') {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    }
    else if (isArray(this._events[type])) {
      // If we've already got an array, just append.
      this._events[type].push(listener);

      // Check for listener leak
      if (!this._events[type].warned) {

        var m = defaultMaxListeners;

        if (typeof this._events.maxListeners !== 'undefined') {
          m = this._events.maxListeners;
        }

        if (m > 0 && this._events[type].length > m) {

          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
          console.trace();
        }
      }
    }
    return this;
  };

  EventEmitter.prototype.onAny = function(fn) {

    if(!this._all) {
      this._all = [];
    }

    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    // Add the function to the event listener collection.
    this._all.push(fn);
    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1);
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }
        return this;
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }
      }
    }

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          return this;
        }
      }
    } else {
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else {
      if (!this._events[type]) return this;
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if(this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

// if (typeof define === 'function' && define.amd) {
  //   define('EventEmitter2', [], function() {
  //     return EventEmitter;
  //   });
  // } else {
    exports.EventEmitter2 = EventEmitter; 
  // }

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);


/*!
 * F2 v2.0.0-alpha 02-01-2021
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

F2 = (function() {

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
	var _absolutizeURI = function(base, href) {// RFC 3986

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
	var _parseURI = function(url) {
		var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
		// authority = '//' + user + ':' + pass '@' + hostname + ':' port
		return (m ? {
				href     : m[0] || '',
				protocol : m[1] || '',
				authority: m[2] || '',
				host     : m[3] || '',
				hostname : m[4] || '',
				port     : m[5] || '',
				pathname : m[6] || '',
				search   : m[7] || '',
				hash     : m[8] || ''
			} : null);
	};

	return {
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
		 *             this.$root = root; // the root DOM Element that contains this app
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
			return (S4()+S4()+'-'+S4()+'-'+S4()+'-'+S4()+'-'+S4()+S4()+S4());
		},
		/**
		 * Tests a URL to see if it's on the same domain (local) or not
		 * @method isLocalRequest
		 * @param {URL to test} url
		 * @returns {bool} Whether the URL is local or not
		 * Derived from: https://github.com/jquery/jquery/blob/master/src/ajax.js
		 */
		isLocalRequest: function(url){
			var rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
				urlLower = url.toLowerCase(),
				parts = rurl.exec( urlLower ),
				ajaxLocation,
				ajaxLocParts;

			try {
				ajaxLocation = location.href;
			} catch( e ) {
				// Use the href attribute of an A element
				// since IE will modify it given document.location
				ajaxLocation = document.createElement('a');
				ajaxLocation.href = '';
				ajaxLocation = ajaxLocation.href;
			}

			ajaxLocation = ajaxLocation.toLowerCase();

			// uh oh, the url must be relative
			// make it fully qualified and re-regex url
			if (!parts){
				urlLower = _absolutizeURI(ajaxLocation,urlLower).toLowerCase();
				parts = rurl.exec( urlLower );
			}

			// Segment location into parts
			ajaxLocParts = rurl.exec( ajaxLocation ) || [];

			// do hostname and protocol and port of manifest URL match location.href? (a "local" request on the same domain)
			var matched = !(parts &&
					(parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
						(parts[ 3 ] || (parts[ 1 ] === 'http:' ? '80' : '443')) !==
							(ajaxLocParts[ 3 ] || (ajaxLocParts[ 1 ] === 'http:' ? '80' : '443'))));

			return matched;
		},
		/**
		 * Utility method to determine whether or not the argument passed in is or is not a native dom node.
		 * @method isNativeDOMNode
		 * @param {object} testObject The object you want to check as native dom node.
		 * @return {bool} Returns true if the object passed is a native dom node.
		 */
		isNativeDOMNode: function(testObject) {
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
		log: function() {
			var _log;
			var _logMethod = 'log';
			var method;
			var noop = function () { };
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
				if (arguments && arguments.length > 1 && arguments[0] == method){
					_logMethod = method;
					//remove console func from args
					args = Array.prototype.slice.call(arguments, 1);
				}
			}

			if (Function.prototype.bind) {
				_log = Function.prototype.bind.call(console[_logMethod], console);
			} else {
				_log = function() {
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
		version: function() { return '2.0.0-alpha'; }
	};
})();

/**
 * The new `AppHandlers` functionality provides Container Developers a higher level of control over configuring app rendering and interaction.
 *
 *<p class="alert alert-block alert-warning">
 *The addition of `F2.AppHandlers` replaces the previous {{#crossLink "F2.ContainerConfig"}}{{/crossLink}} properties `beforeAppRender`, `appRender`, and `afterAppRender`. These methods were deprecated&mdash;but not removed&mdash;in version 1.2. They will be permanently removed in a future version of F2.
 *</p>
 *
 *<p class="alert alert-block alert-info">
 *Starting with F2 version 1.2, `AppHandlers` is the preferred method for Container Developers to manage app layout.
 *</p>
 *
 * ### Order of Execution
 * 
 * **App Rendering**
 *
 * 0. {{#crossLink "F2/registerApps"}}F2.registerApps(){{/crossLink}} method is called by the Container Developer and the following methods are run for *each* {{#crossLink "F2.AppConfig"}}{{/crossLink}} passed.
 * 1. **'appCreateRoot'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_CREATE\_ROOT*) handlers are fired in the order they were attached.
 * 2. **'appRenderBefore'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_RENDER\_BEFORE*) handlers are fired in the order they were attached.
 * 3. Each app's `manifestUrl` is requested asynchronously; on success the following methods are fired.
 * 3. **'appRender'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_RENDER*) handlers are fired in the order they were attached.
 * 4. **'appRenderAfter'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_RENDER\_AFTER*) handlers are fired in the order they were attached.
 *
 *
 * **App Removal**

 * 0. {{#crossLink "F2/removeApp"}}F2.removeApp(){{/crossLink}} with a specific {{#crossLink "F2.AppConfig/instanceId "}}{{/crossLink}} or {{#crossLink "F2/removeAllApps"}}F2.removeAllApps(){{/crossLink}} method is called by the Container Developer and the following methods are run.
 * 1. **'appDestroyBefore'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_DESTROY\_BEFORE*) handlers are fired in the order they were attached.
 * 2. **'appDestroy'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_DESTROY*) handlers are fired in the order they were attached.
 * 3. **'appDestroyAfter'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_DESTROY\_AFTER*) handlers are fired in the order they were attached.
 * 
 * **Error Handling**

 * 0. **'appScriptLoadFailed'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_SCRIPT\_LOAD\_FAILED*) handlers are fired in the order they were attached.
 * 
 * @class F2.AppHandlers
 */
F2.extend('AppHandlers', (function() {

	// the hidden token that we will check against every time someone tries to add, remove, fire handler
	var _ct = F2.guid();
	var _f2t = F2.guid();
	
	var _handlerCollection = {
		appManifestRequestFail: [],
		appCreateRoot: [],
		appRenderBefore: [],
		appDestroyBefore: [],
		appRenderAfter: [],
		appDestroyAfter: [],
		appRender: [],
		appDestroy: [],
		appScriptLoadFailed: []
	};
	
	var _defaultMethods = {
		appRender: function(appConfig, appHtml)
		{
			// if no app root is defined use the app's outer most node
			if(!F2.isNativeDOMNode(appConfig.root))
			{
				appConfig.root = domify(appHtml);
			}
			else
			{
				// append the app html to the root
				appConfig.root.appendChild(domify(appHtml));
			}
			
			// append the root to the body by default.
			document.body.appendChild(appConfig.root);
		},
		appDestroy: function(appInstance)
		{
			// call the apps destroy method, if it has one
			if(appInstance && appInstance.app && appInstance.app.destroy && typeof(appInstance.app.destroy) == 'function')
			{
				appInstance.app.destroy();
			}
			// warn the Container and App Developer that even though they have a destroy method it hasn't been 
			else if(appInstance && appInstance.app && appInstance.app.destroy)
			{
				F2.log(appInstance.config.appId + ' has a destroy property, but destroy is not of type function and as such will not be executed.');
			}

			// remove the root
			appInstance.config.root.parentNode.removeChild(appInstance.config.root);
		}
	};
	
	var _createHandler = function(token, sNamespace, func_or_element, bDomNodeAppropriate)
	{	
		// will throw an exception and stop execution if the token is invalid
		_validateToken(token);
		
		// create handler structure. Not all arguments properties will be populated/used.
		var handler = {
			func: (typeof(func_or_element)) ? func_or_element : null,
			namespace: sNamespace,
			domNode: (F2.isNativeDOMNode(func_or_element)) ? func_or_element : null
		};
		
		if(!handler.func && !handler.domNode)
		{
			throw ('Invalid or null argument passed. Handler will not be added to collection. A valid dom element or callback function is required.');
		}

		if(handler.domNode && !bDomNodeAppropriate)
		{
			throw ('Invalid argument passed. Handler will not be added to collection. A callback function is required for this event type.');
		}
		
		return handler;
	};
	
	var _validateToken = function(sToken)
	{
		// check token against F2 and container
		if(_ct != sToken && _f2t != sToken) { throw ('Invalid token passed. Please verify that you have correctly received and stored token from F2.AppHandlers.getToken().'); }
	};
	
	var _removeHandler = function(sToken, eventKey, sNamespace)
	{
		// will throw an exception and stop execution if the token is invalid
		_validateToken(sToken);
		
		if(!sNamespace && !eventKey)
		{			
			return;
		}
		// remove by event key
		else if(!sNamespace && eventKey)
		{
			_handlerCollection[eventKey] = [];
		}
		// remove by namespace only
		else if(sNamespace && !eventKey)
		{
			sNamespace = sNamespace.toLowerCase();		
		
			for(var currentEventKey in _handlerCollection)
			{
				var eventCollection = _handlerCollection[currentEventKey];
				var newEvents = [];

				for(var i = 0, ec = eventCollection.length; i < ec; i++)
				{
					var currentEventHandler = eventCollection[i];
					if(currentEventHandler)
					{
						if(!currentEventHandler.namespace || currentEventHandler.namespace.toLowerCase() != sNamespace)
						{
							newEvents.push(currentEventHandler);
						}
					}
				}

				eventCollection = newEvents;				
			}			
		}
		else if(sNamespace && _handlerCollection[eventKey])
		{
			sNamespace = sNamespace.toLowerCase();		
		
			var newHandlerCollection = [];
			
			for(var iCounter = 0, hc = _handlerCollection[eventKey].length; iCounter < hc; iCounter++)
			{
				var currentHandler = _handlerCollection[eventKey][iCounter];
				if(currentHandler)
				{
					if(!currentHandler.namespace || currentHandler.namespace.toLowerCase() != sNamespace)
					{
						newHandlerCollection.push(currentHandler);
					}
				}
			}
			
			_handlerCollection[eventKey] = newHandlerCollection;
		}
	};
	
	return {
		/**
		* Allows Container Developer to retrieve a unique token which must be passed to
		* all `on` and `off` methods. This function will self destruct and can only be called 
		* one time. Container Developers must store the return value inside of a closure.
		* @method getToken		 
		**/
		getToken: function()
		{
			// delete this method for security that way only the container has access to the token 1 time.
			// kind of Ethan Hunt-ish, this message will self destruct immediately.
			delete this.getToken;
			// return the token, which we validate against.
			return _ct;
		},
		/**
		* Allows F2 to get a token internally. Token is required to call {{#crossLink "F2.AppHandlers/\_\_trigger:method"}}{{/crossLink}}.
		* This function will self destruct to eliminate other sources from using the {{#crossLink "F2.AppHandlers/\_\_trigger:method"}}{{/crossLink}}
		* and additional internal methods.
		* @method __f2GetToken
		* @private
		**/
		__f2GetToken: function()
		{
			// delete this method for security that way only the F2 internally has access to the token 1 time.
			// kind of Ethan Hunt-ish, this message will self destruct immediately.
			delete this.__f2GetToken;
			// return the token, which we validate against.
			return _f2t;
		},
		/**
		* Allows F2 to trigger specific events internally.
		* @method __trigger
		* @private
		* @chainable
		* @param {String} token The token received from {{#crossLink "F2.AppHandlers/\_\_f2GetToken:method"}}{{/crossLink}}.
		* @param {String} eventKey The event to fire. The complete list of event keys is available in {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
		**/
		__trigger: function(token, eventKey) // additional arguments will likely be passed
		{			
			// will throw an exception and stop execution if the token is invalid
			if(token != _f2t)
			{
				throw ('Token passed is invalid. Only F2 is allowed to call F2.AppHandlers.__trigger().');
			}
			
			if(_handlerCollection && _handlerCollection[eventKey])
			{				
				// create a collection of arguments that are safe to pass to the callback.
				var passableArgs = [];
				
				// populate that collection with all arguments except token and eventKey
				for(var i = 2, j = arguments.length; i < j; i++)
				{
					passableArgs.push(arguments[i]);
				}
				
				if(_handlerCollection[eventKey].length === 0 && _defaultMethods[eventKey])
				{
					_defaultMethods[eventKey].apply(F2, passableArgs);
					return this;
				}
				else if(_handlerCollection[eventKey].length === 0 && !_handlerCollection[eventKey])
				{
					return this;
				}
				
				// fire all event listeners in the order that they were added.
				for(var iCounter = 0, hcl = _handlerCollection[eventKey].length; iCounter < hcl; iCounter++)
				{
					var handler = _handlerCollection[eventKey][iCounter];
					
					// appRender where root is already defined
					if (handler.domNode && arguments[2] && arguments[2].root && arguments[3])
					{
						arguments[2].root.appendChild(domify(arguments[3]));
						handler.domNode.appendChild(arguments[2].root);
					}
					else if (handler.domNode && arguments[2] && !arguments[2].root && arguments[3])
					{
						// set the root to the actual HTML of the app
						arguments[2].root = domify(arguments[3]);
						// appends the root to the dom node specified
						handler.domNode.appendChild(arguments[2].root);
					}
					else
					{
						handler.func.apply(F2, passableArgs);
					}
				}
			}
			else
			{
				throw ('Invalid EventKey passed. Check your inputs and try again.');
			}
			
			return this;
		},
		/**
		* Allows Container Developer to easily tell all apps to render in a specific location. Only valid for eventType `appRender`.
		* @method on
		* @chainable
		* @param {String} token The token received from {{#crossLink "F2.AppHandlers/getToken:method"}}{{/crossLink}}.
		* @param {String} eventKey{.namespace} The event key used to determine which event to attach the listener to. The namespace is useful for removal 
		* purposes. At this time it does not affect when an event is fired. Complete list of event keys available in 
		* {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
		* @params {HTMLElement} element Specific DOM element to which app gets appended.
		* @example
		*	var _token = F2.AppHandlers.getToken();
		*	F2.AppHandlers.on(
		*		_token,
		*		'appRender',
		*		document.getElementById('my_app')
		*	);
		*
		* Or:
		* @example
		*	F2.AppHandlers.on(
		*		_token,
		*		'appRender.myNamespace',
		*		document.getElementById('my_app')
		*	);
		**/
		/**
		* Allows Container Developer to add listener method that will be triggered when a specific event occurs.
		* @method on
		* @chainable
		* @param {String} token The token received from {{#crossLink "F2.AppHandlers/getToken:method"}}{{/crossLink}}.
		* @param {String} eventKey{.namespace} The event key used to determine which event to attach the listener to. The namespace is useful for removal 
		* purposes. At this time it does not affect when an event is fired. Complete list of event keys available in 
		* {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
		* @params {Function} listener A function that will be triggered when a specific event occurs. For detailed argument definition refer to {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
		* @example
		*	var _token = F2.AppHandlers.getToken();
		*	F2.AppHandlers.on(
		*		_token,
		*		'appRenderBefore'
		*		function() { F2.log('before app rendered!'); }
		*	);
		*
		* Or:
		* @example
		*	F2.AppHandlers.on(
		*		_token,
		*		'appRenderBefore.myNamespace',
		*		function() { F2.log('before app rendered!'); }
		*	);
		**/
		on: function(token, eventKey, func_or_element)
		{
			var sNamespace = null;
			
			if(!eventKey)
			{
				throw ('eventKey must be of type string and not null. For available appHandlers check F2.Constants.AppHandlers.');
			}
			
			// we need to check the key for a namespace
			if(eventKey.indexOf('.') > -1)
			{
				var arData = eventKey.split('.');
				eventKey = arData[0];
				sNamespace = arData[1];
			}
			
			if(_handlerCollection && _handlerCollection[eventKey])
			{
				_handlerCollection[eventKey].push(
					_createHandler(
						token,
						sNamespace,
						func_or_element,
						(eventKey == 'appRender')
					)
				);
			}
			else
			{
				throw ('Invalid EventKey passed. Check your inputs and try again.');
			}
			
			return this;
		},
		/**
		* Allows Container Developer to remove listener methods for specific events
		* @method off
		* @chainable
		* @param {String} token The token received from {{#crossLink "F2.AppHandlers/getToken:method"}}{{/crossLink}}.
		* @param {String} eventKey{.namespace} The event key used to determine which event to attach the listener to. If no namespace is provided all
		*  listeners for the specified event type will be removed.
		*  Complete list available in {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
		* @example
		*	var _token = F2.AppHandlers.getToken();
		*	F2.AppHandlers.off(_token,'appRenderBefore');
		*
		**/
		off: function(token, eventKey)
		{
			var sNamespace = null;
			
			if(!eventKey)
			{
				throw ('eventKey must be of type string and not null. For available appHandlers check F2.Constants.AppHandlers.');
			}
			
			// we need to check the key for a namespace
			if(eventKey.indexOf('.') > -1)
			{
				var arData = eventKey.split('.');
				eventKey = arData[0];
				sNamespace = arData[1];
			}
			
			if(_handlerCollection && _handlerCollection[eventKey])
			{				
				_removeHandler(
					token,
					eventKey,
					sNamespace
				);
			}
			else
			{
				throw ('Invalid EventKey passed. Check your inputs and try again.');
			}
			
			return this;
		}
	};
})());

F2.extend('Constants', {
	/**
	* A convenient collection of all available appHandler events.
	* @class F2.Constants.AppHandlers
	**/
	AppHandlers: (function()
	{
		return {
			/**
			* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the
			* following argument(s): ( {{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}} )
			* @property APP_MANIFEST_REQUEST_FAIL
			* @type string
			* @static
			* @final
			* @example
			*	var _token = F2.AppHandlers.getToken();
			*	F2.AppHandlers.on(
			*		_token,
			*		F2.Constants.AppHandlers.APP_MANIFEST_REQUEST_FAIL,
			*		function(appConfig)
			*		{
			*			You can use information from the appConfig to surface a custom error message in the dom
			*			Or display some kind of default error placeholder element rather than having a blank spot in the dom
			*		}
			*	);
			*/
			APP_MANIFEST_REQUEST_FAIL: 'appManifestRequestFail',
			/**
			* Equivalent to `appCreateRoot`. Identifies the create root method for use in AppHandlers.on/off. 
			* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the 
			* following argument(s): ( {{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}} )
			* @property APP_CREATE_ROOT
			* @type string
			* @static
			* @final
			* @example
			*	var _token = F2.AppHandlers.getToken();
			*	F2.AppHandlers.on(
			*		_token,
			*		F2.Constants.AppHandlers.APP_CREATE_ROOT,
			*		function(appConfig)
			*		{
			*			// If you want to create a custom root. By default F2 uses the app's outermost HTML element.
			*			// the app's html is not available until after the manifest is retrieved so this logic occurs in F2.Constants.AppHandlers.APP_RENDER
			*			appConfig.root = document.createElement('section');
			*		}
			*	);
			*/
			APP_CREATE_ROOT: 'appCreateRoot',
			/**
			 * Equivalent to `appRenderBefore`. Identifies the before app render method for use in AppHandlers.on/off. 
			 * When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the 
			 * following argument(s): ( {{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}} )
			 * @property APP_RENDER_BEFORE
			 * @type string
			 * @static
			 * @final
			 * @example
			 *	var _token = F2.AppHandlers.getToken();
			 *	F2.AppHandlers.on(
			 *		_token,
			 *		F2.Constants.AppHandlers.APP_RENDER_BEFORE,
			 *		function(appConfig)
			 *		{
			 *			F2.log(appConfig);
			 *		}
			 *	);
			 */
			APP_RENDER_BEFORE: 'appRenderBefore',
			/**
			* Equivalent to `appRender`. Identifies the app render method for use in AppHandlers.on/off. 
			* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the 
			* following argument(s): ( {{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}}, [appHtml](../../app-development.html#app-design) )
			* @property APP_RENDER
			* @type string
			* @static
			* @final
			* @example
			*	TODO: WRITE $QUERYLESS EXAMPLE
			*/		
			APP_RENDER: 'appRender',
			/**
			* Equivalent to `appRenderAfter`. Identifies the after app render method for use in AppHandlers.on/off. 
			* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the 
			* following argument(s): ( {{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}} )
			* @property APP_RENDER_AFTER
			* @type string
			* @static
			* @final
			* @example
			*	var _token = F2.AppHandlers.getToken();
			*	F2.AppHandlers.on(
			*		_token,
			*		F2.Constants.AppHandlers.APP_RENDER_AFTER,
			*		function(appConfig)
			*		{
			*			F2.log(appConfig);
			*		}
			*	);
			*/	
			APP_RENDER_AFTER: 'appRenderAfter',
			/**
			* Equivalent to `appDestroyBefore`. Identifies the before app destroy method for use in AppHandlers.on/off. 
			* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the 
			* following argument(s): ( appInstance )
			* @property APP_DESTROY_BEFORE
			* @type string
			* @static
			* @final
			* @example
			*	var _token = F2.AppHandlers.getToken();
			*	F2.AppHandlers.on(
			*		_token,
			*		F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
			*		function(appInstance)
			*		{
			*			F2.log(appInstance);
			*		}
			*	);
			*/
			APP_DESTROY_BEFORE: 'appDestroyBefore',
			/**
			* Equivalent to `appDestroy`. Identifies the app destroy method for use in AppHandlers.on/off. 
			* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the 
			* following argument(s): ( appInstance )
			* @property APP_DESTROY
			* @type string
			* @static
			* @final
			* @example
			*	TODO: WRITE $QUERYLESS EXAMPLE
			*/		
			APP_DESTROY: 'appDestroy',
			/**
			* Equivalent to `appDestroyAfter`. Identifies the after app destroy method for use in AppHandlers.on/off. 
			* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the 
			* following argument(s): ( appInstance )
			* @property APP_DESTROY_AFTER
			* @type string
			* @static
			* @final
			* @example
			*	TODO: WRITE $QUERYLESS EXAMPLE
			*/
			APP_DESTROY_AFTER: 'appDestroyAfter',
			/**
			* Equivalent to `appScriptLoadFailed`. Identifies the app script load failed method for use in AppHandlers.on/off. 
			* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the 
			* following argument(s): ( {{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}}, scriptInfo )
			* @property APP_SCRIPT_LOAD_FAILED
			* @type string
			* @static
			* @final
			* @example
			*	var _token = F2.AppHandlers.getToken();
			*	F2.AppHandlers.on(
			*		_token,
			*		F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
			*		function(appConfig, scriptInfo)
			*		{
			*			F2.log(appConfig.appId);
			*		}
			*	);
			*/
			APP_SCRIPT_LOAD_FAILED: 'appScriptLoadFailed'
		};
	})()
});
/**
 * Class stubs for documentation purposes
 * @main F2
 */
F2.extend('', {
	/**
	 * The App Class is an optional class that can be namespaced onto the 
	 * {{#crossLink "F2\Apps"}}{{/crossLink}} namespace.  The 
	 * [F2 Docs](../../app-development.html#app-class)
	 * has more information on the usage of the App Class.
	 * @class F2.App
	 * @constructor
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object for the app
	 * @param {F2.AppManifest.AppContent} appContent The F2.AppManifest.AppContent
	 * object
	 * @param {Element} root The root DOM Element for the app
	 */
	App: function(appConfig, appContent, root) {
		return {
			/**
			 * An optional init function that will automatically be called when
			 *{{#crossLink "F2/registerApps"}}F2.registerApps(){{/crossLink}} is called.
			 * @method init
			 * @optional
			 */
			init:function() {},
			/**
			 * An optional destroy function that will automatically be called when
			 * {{#crossLink "F2/removeApp"}}F2.removeApp(){{/crossLink}} and subsequently
			 * the {{#crossLink "F2.Constants.AppHandlers/APP_DESTROY:property"}}F2.Constants.AppHandlers.APP_DESTROY{{/crossLink}} AppHandler.
			 * @method destroy
			 * @optional
			 */
			destroy:function() {}
		};
	},
	/**
	 * The AppConfig object represents an app's meta data
	 * @class F2.AppConfig
	 */
	AppConfig: {
		/**
		 * The unique ID of the app. More information can be found
		 * [here](../../app-development.html#f2-appid)
		 * @property appId
		 * @type string
		 * @required
		 */
		appId: '',
		/**
		 * An object that represents the context of an app
		 * @property context
		 * @type object
		 */
		context: {},
		/**
		 * True if the app should be requested in a single request with other apps.
		 * @property enableBatchRequests
		 * @type bool
		 * @default false
		 */
		enableBatchRequests: false,
		/**
		 * The height of the app. The initial height will be pulled from
		 * the {{#crossLink "F2.AppConfig"}}{{/crossLink}} object
		 * @property height
		 * @type int
		 */
		height: 0,
		/**
		 * The unique runtime ID of the app.
		 *
		 * **This property is populated during the
		 * F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process**
		 * @property instanceId
		 * @type string
		 */
		instanceId: '',
		/**
		 * The language and region specification for this container 
		 * represented as an IETF-defined standard language tag,
		 * e.g. `"en-us"` or `"de-de"`. This is passed during the 
		 * F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process.
		 *
		 * @property containerLocale
		 * @type string
		 * @default null
		 * @since 1.4.0
		 */
		containerLocale: null,
		/**
		 * The languages and regions supported by this app represented
		 * as an array of IETF-defined standard language tags,
		 * e.g. `["en-us","de-de"]`. 
		 *
		 * @property localeSupport
		 * @type array
		 * @default []
		 * @since 1.4.0
		 */
		localeSupport: [],
		/**
		 * The url to retrieve the {{#crossLink "F2.AppManifest"}}{{/crossLink}}
		 * object.
		 * @property manifestUrl
		 * @type string
		 * @required
		 */
		manifestUrl: '',
		/**
		 * The recommended maximum width in pixels that this app should be run.
		 * **It is up to the [container](../../container-development.html) to
		 * implement the logic to prevent an app from being run when the maxWidth
		 * requirements are not met.**
		 * @property maxWidth
		 * @type int
		 */
		maxWidth: 0,
		/**
		 * The recommended minimum grid size that this app should be run. This
		 * value corresponds to the 12-grid system that is used by the
		 * [container](../../container-development.html). This property should be
		 * set by apps that require a certain number of columns in their layout.
		 * @property minGridSize
		 * @type int
		 * @default 4
		 */
		minGridSize: 4,
		/**
		 * The recommended minimum width in pixels that this app should be run. **It
		 * is up to the [container](../../container-development.html) to implement
		 * the logic to prevent an app from being run when the minWidth requirements
		 * are not met.
		 * @property minWidth
		 * @type int
		 * @default 300
		 */
		minWidth: 300,
		/**
		 * The name of the app
		 * @property name
		 * @type string
		 * @required
		 */
		name: '',
		/**
		 * The root DOM element that contains the app
		 *
		 * **This property is populated during the
		 * F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process**
		 * @property root
		 * @type Element
		 */
		root: undefined
	},
	/**
	 * The assets needed to render an app on the page
	 * @class F2.AppManifest
	 */
	AppManifest: {
		/**
		 * The array of {{#crossLink "F2.AppManifest.AppContent"}}{{/crossLink}}
		 * objects
		 * @property apps
		 * @type Array
		 * @required
		 */
		apps: [],
		/**
		 * Any inline javascript tha should initially be run
		 * @property inlineScripts
		 * @type Array
		 * @optional
		 */
		inlineScripts: [],
		/**
		 * Urls to javascript files required by the app
		 * @property scripts
		 * @type Array
		 * @optional
		 */
		scripts: [],
		/**
		 * Urls to CSS files required by the app
		 * @property styles
		 * @type Array
		 * @optional
		 */
		styles: []
	},
	/**
	 * The AppContent object
	 * @class F2.AppManifest.AppContent
	 **/
	AppContent: {
		/**
		 * Arbitrary data to be passed along with the app
		 * @property data
		 * @type object
		 * @optional
		 */
		data: {},
		/**
		 * The string of HTML representing the app
		 * @property html
		 * @type string
		 * @required
		 */
		html: '',
		/**
		 * A status message
		 * @property status
		 * @type string
		 * @optional
		 */
		status: ''
	},
	/**
	 * An object containing configuration information for the
	 * [container](../../container-development.html)
	 * @class F2.ContainerConfig
	 */
	ContainerConfig: {		
		/**
		 * True to enable debug mode in F2.js. Adds additional logging, resource cache busting, etc.
		 * @property debugMode
		 * @type bool
		 * @default false
		 */
		debugMode: false,
		/**
		 * The default language and region specification for this container 
		 * represented as an IETF-defined standard language tag,
		 * e.g. `"en-us"` or `"de-de"`. This value is passed to each app
		 * registered as `containerLocale`.
		 *
		 * @property locale
		 * @type string
		 * @default null
		 * @since 1.4.0
		 */
		locale: null,
		/**
		 * Milliseconds before F2 fires callback on script resource load errors. Due to issue with the way Internet Explorer attaches load events to script elements, the error event doesn't fire.
		 * @property scriptErrorTimeout
		 * @type milliseconds
		 * @default 7000 (7 seconds)
		 */
		scriptErrorTimeout: 7000,
		/**
		 * Allows the container to fully override how the AppManifest request is
		 * made inside of F2.
		 * 
		 * @method xhr
		 * @param {string} url The manifest url
		 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}}
		 * objects
		 * @param {function} success The function to be called if the request
		 * succeeds
		 * @param {function} error The function to be called if the request fails
		 * @param {function} complete The function to be called when the request
		 * finishes (after success and error callbacks have been executed)
		 * @return {XMLHttpRequest} The XMLHttpRequest object (or an object that has
		 * an `abort` function (such as the jqXHR object in jQuery) to abort the
		 * request)
		 *
		 * @example
		 *     F2.init({
		 *         xhr: function(url, appConfigs, success, error, complete) {
		 *          TODO: add fetch jsonp example
		 *         }
		 *     });
		 *
		 * @for F2.ContainerConfig
		 */
		//xhr: function(url, appConfigs, success, error, complete) {},
		/**
		 * Allows the container to override individual parts of the AppManifest
		 * request.  See properties and methods with the `xhr.` prefix.
		 * @property xhr
		 * @type Object
		 *
		 * @example
		 *     F2.init({
		 *         xhr: {
		 *             url: function(url, appConfigs) {
		 *                 return 'http://example.com/proxy.php?url=' + encocdeURIComponent(url);
		 *             }
		 *         }
		 *     });
		 */
		xhr: {
			/**
			 * Allows the container to override the request data type (JSON or JSONP)
			 * that is used for the request
			 * @method xhr.dataType
			 * @param {string} url The manifest url
			 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}}
			 * objects
			 * @return {string} The request data type that should be used
			 *
			 * @example
			 *     F2.init({
			 *         xhr: {
			 *             dataType: function(url) {
			 *                 return F2.isLocalRequest(url) ? 'json' : 'jsonp';
			 *             },
			 *             type: function(url) {
			 *                 return F2.isLocalRequest(url) ? 'POST' : 'GET';
			 *             }
			 *         }
			 *     });
			 */
			dataType: function(url, appConfigs) {},
			/**
			 * Allows the container to override the request method that is used (just
			 * like the `type` parameter to `jQuery.ajax()`.
			 * @method xhr.type
			 * @param {string} url The manifest url
			 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}}
			 * objects
			 * @return {string} The request method that should be used
			 *
			 * @example
			 *     F2.init({
			 *         xhr: {
			 *             dataType: function(url) {
			 *                 return F2.isLocalRequest(url) ? 'json' : 'jsonp';
			 *             },
			 *             type: function(url) {
			 *                 return F2.isLocalRequest(url) ? 'POST' : 'GET';
			 *             }
			 *         }
			 *     });
			 */
			type: function(url, appConfigs) {},
			/**
			 * Allows the container to override the url that is used to request an
			 * app's F2.{{#crossLink "F2.AppManifest"}}{{/crossLink}}
			 * @method xhr.url
			 * @param {string} url The manifest url
			 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}}
			 * objects
			 * @return {string} The url that should be used for the request
			 *
			 * @example
			 *     F2.init({
			 *         xhr: {
			 *             url: function(url, appConfigs) {
			 *                 return 'http://example.com/proxy.php?url=' + encocdeURIComponent(url);
			 *             }
			 *         }
			 *     });
			 */
			url: function(url, appConfigs) {}
		},
		/**
		 * Allows the container to override the script loader which requests
		 * dependencies defined in the {{#crossLink "F2.AppManifest"}}{{/crossLink}}.
		 * @property loadScripts
		 * @type function
		 *
		 * @example
		 *     F2.init({
		 *			loadScripts: function(scripts,inlines,callback){
		 *				//load scripts using $.load() for each script or require(scripts)
		 *				callback();
		 *			}
		 *     });
		 */
		loadScripts: function(scripts,inlines,callback){},
		/**
		 * Allows the container to override the stylesheet loader which requests
		 * dependencies defined in the {{#crossLink "F2.AppManifest"}}{{/crossLink}}.
		 * @property loadStyles
		 * @type function
		 *
		 * @example
		 *     F2.init({
		 *			loadStyles: function(styles,callback){
		 *				//load styles using $.load() for each stylesheet or another method
		 *				callback();
		 *			}
		 *     });
		 */
		loadStyles: function(styles,callback){}
	}
});
/**
 * Constants used throughout the Open Financial Framework
 * @class F2.Constants
 * @static
 */
F2.extend('Constants', {
	/**
	 * CSS class constants
	 * @class F2.Constants.Css
	 */
	Css: (function() {

		/** @private */
		var _PREFIX = 'f2-';

		return {
			/**
			 * The APP class should be applied to the DOM Element that surrounds the
			 * entire app, including any extra html that surrounds the APP\_CONTAINER
			 * that is inserted by the container. See the 
			 * {{#crossLink "F2.ContainerConfig"}}{{/crossLink}} object.
			 * @property APP
			 * @type string
			 * @static
			 * @final
			 */
			APP: _PREFIX + 'app',
			/**
			 * The APP\_CONTAINER class should be applied to the outermost DOM Element
			 * of the app.
			 * @property APP_CONTAINER
			 * @type string
			 * @static
			 * @final
			 */
			APP_CONTAINER: _PREFIX + 'app-container'
		};
	})(),
	
	/**
	 * Events constants
	 * @class F2.Constants.Events
	 */
	Events: (function() {
		/** @private */
		var _APP_EVENT_PREFIX = 'App.';
		/** @private */
		var _CONTAINER_EVENT_PREFIX = 'Container.';

		return {
			/**
			 * The APP_SCRIPTS_LOADED event is fired when all the scripts defined in
			 * the AppManifest have been loaded.
			 * @property APP_SCRIPTS_LOADED
			 * @type string
			 * @static
			 * @final
			 */
			APP_SCRIPTS_LOADED: _APP_EVENT_PREFIX + 'scriptsLoaded',
			/**
			 * The APP\_SYMBOL\_CHANGE event is fired when the symbol is changed in an
			 * app. It is up to the app developer to fire this event.
			 * Returns an object with the symbol and company name:
			 *
			 *     { symbol: 'MSFT', name: 'Microsoft Corp (NASDAQ)' }
			 *
			 * @property APP_SYMBOL_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			APP_SYMBOL_CHANGE: _APP_EVENT_PREFIX + 'symbolChange',
			/**
			 * The APP\_WIDTH\_CHANGE event will be fired by the container when the
			 * width of an app is changed. The app's instanceId should be concatenated
			 * to this constant.
			 * Returns an object with the gridSize and width in pixels:
			 *
			 *     { gridSize:8, width:620 }
			 *
			 * @property APP_WIDTH_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			APP_WIDTH_CHANGE: _APP_EVENT_PREFIX + 'widthChange.',
			/**
			 * The CONTAINER\_SYMBOL\_CHANGE event is fired when the symbol is changed
			 * at the container level. This event should only be fired by the
			 * container or container provider.
			 * Returns an object with the symbol and company name:
			 *
			 *     { symbol: 'MSFT', name: 'Microsoft Corp (NASDAQ)' }
			 *
			 * @property CONTAINER_SYMBOL_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			CONTAINER_SYMBOL_CHANGE: _CONTAINER_EVENT_PREFIX + 'symbolChange',
			/**
			 * The CONTAINER\_WIDTH\_CHANGE event will be fired by the container when
			 * the width of the container has changed.
			 * @property CONTAINER_WIDTH_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			CONTAINER_WIDTH_CHANGE: _CONTAINER_EVENT_PREFIX + 'widthChange',
			/**
			 * The CONTAINER\_LOCALE\_CHANGE event will be fired by the container when
			 * the locale of the container has changed. This event should only be fired by the
			 * container or container provider.
			 * Returns an object with the updated locale (IETF-defined standard language tag):
			 *
			 *     { locale: 'en-us' }
			 *
			 * @property CONTAINER_LOCALE_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			CONTAINER_LOCALE_CHANGE: _CONTAINER_EVENT_PREFIX + 'localeChange',
			/**
			 * The RESOURCE_FAILED_TO_LOAD event will be fired by the container when
			 * it fails to load a script or style.
			 * @property RESOURCE_FAILED_TO_LOAD
			 * @depreciated since 1.4
			 * @type string
			 * @static
			 * @final
			 */
			RESOURCE_FAILED_TO_LOAD: _CONTAINER_EVENT_PREFIX + 'resourceFailedToLoad'
		};
	})(),

	JSONP_CALLBACK: 'F2_jsonpCallback_',

	AppStatus: {
		ERROR: 'ERROR',
		SUCCESS: 'SUCCESS'
	}
});

/**
 * Handles [Context](../../app-development.html#context) passing from
 * containers to apps and apps to apps.
 * @class F2.Events
 */
F2.extend('Events', (function() {
	// init EventEmitter
	var _events = new EventEmitter2({
		wildcard:true
	});

	// unlimited listeners, set to > 0 for debugging
	_events.setMaxListeners(0);

	return {
		/**
		 * Execute each of the listeners that may be listening for the specified
		 * event name in order with the list of arguments.
		 * @method emit
		 * @param {string} event The event name
		 * @param {object} [arg]* The arguments to be passed
		 */
		emit: function() {
			return EventEmitter2.prototype.emit.apply(_events, [].slice.call(arguments));
		},
		/**
		 * Adds a listener that will execute n times for the event before being 
		 * removed. The listener is invoked only the first time the event is 
		 * fired, after which it is removed.
		 * @method many
		 * @param {string} event The event name
		 * @param {int} timesToListen The number of times to execute the event
		 * before being removed
		 * @param {function} listener The function to be fired when the event is
		 * emitted
		 */
		many: function(event, timesToListen, listener) {
			return _events.many(event, timesToListen, listener);
		},
		/**
		 * Remove a listener for the specified event.
		 * @method off
		 * @param {string} event The event name
		 * @param {function} listener The function that will be removed
		 */
		off: function(event, listener) {
			return _events.off(event, listener);
		},
		/**
		 * Adds a listener for the specified event
		 * @method on
		 * @param {string} event The event name
		 * @param {function} listener The function to be fired when the event is
		 * emitted
		 */
		on: function(event, listener){
			return _events.on(event, listener);
		},
		/**
		 * Adds a one time listener for the event. The listener is invoked only
		 * the first time the event is fired, after which it is removed.
		 * @method once
		 * @param {string} event The event name
		 * @param {function} listener The function to be fired when the event is
		 * emitted
		 */
		once: function(event, listener) {
			return _events.once(event, listener);
		}
	};
})());
/**
 * Root namespace of the F2 SDK
 * @module f2
 * @class F2
 */
F2.extend('', (function() {

	var _apps = {};
	var _config = false;
	var _sAppHandlerToken = F2.AppHandlers.__f2GetToken();
	var _loadingScripts = {};

	/**
   * Search for a value within an array.
   * @method inArray
   * @param {object} value The value to search for
   * @param {Array} array The array to search
   * @return {int} index of the value in the array, -1 if value not found
   */
	var _inArray = function(value, array) {
		if (Array.isArray(array)) {
			return array.indexOf(value);
		}

		for (var i = 0; i < array.length; i++) {
			if (array[i] === value) {
				return i;
			}
		}

		return -1;
	};

	/**
	 * Adds properties to the AppConfig object
	 * @method _createAppConfig
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @return {F2.AppConfig} The new F2.AppConfig object, prepopulated with
	 * necessary properties
	 */
	var _createAppConfig = function(appConfig) {

		// make a copy of the app config to ensure that the original is not modified
		appConfig = _.cloneDeep(appConfig) || {};

		// create the instanceId for the app
		appConfig.instanceId = appConfig.instanceId || F2.guid();

		//pass container-defined locale to each app
		if (F2.ContainerConfig.locale){
			appConfig.containerLocale = F2.ContainerConfig.locale;
		}

		return appConfig;
	};

	/**
	 * Generate an AppConfig from the element's attributes
	 * @method _getAppConfigFromElement
	 * @private
	 * @param {Element} node The DOM node from which to generate the F2.AppConfig object
	 * @return {F2.AppConfig} The new F2.AppConfig object
	 */
	var _getAppConfigFromElement = function(node) {
		var appConfig;

		if (node) {
			var appId = node.getAttribute('data-f2-appid');
			var manifestUrl = node.getAttribute('data-f2-manifesturl');

			if (appId && manifestUrl) {
				appConfig = {
					appId: appId,
					enableBatchRequests: node.hasAttribute('data-f2-enablebatchrequests'),
					manifestUrl: manifestUrl,
					root: node
				};

				// See if the user passed in a block of serialized json
				var contextJson = node.getAttribute('data-f2-context');

				if (contextJson) {
					try {
						appConfig.context = F2.parse(contextJson);
					}
					catch (e) {
						console.warn('F2: "data-f2-context" of node is not valid JSON', '"' + e + '"');
					}
				}
			}
		}

		return appConfig;
	};

	/**
	 * Returns true if the DOM node has children that are not text nodes
	 * @method _hasNonTextChildNodes
	 * @private
	 * @param {Element} node The DOM node
	 * @return {bool} True if there are non-text children
	 */
	var _hasNonTextChildNodes = function(node) {
		var hasNodes = false;

		if (node.hasChildNodes()) {
			for (var i = 0, len = node.childNodes.length; i < len; i++) {
				if (node.childNodes[i].nodeType === 1) {
					hasNodes = true;
					break;
				}
			}
		}

		return hasNodes;
	};

	/**
	 * Adds properties to the ContainerConfig object to take advantage of defaults
	 * @method _hydrateContainerConfig
	 * @private
	 * @param {F2.ContainerConfig} containerConfig The F2.ContainerConfig object
	 */
	var _hydrateContainerConfig = function(containerConfig) {

		if (!containerConfig.scriptErrorTimeout) {
			containerConfig.scriptErrorTimeout = F2.ContainerConfig.scriptErrorTimeout;
		}

		if (containerConfig.debugMode !== true) {
			containerConfig.debugMode = F2.ContainerConfig.debugMode;
		}

		if (containerConfig.locale && typeof containerConfig.locale == 'string'){
			F2.ContainerConfig.locale = containerConfig.locale;
		}
	};

	/**
	 * Attach container Events
	 * @method _initContainerEvents
	 * @private
	 */
	var _initContainerEvents = function() {

		var resizeTimeout;
		var resizeHandler = function() {
			F2.Events.emit(F2.Constants.Events.CONTAINER_WIDTH_CHANGE);
		};

		// TODO: remove this on destroy()
		window.addEventListener('resize', function() {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resizeHandler, 100);
		});

		//listen for container-broadcasted locale changes
		F2.Events.on(F2.Constants.Events.CONTAINER_LOCALE_CHANGE,function(data){
			if (data.locale && typeof data.locale == 'string'){
				F2.ContainerConfig.locale = data.locale;
			}
		});
	};

	/**
	 * Checks if an element is a placeholder element
	 * @method _isPlaceholderElement
	 * @private
	 * @param {Element} node The DOM element to check
	 * @return {bool} True if the element is a placeholder
	 */
	var _isPlaceholderElement = function(node) {
		return (
			F2.isNativeDOMNode(node) &&
			!_hasNonTextChildNodes(node) &&
			!!node.getAttribute('data-f2-appid') &&
			!!node.getAttribute('data-f2-manifesturl')
		);
	};

	/**
	 * Has the container been init?
	 * @method _isInit
	 * @private
	 * @return {bool} True if the container has been init
	 */
	var _isInit = function() {
		return !!_config;
	};

	/**
	 * Instantiates each app from it's appConfig and stores that in a local private collection
	 * @method _createAppInstance
	 * @private
	 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects
	 */
	var _createAppInstance = function(appConfig, appContent) {
		// instantiate F2.App
		if (F2.Apps[appConfig.appId] !== undefined) {
			if (typeof F2.Apps[appConfig.appId] === 'function') {

				// IE
				setTimeout(function() {
					_apps[appConfig.instanceId].app = new F2.Apps[appConfig.appId](appConfig, appContent, appConfig.root);
					if (_apps[appConfig.instanceId].app['init'] !== undefined) {
						_apps[appConfig.instanceId].app.init();
					}
				}, 0);

			}
			else {
				F2.log('app initialization class is defined but not a function. (' + appConfig.appId + ')');
			}
		}
	};

	/**
	 * Loads the app's html/css/javascript
	 * @method loadApp
	 * @private
	 * @param {Array} appConfigs An array of
	 * {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects
	 * @param {F2.AppManifest} [appManifest] The AppManifest object
	 */
	var _loadApps = function(appConfigs, appManifest) {
		appConfigs = [].concat(appConfigs);

		// check that the number of apps in manifest matches the number requested
		if (appConfigs.length != appManifest.apps.length) {
			F2.log('The number of apps defined in the AppManifest do not match the number requested.', appManifest);
			return;
		}

		var _findExistingScripts = function() {
			var scripts = document.querySelectorAll('script[src]') || [];
			var src = [];

			for (var i = 0; i < scripts.length; i ++) {
				src.push(scripts[i].src);
			}

			return src;
		};

		var _findExistingStyles = function() {
			var src = [];
			var styles = document.querySelectorAll('link[href]') || [];

			for (var i = 0; i < styles.length; i ++) {
				src.push(styles[i].src);
			}

			return src;
		};

		// Fn for loading manifest Styles
		var _loadStyles = function(styles, cb) {
			// Reduce the list to styles that haven't been loaded
			var existingStyles = _findExistingStyles();
			var filteredStyles = [];

			for (var i = 0; i < styles.length; i++) {
				var url = styles[i];
				if (url && _inArray(url, existingStyles) === -1) {
					filteredStyles.push(url);
				}
			}

			// Attempt to use the user provided method
			if (_config.loadStyles) {
				return _config.loadStyles(filteredStyles, cb);
			}

			// load styles, see #101
			var stylesFragment = null,
				useCreateStyleSheet = !!document.createStyleSheet;

			for (var j = 0; j < filteredStyles.length; j++) {
				if (useCreateStyleSheet) {
					document.createStyleSheet(filteredStyles[j]);
				}
				else {
					stylesFragment = stylesFragment || [];
					stylesFragment.push('<link rel="stylesheet" type="text/css" href="' + filteredStyles[j] + '"/>');
				}
			}

			if (stylesFragment) {
				var node = domify(stylesFragment.join(''));
				document.getElementsByTagName('head')[0].appendChild(node);
			}

			cb();
		};

		// For loading AppManifest.scripts
		// Parts derived from curljs, headjs, requirejs, dojo
		var _loadScripts = function(scripts, cb) {
			// Reduce the list to scripts that haven't been loaded
			var existingScripts = _findExistingScripts();
			var loadingScripts = Object.keys(_loadingScripts);
			var filteredScripts = [];

			for (var i = 0; i < scripts.length; i++) {
				var url = scripts[i];
				if (url && (_inArray(url, existingScripts) === -1 || _inArray(url, loadingScripts) !== -1)) {
					filteredScripts.push(url);
				}
			}

			// Attempt to use the user provided method
			if (_config.loadScripts) {
				return _config.loadScripts(filteredScripts, cb);
			}

			if (!filteredScripts.length) {
				return cb();
			}

			var doc = window.document;
			var scriptCount = filteredScripts.length;
			var scriptsLoaded = 0;
			//http://caniuse.com/#feat=script-async
			// var supportsAsync = 'async' in doc.createElement('script') || 'MozAppearance' in doc.documentElement.style || window.opera;
			var head = doc && (doc['head'] || doc.getElementsByTagName('head')[0]);
			// to keep IE from crying, we need to put scripts before any
			// <base> elements, but after any <meta>. this should do it:
			var insertBeforeEl = head && head.getElementsByTagName('base')[0] || null;
			// Check for IE10+ so that we don't rely on onreadystatechange, readyStates for IE6-9
			var readyStates = 'addEventListener' in window ? {} : { 'loaded': true, 'complete': true };

			// Log and emit event for the failed (400,500) scripts
			var _error = function(e) {
				setTimeout(function() {
					var evtData = {
						src: e.target.src,
						appId: appConfigs[0].appId
					};

					// Send error to console
					F2.log('Script defined in \'' + evtData.appId + '\' failed to load \'' + evtData.src + '\'');

					// @Brian ? TODO: deprecate, see #222
					F2.Events.emit(F2.Constants.Events.RESOURCE_FAILED_TO_LOAD, evtData);

					F2.AppHandlers.__trigger(
							_sAppHandlerToken,
							F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
							appConfigs[0],
							evtData.src
						);
				}, _config.scriptErrorTimeout); // Defaults to 7000
			};

			var _checkComplete = function() {
				if (++scriptsLoaded === scriptCount) {
					cb();
				}
			};

			var _emptyWaitlist = function(resourceKey, errorEvt) {
				var waiting,
					waitlist = _loadingScripts[resourceKey];

				if (!waitlist) {
					return;
				}

				for (var i=0; i<waitlist.length; i++) {
					waiting = waitlist	[i];

					if (errorEvt) {
						waiting.error(errorEvt);
					} else {
						waiting.success();
					}
				}

				_loadingScripts[resourceKey] = null;
			};

			// Load scripts and eval inlines once complete
			filteredScripts.forEach(function(e, i) {
				var script = doc.createElement('script'),
					resourceUrl = e,
					resourceKey = resourceUrl.toLowerCase();

				// this script is actively loading, add this app to the wait list
				if (_loadingScripts[resourceKey]) {
					_loadingScripts[resourceKey].push({
						success: _checkComplete,
						error: _error
					});
					return;
				}

				// create the waitlist
				_loadingScripts[resourceKey] = [];

				// If in debugMode, add cache buster to each script URL
				if (_config.debugMode) {
					resourceUrl += '?cachebuster=' + new Date().getTime();
				}

				// Scripts are loaded asynchronously and executed in order
				// in supported browsers: http://caniuse.com/#feat=script-async
				script.async = false;
				script.type = 'text/javascript';
				script.charset = 'utf-8';

				script.onerror = function(e) {
					_error(e);
					_emptyWaitlist(resourceKey, e);
				};

				// Use a closure for the load event so that we can dereference the original script
				script.onload = script.onreadystatechange = function(e) {
					e = e || window.event; // For older IE

					// detect when it's done loading
					// ev.type == 'load' is for all browsers except IE6-9
					// IE6-9 need to use onreadystatechange and look for
					// el.readyState in {loaded, complete} (yes, we need both)
					if (e.type == 'load' || readyStates[script.readyState]) {
						// Done, cleanup
						script.onload = script.onreadystatechange = script.onerror = '';
						// increment and check if scripts are done
						_checkComplete();
						// empty wait list
						_emptyWaitlist(resourceKey);
						// Dereference script
						script = null;
					}
				};

				//set the src, start loading
				script.src = resourceUrl;

				//<head> really is the best
				head.insertBefore(script, insertBeforeEl);
			});
		};

		var _loadInlineScripts = function(inlines, cb) {
			// Attempt to use the user provided method
			if (_config.loadInlineScripts) {
				_config.loadInlineScripts(inlines, cb);
			}
			else {
				for (var i = 0, len = inlines.length; i < len; i++) {
					try {
						eval(inlines[i]);
					}
					catch (exception) {
						F2.log('Error loading inline script: ' + exception + '\n\n' + inlines[i]);

						// Emit events
						F2.Events.emit('RESOURCE_FAILED_TO_LOAD', { appId:appConfigs[0].appId, src: inlines[i], err: exception });
							F2.AppHandlers.__trigger(
								_sAppHandlerToken,
								F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
								appConfigs[0],
								exception
							);
					}
				}
				cb();
			}
		};

		// Determine whether an element has been added to the page
		var elementInDocument = function(element) {
			if (element) {
				while (element.parentNode) {
					element = element.parentNode;

					if (element === document) {
						return true;
					}
				}
			}

			return false;
		};

		// Fn for loading manifest app html
		var _loadHtml = function(apps) {
			apps.forEach(function(a, i) {
				if (_isPlaceholderElement(appConfigs[i].root)) {
					var node = domify(a.html);
					node.classList.add(F2.Constants.Css.APP_CONTAINER);
					node.classList.add(appConfigs[i].appId);
					appConfigs[i].root.classList.add(F2.Constants.Css.APP);
					appConfigs[i].root.appendChild(node);
				}
				else {
					var container = document.createElement('div');
					var childNode = domify(a.html);
					childNode.classList.add(F2.Constants.Css.APP_CONTAINER);
					childNode.classList.add(appConfigs[i].appId);
					container.appendChild(childNode);

					F2.AppHandlers.__trigger(
						_sAppHandlerToken,
						F2.Constants.AppHandlers.APP_RENDER,
						appConfigs[i], // the app config
						container.innerHTML
					);

					var appId = appConfigs[i].appId,
						root = appConfigs[i].root;

					if (!root) {
						throw ('Root for ' + appId + ' must be a native DOM element and cannot be null or undefined. Check your AppHandler callbacks to ensure you have set App root to a native DOM element.');
					}

					if (!elementInDocument(root)) {
						throw ('App root for ' + appId + ' was not appended to the DOM. Check your AppHandler callbacks to ensure you have rendered the app root to the DOM.');
					}

					F2.AppHandlers.__trigger(
						_sAppHandlerToken,
						F2.Constants.AppHandlers.APP_RENDER_AFTER,
						appConfigs[i] // the app config
					);

					if (!F2.isNativeDOMNode(root)) {
						throw ('App root for ' + appId + ' must be a native DOM element. Check your AppHandler callbacks to ensure you have set app root to a native DOM element.');
					}
				}

			});
		};

		// Pull out the manifest data
		var scripts = appManifest.scripts || [];
		var styles = appManifest.styles || [];
		var inlines = appManifest.inlineScripts || [];
		var apps = appManifest.apps || [];

		// Finally, load the styles, html, and scripts
		_loadStyles(styles, function() {
			// Put the html on the page
			_loadHtml(apps);
			// Add the script content to the page
			_loadScripts(scripts, function() {
				// emit event we're done with scripts
				if (appConfigs[0]){ F2.Events.emit('APP_SCRIPTS_LOADED', { appId:appConfigs[0].appId, scripts:scripts }); }
				// Load any inline scripts
				_loadInlineScripts(inlines, function() {
					// Create the apps
					appConfigs.forEach(function(a, i) {
						_createAppInstance(a, appManifest.apps[i]);
					});
				});
			});
		});
	};


	/**
	 * Checks if the app is valid
	 * @method _validateApp
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @returns {bool} True if the app is valid
	 */
	var _validateApp = function(appConfig) {

		// check for valid app configurations
		if (!appConfig.appId) {
			F2.log('"appId" missing from app object');
			return false;
		}
		else if (!appConfig.root && !appConfig.manifestUrl) {
			F2.log('"manifestUrl" missing from app object');
			return false;
		}

		return true;
	};

	/**
	 * Checks if the ContainerConfig is valid
	 * @method _validateContainerConfig
	 * @private
	 * @returns {bool} True if the config is valid
	 */
	var _validateContainerConfig = function() {

		if (_config) {
			if (_config.xhr) {
				if (!(typeof _config.xhr === 'function' || typeof _config.xhr === 'object')) {
					throw ('ContainerConfig.xhr should be a function or an object');
				}
				if (_config.xhr.dataType && typeof _config.xhr.dataType !== 'function') {
					throw ('ContainerConfig.xhr.dataType should be a function');
				}
				if (_config.xhr.type && typeof _config.xhr.type !== 'function') {
					throw ('ContainerConfig.xhr.type should be a function');
				}
				if (_config.xhr.url && typeof _config.xhr.url !== 'function') {
					throw ('ContainerConfig.xhr.url should be a function');
				}
			}
		}

		return true;
	};

	return {
		/**
		 * Gets the current list of apps in the container
		 * @method getContainerState
		 * @returns {Array} An array of objects containing the appId
		 */
		getContainerState: function() {
			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.getContainerState()');
				return;
			}

			var apps = [];

			for (var i = 0; i < _apps.length; i++) {
				apps.push({
					appId: _apps[i].config.appId
				});
			}

			return apps;
		},
		/**
		 * Gets the current locale defined by the container
		 * @method getContainerLocale
		 * @returns {String} IETF-defined standard language tag
		 */
		getContainerLocale: function() {
			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.getContainerLocale()');
				return;
			}

			return F2.ContainerConfig.locale;
		},
		/**
		 * Initializes the container. This method must be called before performing
		 * any other actions in the container.
		 * @method init
		 * @param {F2.ContainerConfig} config The configuration object
		 */
		init: function(config) {
			_config = config || {};

			_validateContainerConfig();

			_hydrateContainerConfig(_config);

			// dictates whether we use the old logic or the new logic.
			_initContainerEvents();
		},
		/**
		 * Has the container been init?
		 * @method isInit
		 * @return {bool} True if the container has been init
		 */
		isInit: _isInit,
		/**
		 * Automatically load apps that are already defined in the DOM. Elements will
		 * be rendered into the location of the placeholder DOM element. Any AppHandlers
		 * that are defined will be bypassed.
		 * @method loadPlaceholders
		 * @param {Element} parentNode The element to search for placeholder apps
		 */
		loadPlaceholders: function(parentNode) {

			var elements = [],
				appConfigs = [],
				add = function(e) {
					if (!e) { return; }
					elements.push(e);
				},
				addAll = function(els) {
					if (!els) { return; }
					for (var i = 0, len = els.length; i < len; i++) {
						add(els[i]);
					}
				};

			if (!!parentNode && !F2.isNativeDOMNode(parentNode)) {
				throw ('"parentNode" must be null or a DOM node');
			}

			// if the passed in element has a data-f2-appid attribute add
			// it to the list of elements but to not search within that
			// element for other placeholders
			if (parentNode && parentNode.hasAttribute('data-f2-appid')) {
				add(parentNode);
			} else {

				// find placeholders within the parentNode only if
				// querySelectorAll exists
				parentNode = parentNode || document;
				if (parentNode.querySelectorAll) {
					addAll(parentNode.querySelectorAll('[data-f2-appid]'));
				}
			}

			for (var i = 0, len = elements.length; i < len; i++) {
				var appConfig = _getAppConfigFromElement(elements[i]);
				appConfigs.push(appConfig);
			}

			if (appConfigs.length) {
				F2.registerApps(appConfigs);
			}
		},
		/**
		 * Begins the loading process for all apps and/or initialization process for pre-loaded apps.
		 * The app will be passed the {{#crossLink "F2.AppConfig"}}{{/crossLink}} object which will
		 * contain the app's unique instanceId within the container. If the
		 * {{#crossLink "F2.AppConfig"}}{{/crossLink}}.root property is populated the app is considered
		 * to be a pre-loaded app and will be handled accordingly. Optionally, the
		 * {{#crossLink "F2.AppManifest"}}{{/crossLink}} can be passed in and those
		 * assets will be used instead of making a request.
		 * @method registerApps
		 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}}
		 * objects
		 * @param {Array} [appManifests] An array of
		 * {{#crossLink "F2.AppManifest"}}{{/crossLink}}
		 * objects. This array must be the same length as the apps array that is
		 * objects. This array must be the same length as the apps array that is
		 * passed in. This can be useful if apps are loaded on the server-side and
		 * passed down to the client.
		 * @example
		 * Traditional App requests.
		 *
		 *	// Traditional f2 app configs
		 *	var arConfigs = [
		 *		{
		 *			appId: 'com_externaldomain_example_app',
		 *			context: {},
		 *			manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
		 *		},
		 *		{
		 *			appId: 'com_externaldomain_example_app',
		 *			context: {},
		 *			manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
		 *		},
		 *		{
		 *			appId: 'com_externaldomain_example_app2',
		 *			context: {},
		 *			manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
		 *		}
		 *	];
		 *
		 *	F2.init();
		 *	F2.registerApps(arConfigs);
		 *
		 * @example
		 * Pre-loaded and tradition apps mixed.
		 *
		 *	// Pre-loaded apps and traditional f2 app configs
		 *	// you can preload the same app multiple times as long as you have a unique root for each
		 *	var arConfigs = [
		 *		{
		 *			appId: 'com_mydomain_example_app',
		 *			context: {},
		 *			root: 'div#example-app-1',
		 *			manifestUrl: ''
		 *		},
		 *		{
		 *			appId: 'com_mydomain_example_app',
		 *			context: {},
		 *			root: 'div#example-app-2',
		 *			manifestUrl: ''
		 *		},
		 *		{
		 *			appId: 'com_externaldomain_example_app',
		 *			context: {},
		 *			manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
		 *		}
		 *	];
		 *
		 *	F2.init();
		 *	F2.registerApps(arConfigs);
		 *
		 * @example
		 * Apps with predefined manifests.
		 *
		 *	// Traditional f2 app configs
		 *	var arConfigs = [
		 *		{appId: 'com_externaldomain_example_app', context: {}},
		 *		{appId: 'com_externaldomain_example_app', context: {}},
		 *		{appId: 'com_externaldomain_example_app2', context: {}}
		 *	];
		 *
		 *	// Pre requested manifest responses
		 *	var arManifests = [
		 *		{
		 *			apps: ['<div>Example App!</div>'],
		 *			inlineScripts: [],
		 *			scripts: ['http://www.domain.com/js/AppClass.js'],
		 *			styles: ['http://www.domain.com/css/AppStyles.css']
		 *		},
		 *		{
		 *			apps: ['<div>Example App!</div>'],
		 *			inlineScripts: [],
		 *			scripts: ['http://www.domain.com/js/AppClass.js'],
		 *			styles: ['http://www.domain.com/css/AppStyles.css']
		 *		},
		 *		{
		 *			apps: ['<div>Example App 2!</div>'],
		 *			inlineScripts: [],
		 *			scripts: ['http://www.domain.com/js/App2Class.js'],
		 *			styles: ['http://www.domain.com/css/App2Styles.css']
		 *		}
		 *	];
		 *
		 *	F2.init();
		 *	F2.registerApps(arConfigs, arManifests);
		 */
		registerApps: function(appConfigs, appManifests) {

			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.registerApps()');
				return;
			}
			else if (!appConfigs) {
				F2.log('At least one AppConfig must be passed when calling F2.registerApps()');
				return;
			}

			var appStack = [];
			var batches = {};
			var callbackStack = {};
			var haveManifests = false;
			appConfigs = [].concat(appConfigs);
			appManifests = [].concat(appManifests || []);
			haveManifests = !! appManifests.length;

			// appConfigs must have a length
			if (!appConfigs.length) {
				F2.log('At least one AppConfig must be passed when calling F2.registerApps()');
				return;
				// ensure that the array of apps and manifests are qual
			}
			else if (appConfigs.length && haveManifests && appConfigs.length != appManifests.length) {
				F2.log('The length of "apps" does not equal the length of "appManifests"');
				return;
			}

			// validate each app and assign it an instanceId
			// then determine which apps can be batched together
			appConfigs.forEach(function(a, i) {
				// add properties and methods
				a = _createAppConfig(a);

				// Will set to itself, for preloaded apps, or set to null for apps that aren't already
				// on the page.
				a.root = a.root || null;

				// we validate the app after setting the root property because pre-load apps do no require
				// manifest url
				if (!_validateApp(a)) {
					return; // move to the next app
				}

				// save app
				_apps[a.instanceId] = {
					config: a
				};

				// If the root property is defined then this app is considered to be preloaded and we will
				// run it through that logic.
				if (a.root && !_isPlaceholderElement(a.root)) {
					if ((!a.root && typeof(a.root) != 'string') && !F2.isNativeDOMNode(a.root)) {
						F2.log('AppConfig invalid for pre-load, not a valid string and not dom node');
						F2.log('AppConfig instance:', a);
						throw ('Preloaded appConfig.root property must be a native dom node or a string representing a sizzle selector. Please check your inputs and try again.');
					}
					// @Brian ? TODO: if we accept only explicit DOM references, do we still need this?
					//else if (jQuery(a.root).length != 1) {
					//	F2.log('AppConfig invalid for pre-load, root not unique');
					//	F2.log('AppConfig instance:', a);
					//	F2.log('Number of dom node instances:', jQuery(a.root).length);
					//	throw ('Preloaded appConfig.root property must map to a unique dom node. Please check your inputs and try again.');
					//}

					// instantiate F2.App
					_createAppInstance(a, {
						preloaded: true,
						status: F2.Constants.AppStatus.SUCCESS
					});


					// Continue on in the .each loop, no need to continue because the app is on the page
					// the js in initialized, and it is ready to role.
					return; // equivalent to continue in .each
				}

				if (!_isPlaceholderElement(a.root)) {
					 	F2.AppHandlers.__trigger(
							_sAppHandlerToken,
							F2.Constants.AppHandlers.APP_CREATE_ROOT,
							a // the app config
						);

						F2.AppHandlers.__trigger(
							_sAppHandlerToken,
							F2.Constants.AppHandlers.APP_RENDER_BEFORE,
							a // the app config
						);
				}

				// if we have the manifest, go ahead and load the app
				if (haveManifests) {
					_loadApps(a, appManifests[i]);
				}
				else {
					// check if this app can be batched
					if (a.enableBatchRequests) {
						batches[a.manifestUrl.toLowerCase()] = batches[a.manifestUrl.toLowerCase()] || [];
						batches[a.manifestUrl.toLowerCase()].push(a);
					}
					else {
						appStack.push({
							apps: [a],
							url: a.manifestUrl
						});
					}
				}
			});

			// we don't have the manifests, go ahead and load them
			if (!haveManifests) {
				// add the batches to the appStack
				for (var key in batches) {
					appStack.push({
						url: key,
						apps: batches[key]
					});
				}

				// if an app is being loaded more than once on the page, there is the
				// potential that the jsonp callback will be clobbered if the request
				// for the AppManifest for the app comes back at the same time as
				// another request for the same app.  We'll create a callbackStack
				// that will ensure that requests for the same app are loaded in order
				// rather than at the same time
				appStack.forEach(function(req, i) {
					// define the callback function based on the first app's App ID
					var jsonpCallback = F2.Constants.JSONP_CALLBACK + req.apps[0].appId;

					// push the request onto the callback stack
					callbackStack[jsonpCallback] = callbackStack[jsonpCallback] || [];
					callbackStack[jsonpCallback].push(req);
				});

				// loop through each item in the callback stack and make the request
				// for the AppManifest. When the request is complete, pop the next
				// request off the stack and make the request.
				for (var i in callbackStack) {
					/*jshint loopfunc: true */
					var requests = callbackStack[i];
					var manifestRequest = function(jsonpCallback, req) {
						if (!req) {
							return;
						}

						// setup defaults and callbacks
						var url = req.url,
							type = 'GET',
							dataType = 'jsonp',
							completeFunc = function() {
								manifestRequest(i, requests.pop());
							},
							errorFunc = function() {
								req.apps.forEach(function(item, idx) {
									item.name = item.name || item.appId;
									F2.log('Removed failed ' + item.name + ' app', item);
									F2.AppHandlers.__trigger(
										_sAppHandlerToken,
										F2.Constants.AppHandlers.APP_MANIFEST_REQUEST_FAIL,
										item // the app config
									);
									F2.removeApp(item.instanceId);
								});
							},
							successFunc = function(appManifest) {
								_loadApps(req.apps, appManifest);
							};

						// optionally fire xhr overrides
						if (_config.xhr && _config.xhr.dataType) {
							dataType = _config.xhr.dataType(req.url, req.apps);
							if (typeof dataType !== 'string') {
								throw ('ContainerConfig.xhr.dataType should return a string');
							}
						}
						if (_config.xhr && _config.xhr.type) {
							type = _config.xhr.type(req.url, req.apps);
							if (typeof type !== 'string') {
								throw ('ContainerConfig.xhr.type should return a string');
							}
						}
						if (_config.xhr && _config.xhr.url) {
							url = _config.xhr.url(req.url, req.apps);
							if (typeof url !== 'string') {
								throw ('ContainerConfig.xhr.url should return a string');
							}
						}

						// setup the default request function if an override is not present
						var requestFunc = _config.xhr;
						if (typeof requestFunc !== 'function') {
							requestFunc = function(url, appConfigs, successCallback, errorCallback, completeCallback) {
								if (!window.fetch) {
									throw ('Browser does not support the Fetch API.');
								}

								var fetchFunc, 
									fetchUrl = url + '?params=' + F2.stringify(req.apps, F2.appConfigReplacer);
									
								// Fetch API does not support the JSONP calls so making JSON calls using Fetch API and
								// JSONP call using fetch-jsonp package (https://www.npmjs.com/package/fetch-jsonp)
								if (dataType === 'json') {
									var fetchInputs = {
										method: type,
										mode: 'no-cors'
									};

									if (type === 'POST') {
										fetchUrl = url;
										fetchInputs.body = {
											params: F2.stringify(req.apps, F2.appConfigReplacer)
										};
									}

									fetchFunc = fetch(fetchUrl, fetchInputs);
								} else if (dataType === 'jsonp') {
									fetchFunc = fetchJsonp(fetchUrl, {
										timeout: 3000,
										jsonpCallbackFunction: jsonpCallback
									});									
								}

								fetchFunc.then(function(response) {
									return response.json();
								})
								.then(function(data) {
									successCallback(data);
									completeCallback();							
								})
								.catch(function(error) {
									F2.log('Failed to load app(s)', error.toString(), req.apps);
									errorCallback();
								});
							};
						}

						requestFunc(url, req.apps, successFunc, errorFunc, completeFunc);
					};

					manifestRequest(i, requests.pop());
				}

			}
		},
		/**
		 * Removes all apps from the container
		 * @method removeAllApps
		 */
		removeAllApps: function() {

			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.removeAllApps()');
				return;
			}

			_apps.each(function(a) {
				F2.removeApp(a.config.instanceId);
			});
		},
		/**
		 * Removes an app from the container
		 * @method removeApp
		 * @param {string} instanceId The app's instanceId
		 */
		removeApp: function(instanceId) {

			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.removeApp()');
				return;
			}

			if (_apps[instanceId]) {
				F2.AppHandlers.__trigger(
					_sAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
					_apps[instanceId] // the app instance
				);

				F2.AppHandlers.__trigger(
					_sAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY,
					_apps[instanceId] // the app instance
				);

				F2.AppHandlers.__trigger(
					_sAppHandlerToken,
					F2.Constants.AppHandlers.APP_DESTROY_AFTER,
					_apps[instanceId] // the app instance
				);

				delete _apps[instanceId];
			}
		}
	};
})());

	var callback = function() {
		var autoloadEls = [],
			add = function(e) {
				if (!e) { return; }
				autoloadEls.push(e);
			},
			addAll = function(els) {
				if (!els) { return; }
				for (var i = 0, len = els.length; i < len; i++) {
					add(els[i]);
				}
			};

		// support id-based autoload
		add(document.getElementById('f2-autoload'));

		// support class/attribute based autoload
		if (document.querySelectorAll) {
			addAll(document.querySelectorAll('[data-f2-autoload]'));
			addAll(document.querySelectorAll('.f2-autoload'));
		}

		// if elements were found, auto-init F2 and load any placeholders
		if (autoloadEls.length) {
			F2.init();
			for (var i = 0, len = autoloadEls.length; i < len; i++) {
				F2.loadPlaceholders(autoloadEls[i]);
			}
		}
	};

	if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
		callback();
	} else {
		document.addEventListener('DOMContentLoaded', callback);
	}

	exports.F2 = F2;

	if (typeof define !== 'undefined' && define.amd) {

		define(function() {
			return F2;
		});

	}

})(typeof exports !== 'undefined' ? exports : window);
