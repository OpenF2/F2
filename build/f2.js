(function(window, document, undefined) {
	'use strict'

	// Define AMD modules
	if (typeof define !== 'function' || !define.amd) {
		throw 'F2 did not detect an AMD loader.';
	}

	function noop() {}

	// Check for console
	if (typeof console === 'undefined' || typeof console.log === 'undefined') {
		// Set all console methods to a non process
		console = {
			assert: noop,
			clear: noop,
			count: noop,
			debug: noop,
			dir: noop,
			dirxml: noop,
			error: noop,
			exception: noop,
			group: noop,
			groupCollapsed: noop,
			groupEnd: noop,
			info: noop,
			log: noop,
			markTimeline: noop,
			profile: noop,
			profileEnd: noop,
			table: noop,
			time: noop,
			timeEnd: noop,
			timeStamp: noop,
			trace: noop,
			warn: noop
		};
	}

	// Create the internal objects
	var F2 = function(params) {
		// Do something with params
	};
	var Helpers = {};

// Create a local exports object to attach all CommonJS modules to
var _exports = {};
var _module = { exports: { } };

// Create a fake window object
var _window = {
	document: window.document,
	// Reqwest looks at XMLHttpRequest
	XMLHttpRequest: window.XMLHttpRequest,
	ActiveXObject: window.ActiveXObject,
	XDomainRequest: window.XDomainRequest
};

!(function(exports, window, f2Window, module) {

/*!
  * Reqwest! A general purpose XHR connection manager
  * license MIT (c) Dustin Diaz 2014
  * https://github.com/ded/reqwest
  */

!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('reqwest', this, function () {

  var win = window
    , doc = document
    , twoHundo = /^(20\d|1223)$/
    , byTag = 'getElementsByTagName'
    , readyState = 'readyState'
    , contentType = 'Content-Type'
    , requestedWith = 'X-Requested-With'
    , head = doc[byTag]('head')[0]
    , uniqid = 0
    , callbackPrefix = 'reqwest_' + (+new Date())
    , lastValue // data stored by the most recent JSONP callback
    , xmlHttpRequest = 'XMLHttpRequest'
    , xDomainRequest = 'XDomainRequest'
    , noop = function () {}

    , isArray = typeof Array.isArray == 'function'
        ? Array.isArray
        : function (a) {
            return a instanceof Array
          }

    , defaultHeaders = {
          'contentType': 'application/x-www-form-urlencoded'
        , 'requestedWith': xmlHttpRequest
        , 'accept': {
              '*':  'text/javascript, text/html, application/xml, text/xml, */*'
            , 'xml':  'application/xml, text/xml'
            , 'html': 'text/html'
            , 'text': 'text/plain'
            , 'json': 'application/json, text/javascript'
            , 'js':   'application/javascript, text/javascript'
          }
      }

    , xhr = function(o) {
        // is it x-domain
        if (o['crossOrigin'] === true) {
          var xhr = win[xmlHttpRequest] ? new XMLHttpRequest() : null
          if (xhr && 'withCredentials' in xhr) {
            return xhr
          } else if (win[xDomainRequest]) {
            return new XDomainRequest()
          } else {
            throw new Error('Browser does not support cross-origin requests')
          }
        } else if (win[xmlHttpRequest]) {
          return new XMLHttpRequest()
        } else {
          return new ActiveXObject('Microsoft.XMLHTTP')
        }
      }
    , globalSetupOptions = {
        dataFilter: function (data) {
          return data
        }
      }

  function handleReadyState(r, success, error) {
    return function () {
      // use _aborted to mitigate against IE err c00c023f
      // (can't read props on aborted request objects)
      if (r._aborted) return error(r.request)
      if (r.request && r.request[readyState] == 4) {
        r.request.onreadystatechange = noop
        if (twoHundo.test(r.request.status)) success(r.request)
        else
          error(r.request)
      }
    }
  }

  function setHeaders(http, o) {
    var headers = o['headers'] || {}
      , h

    headers['Accept'] = headers['Accept']
      || defaultHeaders['accept'][o['type']]
      || defaultHeaders['accept']['*']

    // breaks cross-origin requests with legacy browsers
    if (!o['crossOrigin'] && !headers[requestedWith]) headers[requestedWith] = defaultHeaders['requestedWith']
    if (!headers[contentType]) headers[contentType] = o['contentType'] || defaultHeaders['contentType']
    for (h in headers)
      headers.hasOwnProperty(h) && 'setRequestHeader' in http && http.setRequestHeader(h, headers[h])
  }

  function setCredentials(http, o) {
    if (typeof o['withCredentials'] !== 'undefined' && typeof http.withCredentials !== 'undefined') {
      http.withCredentials = !!o['withCredentials']
    }
  }

  function generalCallback(data) {
    lastValue = data
  }

  function urlappend (url, s) {
    return url + (/\?/.test(url) ? '&' : '?') + s
  }

  function handleJsonp(o, fn, err, url) {
    var reqId = uniqid++
      , cbkey = o['jsonpCallback'] || 'callback' // the 'callback' key
      , cbval = o['jsonpCallbackName'] || reqwest.getcallbackPrefix(reqId)
      , cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)')
      , match = url.match(cbreg)
      , script = doc.createElement('script')
      , loaded = 0
      , isIE10 = navigator.userAgent.indexOf('MSIE 10.0') !== -1

    if (match) {
      if (match[3] === '?') {
        url = url.replace(cbreg, '$1=' + cbval) // wildcard callback func name
      } else {
        cbval = match[3] // provided callback func name
      }
    } else {
      url = urlappend(url, cbkey + '=' + cbval) // no callback details, add 'em
    }

    win[cbval] = generalCallback

    script.type = 'text/javascript'
    script.src = url
    script.async = true
    if (typeof script.onreadystatechange !== 'undefined' && !isIE10) {
      // need this for IE due to out-of-order onreadystatechange(), binding script
      // execution to an event listener gives us control over when the script
      // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
      script.htmlFor = script.id = '_reqwest_' + reqId
    }

    script.onload = script.onreadystatechange = function () {
      if ((script[readyState] && script[readyState] !== 'complete' && script[readyState] !== 'loaded') || loaded) {
        return false
      }
      script.onload = script.onreadystatechange = null
      script.onclick && script.onclick()
      // Call the user callback with the last value stored and clean up values and scripts.
      fn(lastValue)
      lastValue = undefined
      head.removeChild(script)
      loaded = 1
    }

    // Add the script to the DOM head
    head.appendChild(script)

    // Enable JSONP timeout
    return {
      abort: function () {
        script.onload = script.onreadystatechange = null
        err({}, 'Request is aborted: timeout', {})
        lastValue = undefined
        head.removeChild(script)
        loaded = 1
      }
    }
  }

  function getRequest(fn, err) {
    var o = this.o
      , method = (o['method'] || 'GET').toUpperCase()
      , url = typeof o === 'string' ? o : o['url']
      // convert non-string objects to query-string form unless o['processData'] is false
      , data = (o['processData'] !== false && o['data'] && typeof o['data'] !== 'string')
        ? reqwest.toQueryString(o['data'])
        : (o['data'] || null)
      , http
      , sendWait = false

    // if we're working on a GET request and we have data then we should append
    // query string to end of URL and not post data
    if ((o['type'] == 'jsonp' || method == 'GET') && data) {
      url = urlappend(url, data)
      data = null
    }

    if (o['type'] == 'jsonp') return handleJsonp(o, fn, err, url)

    // get the xhr from the factory if passed
    // if the factory returns null, fall-back to ours
    http = (o.xhr && o.xhr(o)) || xhr(o)

    http.open(method, url, o['async'] === false ? false : true)
    setHeaders(http, o)
    setCredentials(http, o)
    if (win[xDomainRequest] && http instanceof win[xDomainRequest]) {
        http.onload = fn
        http.onerror = err
        // NOTE: see
        // http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/30ef3add-767c-4436-b8a9-f1ca19b4812e
        http.onprogress = function() {}
        sendWait = true
    } else {
      http.onreadystatechange = handleReadyState(this, fn, err)
    }
    o['before'] && o['before'](http)
    if (sendWait) {
      setTimeout(function () {
        http.send(data)
      }, 200)
    } else {
      http.send(data)
    }
    return http
  }

  function Reqwest(o, fn) {
    this.o = o
    this.fn = fn

    init.apply(this, arguments)
  }

  function setType(header) {
    // json, javascript, text/plain, text/html, xml
    if (header.match('json')) return 'json'
    if (header.match('javascript')) return 'js'
    if (header.match('text')) return 'html'
    if (header.match('xml')) return 'xml'
  }

  function init(o, fn) {

    this.url = typeof o == 'string' ? o : o['url']
    this.timeout = null

    // whether request has been fulfilled for purpose
    // of tracking the Promises
    this._fulfilled = false
    // success handlers
    this._successHandler = function(){}
    this._fulfillmentHandlers = []
    // error handlers
    this._errorHandlers = []
    // complete (both success and fail) handlers
    this._completeHandlers = []
    this._erred = false
    this._responseArgs = {}

    var self = this

    fn = fn || function () {}

    if (o['timeout']) {
      this.timeout = setTimeout(function () {
        self.abort()
      }, o['timeout'])
    }

    if (o['success']) {
      this._successHandler = function () {
        o['success'].apply(o, arguments)
      }
    }

    if (o['error']) {
      this._errorHandlers.push(function () {
        o['error'].apply(o, arguments)
      })
    }

    if (o['complete']) {
      this._completeHandlers.push(function () {
        o['complete'].apply(o, arguments)
      })
    }

    function complete (resp) {
      o['timeout'] && clearTimeout(self.timeout)
      self.timeout = null
      while (self._completeHandlers.length > 0) {
        self._completeHandlers.shift()(resp)
      }
    }

    function success (resp) {
      var type = o['type'] || setType(resp.getResponseHeader('Content-Type'))
      resp = (type !== 'jsonp') ? self.request : resp
      // use global data filter on response text
      var filteredResponse = globalSetupOptions.dataFilter(resp.responseText, type)
        , r = filteredResponse
      try {
        resp.responseText = r
      } catch (e) {
        // can't assign this in IE<=8, just ignore
      }
      if (r) {
        switch (type) {
        case 'json':
          try {
            resp = win.JSON ? win.JSON.parse(r) : eval('(' + r + ')')
          } catch (err) {
            return error(resp, 'Could not parse JSON in response', err)
          }
          break
        case 'js':
          resp = eval(r)
          break
        case 'html':
          resp = r
          break
        case 'xml':
          resp = resp.responseXML
              && resp.responseXML.parseError // IE trololo
              && resp.responseXML.parseError.errorCode
              && resp.responseXML.parseError.reason
            ? null
            : resp.responseXML
          break
        }
      }

      self._responseArgs.resp = resp
      self._fulfilled = true
      fn(resp)
      self._successHandler(resp)
      while (self._fulfillmentHandlers.length > 0) {
        resp = self._fulfillmentHandlers.shift()(resp)
      }

      complete(resp)
    }

    function error(resp, msg, t) {
      resp = self.request
      self._responseArgs.resp = resp
      self._responseArgs.msg = msg
      self._responseArgs.t = t
      self._erred = true
      while (self._errorHandlers.length > 0) {
        self._errorHandlers.shift()(resp, msg, t)
      }
      complete(resp)
    }

    this.request = getRequest.call(this, success, error)
  }

  Reqwest.prototype = {
    abort: function () {
      this._aborted = true
      this.request.abort()
    }

  , retry: function () {
      init.call(this, this.o, this.fn)
    }

    /**
     * Small deviation from the Promises A CommonJs specification
     * http://wiki.commonjs.org/wiki/Promises/A
     */

    /**
     * `then` will execute upon successful requests
     */
  , then: function (success, fail) {
      success = success || function () {}
      fail = fail || function () {}
      if (this._fulfilled) {
        this._responseArgs.resp = success(this._responseArgs.resp)
      } else if (this._erred) {
        fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
      } else {
        this._fulfillmentHandlers.push(success)
        this._errorHandlers.push(fail)
      }
      return this
    }

    /**
     * `always` will execute whether the request succeeds or fails
     */
  , always: function (fn) {
      if (this._fulfilled || this._erred) {
        fn(this._responseArgs.resp)
      } else {
        this._completeHandlers.push(fn)
      }
      return this
    }

    /**
     * `fail` will execute when the request fails
     */
  , fail: function (fn) {
      if (this._erred) {
        fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
      } else {
        this._errorHandlers.push(fn)
      }
      return this
    }
  }

  function reqwest(o, fn) {
    return new Reqwest(o, fn)
  }

  // normalize newline variants according to spec -> CRLF
  function normalize(s) {
    return s ? s.replace(/\r?\n/g, '\r\n') : ''
  }

  function serial(el, cb) {
    var n = el.name
      , t = el.tagName.toLowerCase()
      , optCb = function (o) {
          // IE gives value="" even where there is no value attribute
          // 'specified' ref: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-862529273
          if (o && !o['disabled'])
            cb(n, normalize(o['attributes']['value'] && o['attributes']['value']['specified'] ? o['value'] : o['text']))
        }
      , ch, ra, val, i

    // don't serialize elements that are disabled or without a name
    if (el.disabled || !n) return

    switch (t) {
    case 'input':
      if (!/reset|button|image|file/i.test(el.type)) {
        ch = /checkbox/i.test(el.type)
        ra = /radio/i.test(el.type)
        val = el.value
        // WebKit gives us "" instead of "on" if a checkbox has no value, so correct it here
        ;(!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val))
      }
      break
    case 'textarea':
      cb(n, normalize(el.value))
      break
    case 'select':
      if (el.type.toLowerCase() === 'select-one') {
        optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null)
      } else {
        for (i = 0; el.length && i < el.length; i++) {
          el.options[i].selected && optCb(el.options[i])
        }
      }
      break
    }
  }

  // collect up all form elements found from the passed argument elements all
  // the way down to child elements; pass a '<form>' or form fields.
  // called with 'this'=callback to use for serial() on each element
  function eachFormElement() {
    var cb = this
      , e, i
      , serializeSubtags = function (e, tags) {
          var i, j, fa
          for (i = 0; i < tags.length; i++) {
            fa = e[byTag](tags[i])
            for (j = 0; j < fa.length; j++) serial(fa[j], cb)
          }
        }

    for (i = 0; i < arguments.length; i++) {
      e = arguments[i]
      if (/input|select|textarea/i.test(e.tagName)) serial(e, cb)
      serializeSubtags(e, [ 'input', 'select', 'textarea' ])
    }
  }

  // standard query string style serialization
  function serializeQueryString() {
    return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments))
  }

  // { 'name': 'value', ... } style serialization
  function serializeHash() {
    var hash = {}
    eachFormElement.apply(function (name, value) {
      if (name in hash) {
        hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]])
        hash[name].push(value)
      } else hash[name] = value
    }, arguments)
    return hash
  }

  // [ { name: 'name', value: 'value' }, ... ] style serialization
  reqwest.serializeArray = function () {
    var arr = []
    eachFormElement.apply(function (name, value) {
      arr.push({name: name, value: value})
    }, arguments)
    return arr
  }

  reqwest.serialize = function () {
    if (arguments.length === 0) return ''
    var opt, fn
      , args = Array.prototype.slice.call(arguments, 0)

    opt = args.pop()
    opt && opt.nodeType && args.push(opt) && (opt = null)
    opt && (opt = opt.type)

    if (opt == 'map') fn = serializeHash
    else if (opt == 'array') fn = reqwest.serializeArray
    else fn = serializeQueryString

    return fn.apply(null, args)
  }

  reqwest.toQueryString = function (o, trad) {
    var prefix, i
      , traditional = trad || false
      , s = []
      , enc = encodeURIComponent
      , add = function (key, value) {
          // If value is a function, invoke it and return its value
          value = ('function' === typeof value) ? value() : (value == null ? '' : value)
          s[s.length] = enc(key) + '=' + enc(value)
        }
    // If an array was passed in, assume that it is an array of form elements.
    if (isArray(o)) {
      for (i = 0; o && i < o.length; i++) add(o[i]['name'], o[i]['value'])
    } else {
      // If traditional, encode the "old" way (the way 1.3.2 or older
      // did it), otherwise encode params recursively.
      for (prefix in o) {
        if (o.hasOwnProperty(prefix)) buildParams(prefix, o[prefix], traditional, add)
      }
    }

    // spaces should be + according to spec
    return s.join('&').replace(/%20/g, '+')
  }

  function buildParams(prefix, obj, traditional, add) {
    var name, i, v
      , rbracket = /\[\]$/

    if (isArray(obj)) {
      // Serialize array item.
      for (i = 0; obj && i < obj.length; i++) {
        v = obj[i]
        if (traditional || rbracket.test(prefix)) {
          // Treat each array item as a scalar.
          add(prefix, v)
        } else {
          buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add)
        }
      }
    } else if (obj && obj.toString() === '[object Object]') {
      // Serialize object item.
      for (name in obj) {
        buildParams(prefix + '[' + name + ']', obj[name], traditional, add)
      }

    } else {
      // Serialize scalar item.
      add(prefix, obj)
    }
  }

  reqwest.getcallbackPrefix = function () {
    return callbackPrefix
  }

  // jQuery and Zepto compatibility, differences can be remapped here so you can call
  // .ajax.compat(options, callback)
  reqwest.compat = function (o, fn) {
    if (o) {
      o['type'] && (o['method'] = o['type']) && delete o['type']
      o['dataType'] && (o['type'] = o['dataType'])
      o['jsonpCallback'] && (o['jsonpCallbackName'] = o['jsonpCallback']) && delete o['jsonpCallback']
      o['jsonp'] && (o['jsonpCallback'] = o['jsonp'])
    }
    return new Reqwest(o, fn)
  }

  reqwest.ajaxSetup = function (options) {
    options = options || {}
    for (var k in options) {
      globalSetupOptions[k] = options[k]
    }
  }

  return reqwest
});

exports.reqwest = module.exports;
module = { exports: { } };
/*
Author: Geraint Luff and others
Year: 2013

This code is released into the "public domain" by its author(s).  Anybody may use, alter and distribute the code without restriction.  The author makes no guarantees, and takes no liability of any kind for use of this code.

If you find a bug or make an improvement, it would be courteous to let the author know, but it is not compulsory.
*/
(function (global) {
'use strict';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FObject%2Fkeys
if (!Object.keys) {
	Object.keys = (function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function (obj) {
			if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [];

			for (var prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (var i=0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	})();
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
if (!Object.create) {
	Object.create = (function(){
		function F(){}

		return function(o){
			if (arguments.length !== 1) {
				throw new Error('Object.create implementation only accepts one parameter.');
			}
			F.prototype = o;
			return new F();
		};
	})();
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FisArray
if(!Array.isArray) {
	Array.isArray = function (vArg) {
		return Object.prototype.toString.call(vArg) === "[object Array]";
	};
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FindexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
		if (this === null) {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;

		if (len === 0) {
			return -1;
		}
		var n = 0;
		if (arguments.length > 1) {
			n = Number(arguments[1]);
			if (n !== n) { // shortcut for verifying if it's NaN
				n = 0;
			} else if (n !== 0 && n !== Infinity && n !== -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		if (n >= len) {
			return -1;
		}
		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	};
}

// Grungey Object.isFrozen hack
if (!Object.isFrozen) {
	Object.isFrozen = function (obj) {
		var key = "tv4_test_frozen_key";
		while (obj.hasOwnProperty(key)) {
			key += Math.random();
		}
		try {
			obj[key] = true;
			delete obj[key];
			return false;
		} catch (e) {
			return true;
		}
	};
}
var ValidatorContext = function ValidatorContext(parent, collectMultiple, errorMessages, checkRecursive, trackUnknownProperties) {
	this.missing = [];
	this.missingMap = {};
	this.formatValidators = parent ? Object.create(parent.formatValidators) : {};
	this.schemas = parent ? Object.create(parent.schemas) : {};
	this.collectMultiple = collectMultiple;
	this.errors = [];
	this.handleError = collectMultiple ? this.collectError : this.returnError;
	if (checkRecursive) {
		this.checkRecursive = true;
		this.scanned = [];
		this.scannedFrozen = [];
		this.scannedFrozenSchemas = [];
		this.scannedFrozenValidationErrors = [];
		this.validatedSchemasKey = 'tv4_validation_id';
		this.validationErrorsKey = 'tv4_validation_errors_id';
	}
	if (trackUnknownProperties) {
		this.trackUnknownProperties = true;
		this.knownPropertyPaths = {};
		this.unknownPropertyPaths = {};
	}
	this.errorMessages = errorMessages;
};
ValidatorContext.prototype.createError = function (code, messageParams, dataPath, schemaPath, subErrors) {
	var messageTemplate = this.errorMessages[code] || ErrorMessagesDefault[code];
	if (typeof messageTemplate !== 'string') {
		return new ValidationError(code, "Unknown error code " + code + ": " + JSON.stringify(messageParams), dataPath, schemaPath, subErrors);
	}
	// Adapted from Crockford's supplant()
	var message = messageTemplate.replace(/\{([^{}]*)\}/g, function (whole, varName) {
		var subValue = messageParams[varName];
		return typeof subValue === 'string' || typeof subValue === 'number' ? subValue : whole;
	});
	return new ValidationError(code, message, dataPath, schemaPath, subErrors);
};
ValidatorContext.prototype.returnError = function (error) {
	return error;
};
ValidatorContext.prototype.collectError = function (error) {
	if (error) {
		this.errors.push(error);
	}
	return null;
};
ValidatorContext.prototype.prefixErrors = function (startIndex, dataPath, schemaPath) {
	for (var i = startIndex; i < this.errors.length; i++) {
		this.errors[i] = this.errors[i].prefixWith(dataPath, schemaPath);
	}
	return this;
};
ValidatorContext.prototype.banUnknownProperties = function () {
	for (var unknownPath in this.unknownPropertyPaths) {
		var error = this.createError(ErrorCodes.UNKNOWN_PROPERTY, {path: unknownPath}, unknownPath, "");
		var result = this.handleError(error);
		if (result) {
			return result;
		}
	}
	return null;
};

ValidatorContext.prototype.addFormat = function (format, validator) {
	if (typeof format === 'object') {
		for (var key in format) {
			this.addFormat(key, format[key]);
		}
		return this;
	}
	this.formatValidators[format] = validator;
};
ValidatorContext.prototype.resolveRefs = function (schema, urlHistory) {
	if (schema['$ref'] !== undefined) {
		urlHistory = urlHistory || {};
		if (urlHistory[schema['$ref']]) {
			return this.createError(ErrorCodes.CIRCULAR_REFERENCE, {urls: Object.keys(urlHistory).join(', ')}, '', '');
		}
		urlHistory[schema['$ref']] = true;
		schema = this.getSchema(schema['$ref'], urlHistory);
	}
	return schema;
};
ValidatorContext.prototype.getSchema = function (url, urlHistory) {
	var schema;
	if (this.schemas[url] !== undefined) {
		schema = this.schemas[url];
		return this.resolveRefs(schema, urlHistory);
	}
	var baseUrl = url;
	var fragment = "";
	if (url.indexOf('#') !== -1) {
		fragment = url.substring(url.indexOf("#") + 1);
		baseUrl = url.substring(0, url.indexOf("#"));
	}
	if (typeof this.schemas[baseUrl] === 'object') {
		schema = this.schemas[baseUrl];
		var pointerPath = decodeURIComponent(fragment);
		if (pointerPath === "") {
			return this.resolveRefs(schema, urlHistory);
		} else if (pointerPath.charAt(0) !== "/") {
			return undefined;
		}
		var parts = pointerPath.split("/").slice(1);
		for (var i = 0; i < parts.length; i++) {
			var component = parts[i].replace(/~1/g, "/").replace(/~0/g, "~");
			if (schema[component] === undefined) {
				schema = undefined;
				break;
			}
			schema = schema[component];
		}
		if (schema !== undefined) {
			return this.resolveRefs(schema, urlHistory);
		}
	}
	if (this.missing[baseUrl] === undefined) {
		this.missing.push(baseUrl);
		this.missing[baseUrl] = baseUrl;
		this.missingMap[baseUrl] = baseUrl;
	}
};
ValidatorContext.prototype.searchSchemas = function (schema, url) {
	if (schema && typeof schema === "object") {
		if (typeof schema.id === "string") {
			if (isTrustedUrl(url, schema.id)) {
				if (this.schemas[schema.id] === undefined) {
					this.schemas[schema.id] = schema;
				}
			}
		}
		for (var key in schema) {
			if (key !== "enum") {
				if (typeof schema[key] === "object") {
					this.searchSchemas(schema[key], url);
				} else if (key === "$ref") {
					var uri = getDocumentUri(schema[key]);
					if (uri && this.schemas[uri] === undefined && this.missingMap[uri] === undefined) {
						this.missingMap[uri] = uri;
					}
				}
			}
		}
	}
};
ValidatorContext.prototype.addSchema = function (url, schema) {
	//overload
	if (typeof url !== 'string' || typeof schema === 'undefined') {
		if (typeof url === 'object' && typeof url.id === 'string') {
			schema = url;
			url = schema.id;
		}
		else {
			return;
		}
	}
	if (url = getDocumentUri(url) + "#") {
		// Remove empty fragment
		url = getDocumentUri(url);
	}
	this.schemas[url] = schema;
	delete this.missingMap[url];
	normSchema(schema, url);
	this.searchSchemas(schema, url);
};

ValidatorContext.prototype.getSchemaMap = function () {
	var map = {};
	for (var key in this.schemas) {
		map[key] = this.schemas[key];
	}
	return map;
};

ValidatorContext.prototype.getSchemaUris = function (filterRegExp) {
	var list = [];
	for (var key in this.schemas) {
		if (!filterRegExp || filterRegExp.test(key)) {
			list.push(key);
		}
	}
	return list;
};

ValidatorContext.prototype.getMissingUris = function (filterRegExp) {
	var list = [];
	for (var key in this.missingMap) {
		if (!filterRegExp || filterRegExp.test(key)) {
			list.push(key);
		}
	}
	return list;
};

ValidatorContext.prototype.dropSchemas = function () {
	this.schemas = {};
	this.reset();
};
ValidatorContext.prototype.reset = function () {
	this.missing = [];
	this.missingMap = {};
	this.errors = [];
};

ValidatorContext.prototype.validateAll = function (data, schema, dataPathParts, schemaPathParts, dataPointerPath) {
	var topLevel;
	schema = this.resolveRefs(schema);
	if (!schema) {
		return null;
	} else if (schema instanceof ValidationError) {
		this.errors.push(schema);
		return schema;
	}

	var startErrorCount = this.errors.length;
	var frozenIndex, scannedFrozenSchemaIndex = null, scannedSchemasIndex = null;
	if (this.checkRecursive && (typeof data) === 'object') {
		topLevel = !this.scanned.length;
		if (data[this.validatedSchemasKey]) {
			var schemaIndex = data[this.validatedSchemasKey].indexOf(schema);
			if (schemaIndex !== -1) {
				this.errors = this.errors.concat(data[this.validationErrorsKey][schemaIndex]);
				return null;
			}
		}
		if (Object.isFrozen(data)) {
			frozenIndex = this.scannedFrozen.indexOf(data);
			if (frozenIndex !== -1) {
				var frozenSchemaIndex = this.scannedFrozenSchemas[frozenIndex].indexOf(schema);
				if (frozenSchemaIndex !== -1) {
					this.errors = this.errors.concat(this.scannedFrozenValidationErrors[frozenIndex][frozenSchemaIndex]);
					return null;
				}
			}
		}
		this.scanned.push(data);
		if (Object.isFrozen(data)) {
			if (frozenIndex === -1) {
				frozenIndex = this.scannedFrozen.length;
				this.scannedFrozen.push(data);
				this.scannedFrozenSchemas.push([]);
			}
			scannedFrozenSchemaIndex = this.scannedFrozenSchemas[frozenIndex].length;
			this.scannedFrozenSchemas[frozenIndex][scannedFrozenSchemaIndex] = schema;
			this.scannedFrozenValidationErrors[frozenIndex][scannedFrozenSchemaIndex] = [];
		} else {
			if (!data[this.validatedSchemasKey]) {
				try {
					Object.defineProperty(data, this.validatedSchemasKey, {
						value: [],
						configurable: true
					});
					Object.defineProperty(data, this.validationErrorsKey, {
						value: [],
						configurable: true
					});
				} catch (e) {
					//IE 7/8 workaround
					data[this.validatedSchemasKey] = [];
					data[this.validationErrorsKey] = [];
				}
			}
			scannedSchemasIndex = data[this.validatedSchemasKey].length;
			data[this.validatedSchemasKey][scannedSchemasIndex] = schema;
			data[this.validationErrorsKey][scannedSchemasIndex] = [];
		}
	}

	var errorCount = this.errors.length;
	var error = this.validateBasic(data, schema, dataPointerPath)
		|| this.validateNumeric(data, schema, dataPointerPath)
		|| this.validateString(data, schema, dataPointerPath)
		|| this.validateArray(data, schema, dataPointerPath)
		|| this.validateObject(data, schema, dataPointerPath)
		|| this.validateCombinations(data, schema, dataPointerPath)
		|| this.validateFormat(data, schema, dataPointerPath)
		|| null;

	if (topLevel) {
		while (this.scanned.length) {
			var item = this.scanned.pop();
			delete item[this.validatedSchemasKey];
		}
		this.scannedFrozen = [];
		this.scannedFrozenSchemas = [];
	}

	if (error || errorCount !== this.errors.length) {
		while ((dataPathParts && dataPathParts.length) || (schemaPathParts && schemaPathParts.length)) {
			var dataPart = (dataPathParts && dataPathParts.length) ? "" + dataPathParts.pop() : null;
			var schemaPart = (schemaPathParts && schemaPathParts.length) ? "" + schemaPathParts.pop() : null;
			if (error) {
				error = error.prefixWith(dataPart, schemaPart);
			}
			this.prefixErrors(errorCount, dataPart, schemaPart);
		}
	}
	
	if (scannedFrozenSchemaIndex !== null) {
		this.scannedFrozenValidationErrors[frozenIndex][scannedFrozenSchemaIndex] = this.errors.slice(startErrorCount);
	} else if (scannedSchemasIndex !== null) {
		data[this.validationErrorsKey][scannedSchemasIndex] = this.errors.slice(startErrorCount);
	}

	return this.handleError(error);
};
ValidatorContext.prototype.validateFormat = function (data, schema) {
	if (typeof schema.format !== 'string' || !this.formatValidators[schema.format]) {
		return null;
	}
	var errorMessage = this.formatValidators[schema.format].call(null, data, schema);
	if (typeof errorMessage === 'string' || typeof errorMessage === 'number') {
		return this.createError(ErrorCodes.FORMAT_CUSTOM, {message: errorMessage}).prefixWith(null, "format");
	} else if (errorMessage && typeof errorMessage === 'object') {
		return this.createError(ErrorCodes.FORMAT_CUSTOM, {message: errorMessage.message || "?"}, errorMessage.dataPath || null, errorMessage.schemaPath || "/format");
	}
	return null;
};

function recursiveCompare(A, B) {
	if (A === B) {
		return true;
	}
	if (typeof A === "object" && typeof B === "object") {
		if (Array.isArray(A) !== Array.isArray(B)) {
			return false;
		} else if (Array.isArray(A)) {
			if (A.length !== B.length) {
				return false;
			}
			for (var i = 0; i < A.length; i++) {
				if (!recursiveCompare(A[i], B[i])) {
					return false;
				}
			}
		} else {
			var key;
			for (key in A) {
				if (B[key] === undefined && A[key] !== undefined) {
					return false;
				}
			}
			for (key in B) {
				if (A[key] === undefined && B[key] !== undefined) {
					return false;
				}
			}
			for (key in A) {
				if (!recursiveCompare(A[key], B[key])) {
					return false;
				}
			}
		}
		return true;
	}
	return false;
}

ValidatorContext.prototype.validateBasic = function validateBasic(data, schema, dataPointerPath) {
	var error;
	if (error = this.validateType(data, schema, dataPointerPath)) {
		return error.prefixWith(null, "type");
	}
	if (error = this.validateEnum(data, schema, dataPointerPath)) {
		return error.prefixWith(null, "type");
	}
	return null;
};

ValidatorContext.prototype.validateType = function validateType(data, schema) {
	if (schema.type === undefined) {
		return null;
	}
	var dataType = typeof data;
	if (data === null) {
		dataType = "null";
	} else if (Array.isArray(data)) {
		dataType = "array";
	}
	var allowedTypes = schema.type;
	if (typeof allowedTypes !== "object") {
		allowedTypes = [allowedTypes];
	}

	for (var i = 0; i < allowedTypes.length; i++) {
		var type = allowedTypes[i];
		if (type === dataType || (type === "integer" && dataType === "number" && (data % 1 === 0))) {
			return null;
		}
	}
	return this.createError(ErrorCodes.INVALID_TYPE, {type: dataType, expected: allowedTypes.join("/")});
};

ValidatorContext.prototype.validateEnum = function validateEnum(data, schema) {
	if (schema["enum"] === undefined) {
		return null;
	}
	for (var i = 0; i < schema["enum"].length; i++) {
		var enumVal = schema["enum"][i];
		if (recursiveCompare(data, enumVal)) {
			return null;
		}
	}
	return this.createError(ErrorCodes.ENUM_MISMATCH, {value: (typeof JSON !== 'undefined') ? JSON.stringify(data) : data});
};

ValidatorContext.prototype.validateNumeric = function validateNumeric(data, schema, dataPointerPath) {
	return this.validateMultipleOf(data, schema, dataPointerPath)
		|| this.validateMinMax(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateMultipleOf = function validateMultipleOf(data, schema) {
	var multipleOf = schema.multipleOf || schema.divisibleBy;
	if (multipleOf === undefined) {
		return null;
	}
	if (typeof data === "number") {
		if (data % multipleOf !== 0) {
			return this.createError(ErrorCodes.NUMBER_MULTIPLE_OF, {value: data, multipleOf: multipleOf});
		}
	}
	return null;
};

ValidatorContext.prototype.validateMinMax = function validateMinMax(data, schema) {
	if (typeof data !== "number") {
		return null;
	}
	if (schema.minimum !== undefined) {
		if (data < schema.minimum) {
			return this.createError(ErrorCodes.NUMBER_MINIMUM, {value: data, minimum: schema.minimum}).prefixWith(null, "minimum");
		}
		if (schema.exclusiveMinimum && data === schema.minimum) {
			return this.createError(ErrorCodes.NUMBER_MINIMUM_EXCLUSIVE, {value: data, minimum: schema.minimum}).prefixWith(null, "exclusiveMinimum");
		}
	}
	if (schema.maximum !== undefined) {
		if (data > schema.maximum) {
			return this.createError(ErrorCodes.NUMBER_MAXIMUM, {value: data, maximum: schema.maximum}).prefixWith(null, "maximum");
		}
		if (schema.exclusiveMaximum && data === schema.maximum) {
			return this.createError(ErrorCodes.NUMBER_MAXIMUM_EXCLUSIVE, {value: data, maximum: schema.maximum}).prefixWith(null, "exclusiveMaximum");
		}
	}
	return null;
};

ValidatorContext.prototype.validateString = function validateString(data, schema, dataPointerPath) {
	return this.validateStringLength(data, schema, dataPointerPath)
		|| this.validateStringPattern(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateStringLength = function validateStringLength(data, schema) {
	if (typeof data !== "string") {
		return null;
	}
	if (schema.minLength !== undefined) {
		if (data.length < schema.minLength) {
			return this.createError(ErrorCodes.STRING_LENGTH_SHORT, {length: data.length, minimum: schema.minLength}).prefixWith(null, "minLength");
		}
	}
	if (schema.maxLength !== undefined) {
		if (data.length > schema.maxLength) {
			return this.createError(ErrorCodes.STRING_LENGTH_LONG, {length: data.length, maximum: schema.maxLength}).prefixWith(null, "maxLength");
		}
	}
	return null;
};

ValidatorContext.prototype.validateStringPattern = function validateStringPattern(data, schema) {
	if (typeof data !== "string" || schema.pattern === undefined) {
		return null;
	}
	var regexp = new RegExp(schema.pattern);
	if (!regexp.test(data)) {
		return this.createError(ErrorCodes.STRING_PATTERN, {pattern: schema.pattern}).prefixWith(null, "pattern");
	}
	return null;
};
ValidatorContext.prototype.validateArray = function validateArray(data, schema, dataPointerPath) {
	if (!Array.isArray(data)) {
		return null;
	}
	return this.validateArrayLength(data, schema, dataPointerPath)
		|| this.validateArrayUniqueItems(data, schema, dataPointerPath)
		|| this.validateArrayItems(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateArrayLength = function validateArrayLength(data, schema) {
	var error;
	if (schema.minItems !== undefined) {
		if (data.length < schema.minItems) {
			error = (this.createError(ErrorCodes.ARRAY_LENGTH_SHORT, {length: data.length, minimum: schema.minItems})).prefixWith(null, "minItems");
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	if (schema.maxItems !== undefined) {
		if (data.length > schema.maxItems) {
			error = (this.createError(ErrorCodes.ARRAY_LENGTH_LONG, {length: data.length, maximum: schema.maxItems})).prefixWith(null, "maxItems");
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateArrayUniqueItems = function validateArrayUniqueItems(data, schema) {
	if (schema.uniqueItems) {
		for (var i = 0; i < data.length; i++) {
			for (var j = i + 1; j < data.length; j++) {
				if (recursiveCompare(data[i], data[j])) {
					var error = (this.createError(ErrorCodes.ARRAY_UNIQUE, {match1: i, match2: j})).prefixWith(null, "uniqueItems");
					if (this.handleError(error)) {
						return error;
					}
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateArrayItems = function validateArrayItems(data, schema, dataPointerPath) {
	if (schema.items === undefined) {
		return null;
	}
	var error, i;
	if (Array.isArray(schema.items)) {
		for (i = 0; i < data.length; i++) {
			if (i < schema.items.length) {
				if (error = this.validateAll(data[i], schema.items[i], [i], ["items", i], dataPointerPath + "/" + i)) {
					return error;
				}
			} else if (schema.additionalItems !== undefined) {
				if (typeof schema.additionalItems === "boolean") {
					if (!schema.additionalItems) {
						error = (this.createError(ErrorCodes.ARRAY_ADDITIONAL_ITEMS, {})).prefixWith("" + i, "additionalItems");
						if (this.handleError(error)) {
							return error;
						}
					}
				} else if (error = this.validateAll(data[i], schema.additionalItems, [i], ["additionalItems"], dataPointerPath + "/" + i)) {
					return error;
				}
			}
		}
	} else {
		for (i = 0; i < data.length; i++) {
			if (error = this.validateAll(data[i], schema.items, [i], ["items"], dataPointerPath + "/" + i)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObject = function validateObject(data, schema, dataPointerPath) {
	if (typeof data !== "object" || data === null || Array.isArray(data)) {
		return null;
	}
	return this.validateObjectMinMaxProperties(data, schema, dataPointerPath)
		|| this.validateObjectRequiredProperties(data, schema, dataPointerPath)
		|| this.validateObjectProperties(data, schema, dataPointerPath)
		|| this.validateObjectDependencies(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateObjectMinMaxProperties = function validateObjectMinMaxProperties(data, schema) {
	var keys = Object.keys(data);
	var error;
	if (schema.minProperties !== undefined) {
		if (keys.length < schema.minProperties) {
			error = this.createError(ErrorCodes.OBJECT_PROPERTIES_MINIMUM, {propertyCount: keys.length, minimum: schema.minProperties}).prefixWith(null, "minProperties");
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	if (schema.maxProperties !== undefined) {
		if (keys.length > schema.maxProperties) {
			error = this.createError(ErrorCodes.OBJECT_PROPERTIES_MAXIMUM, {propertyCount: keys.length, maximum: schema.maxProperties}).prefixWith(null, "maxProperties");
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectRequiredProperties = function validateObjectRequiredProperties(data, schema) {
	if (schema.required !== undefined) {
		for (var i = 0; i < schema.required.length; i++) {
			var key = schema.required[i];
			if (data[key] === undefined) {
				var error = this.createError(ErrorCodes.OBJECT_REQUIRED, {key: key}).prefixWith(null, "" + i).prefixWith(null, "required");
				if (this.handleError(error)) {
					return error;
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectProperties = function validateObjectProperties(data, schema, dataPointerPath) {
	var error;
	for (var key in data) {
		var keyPointerPath = dataPointerPath + "/" + key.replace(/~/g, '~0').replace(/\//g, '~1');
		var foundMatch = false;
		if (schema.properties !== undefined && schema.properties[key] !== undefined) {
			foundMatch = true;
			if (error = this.validateAll(data[key], schema.properties[key], [key], ["properties", key], keyPointerPath)) {
				return error;
			}
		}
		if (schema.patternProperties !== undefined) {
			for (var patternKey in schema.patternProperties) {
				var regexp = new RegExp(patternKey);
				if (regexp.test(key)) {
					foundMatch = true;
					if (error = this.validateAll(data[key], schema.patternProperties[patternKey], [key], ["patternProperties", patternKey], keyPointerPath)) {
						return error;
					}
				}
			}
		}
		if (!foundMatch) {
			if (schema.additionalProperties !== undefined) {
				if (this.trackUnknownProperties) {
					this.knownPropertyPaths[keyPointerPath] = true;
					delete this.unknownPropertyPaths[keyPointerPath];
				}
				if (typeof schema.additionalProperties === "boolean") {
					if (!schema.additionalProperties) {
						error = this.createError(ErrorCodes.OBJECT_ADDITIONAL_PROPERTIES, {}).prefixWith(key, "additionalProperties");
						if (this.handleError(error)) {
							return error;
						}
					}
				} else {
					if (error = this.validateAll(data[key], schema.additionalProperties, [key], ["additionalProperties"], keyPointerPath)) {
						return error;
					}
				}
			} else if (this.trackUnknownProperties && !this.knownPropertyPaths[keyPointerPath]) {
				this.unknownPropertyPaths[keyPointerPath] = true;
			}
		} else if (this.trackUnknownProperties) {
			this.knownPropertyPaths[keyPointerPath] = true;
			delete this.unknownPropertyPaths[keyPointerPath];
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectDependencies = function validateObjectDependencies(data, schema, dataPointerPath) {
	var error;
	if (schema.dependencies !== undefined) {
		for (var depKey in schema.dependencies) {
			if (data[depKey] !== undefined) {
				var dep = schema.dependencies[depKey];
				if (typeof dep === "string") {
					if (data[dep] === undefined) {
						error = this.createError(ErrorCodes.OBJECT_DEPENDENCY_KEY, {key: depKey, missing: dep}).prefixWith(null, depKey).prefixWith(null, "dependencies");
						if (this.handleError(error)) {
							return error;
						}
					}
				} else if (Array.isArray(dep)) {
					for (var i = 0; i < dep.length; i++) {
						var requiredKey = dep[i];
						if (data[requiredKey] === undefined) {
							error = this.createError(ErrorCodes.OBJECT_DEPENDENCY_KEY, {key: depKey, missing: requiredKey}).prefixWith(null, "" + i).prefixWith(null, depKey).prefixWith(null, "dependencies");
							if (this.handleError(error)) {
								return error;
							}
						}
					}
				} else {
					if (error = this.validateAll(data, dep, [], ["dependencies", depKey], dataPointerPath)) {
						return error;
					}
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateCombinations = function validateCombinations(data, schema, dataPointerPath) {
	return this.validateAllOf(data, schema, dataPointerPath)
		|| this.validateAnyOf(data, schema, dataPointerPath)
		|| this.validateOneOf(data, schema, dataPointerPath)
		|| this.validateNot(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateAllOf = function validateAllOf(data, schema, dataPointerPath) {
	if (schema.allOf === undefined) {
		return null;
	}
	var error;
	for (var i = 0; i < schema.allOf.length; i++) {
		var subSchema = schema.allOf[i];
		if (error = this.validateAll(data, subSchema, [], ["allOf", i], dataPointerPath)) {
			return error;
		}
	}
	return null;
};

ValidatorContext.prototype.validateAnyOf = function validateAnyOf(data, schema, dataPointerPath) {
	if (schema.anyOf === undefined) {
		return null;
	}
	var errors = [];
	var startErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
	}
	var errorAtEnd = true;
	for (var i = 0; i < schema.anyOf.length; i++) {
		if (this.trackUnknownProperties) {
			this.unknownPropertyPaths = {};
			this.knownPropertyPaths = {};
		}
		var subSchema = schema.anyOf[i];

		var errorCount = this.errors.length;
		var error = this.validateAll(data, subSchema, [], ["anyOf", i], dataPointerPath);

		if (error === null && errorCount === this.errors.length) {
			this.errors = this.errors.slice(0, startErrorCount);

			if (this.trackUnknownProperties) {
				for (var knownKey in this.knownPropertyPaths) {
					oldKnownPropertyPaths[knownKey] = true;
					delete oldUnknownPropertyPaths[knownKey];
				}
				for (var unknownKey in this.unknownPropertyPaths) {
					if (!oldKnownPropertyPaths[unknownKey]) {
						oldUnknownPropertyPaths[unknownKey] = true;
					}
				}
				// We need to continue looping so we catch all the property definitions, but we don't want to return an error
				errorAtEnd = false;
				continue;
			}

			return null;
		}
		if (error) {
			errors.push(error.prefixWith(null, "" + i).prefixWith(null, "anyOf"));
		}
	}
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (errorAtEnd) {
		errors = errors.concat(this.errors.slice(startErrorCount));
		this.errors = this.errors.slice(0, startErrorCount);
		return this.createError(ErrorCodes.ANY_OF_MISSING, {}, "", "/anyOf", errors);
	}
};

ValidatorContext.prototype.validateOneOf = function validateOneOf(data, schema, dataPointerPath) {
	if (schema.oneOf === undefined) {
		return null;
	}
	var validIndex = null;
	var errors = [];
	var startErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
	}
	for (var i = 0; i < schema.oneOf.length; i++) {
		if (this.trackUnknownProperties) {
			this.unknownPropertyPaths = {};
			this.knownPropertyPaths = {};
		}
		var subSchema = schema.oneOf[i];

		var errorCount = this.errors.length;
		var error = this.validateAll(data, subSchema, [], ["oneOf", i], dataPointerPath);

		if (error === null && errorCount === this.errors.length) {
			if (validIndex === null) {
				validIndex = i;
			} else {
				this.errors = this.errors.slice(0, startErrorCount);
				return this.createError(ErrorCodes.ONE_OF_MULTIPLE, {index1: validIndex, index2: i}, "", "/oneOf");
			}
			if (this.trackUnknownProperties) {
				for (var knownKey in this.knownPropertyPaths) {
					oldKnownPropertyPaths[knownKey] = true;
					delete oldUnknownPropertyPaths[knownKey];
				}
				for (var unknownKey in this.unknownPropertyPaths) {
					if (!oldKnownPropertyPaths[unknownKey]) {
						oldUnknownPropertyPaths[unknownKey] = true;
					}
				}
			}
		} else if (error) {
			errors.push(error.prefixWith(null, "" + i).prefixWith(null, "oneOf"));
		}
	}
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (validIndex === null) {
		errors = errors.concat(this.errors.slice(startErrorCount));
		this.errors = this.errors.slice(0, startErrorCount);
		return this.createError(ErrorCodes.ONE_OF_MISSING, {}, "", "/oneOf", errors);
	} else {
		this.errors = this.errors.slice(0, startErrorCount);
	}
	return null;
};

ValidatorContext.prototype.validateNot = function validateNot(data, schema, dataPointerPath) {
	if (schema.not === undefined) {
		return null;
	}
	var oldErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
		this.unknownPropertyPaths = {};
		this.knownPropertyPaths = {};
	}
	var error = this.validateAll(data, schema.not, null, null, dataPointerPath);
	var notErrors = this.errors.slice(oldErrorCount);
	this.errors = this.errors.slice(0, oldErrorCount);
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (error === null && notErrors.length === 0) {
		return this.createError(ErrorCodes.NOT_PASSED, {}, "", "/not");
	}
	return null;
};

// parseURI() and resolveUrl() are from https://gist.github.com/1088850
//   -  released as public domain by author ("Yaffle") - see comments on gist

function parseURI(url) {
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
}

function resolveUrl(base, href) {// RFC 3986

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

	href = parseURI(href || '');
	base = parseURI(base || '');

	return !href || !base ? null : (href.protocol || base.protocol) +
		(href.protocol || href.authority ? href.authority : base.authority) +
		removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
		(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
		href.hash;
}

function getDocumentUri(uri) {
	return uri.split('#')[0];
}
function normSchema(schema, baseUri) {
	if (schema && typeof schema === "object") {
		if (baseUri === undefined) {
			baseUri = schema.id;
		} else if (typeof schema.id === "string") {
			baseUri = resolveUrl(baseUri, schema.id);
			schema.id = baseUri;
		}
		if (Array.isArray(schema)) {
			for (var i = 0; i < schema.length; i++) {
				normSchema(schema[i], baseUri);
			}
		} else if (typeof schema['$ref'] === "string") {
			schema['$ref'] = resolveUrl(baseUri, schema['$ref']);
		} else {
			for (var key in schema) {
				if (key !== "enum") {
					normSchema(schema[key], baseUri);
				}
			}
		}
	}
}

var ErrorCodes = {
	INVALID_TYPE: 0,
	ENUM_MISMATCH: 1,
	ANY_OF_MISSING: 10,
	ONE_OF_MISSING: 11,
	ONE_OF_MULTIPLE: 12,
	NOT_PASSED: 13,
	// Numeric errors
	NUMBER_MULTIPLE_OF: 100,
	NUMBER_MINIMUM: 101,
	NUMBER_MINIMUM_EXCLUSIVE: 102,
	NUMBER_MAXIMUM: 103,
	NUMBER_MAXIMUM_EXCLUSIVE: 104,
	// String errors
	STRING_LENGTH_SHORT: 200,
	STRING_LENGTH_LONG: 201,
	STRING_PATTERN: 202,
	// Object errors
	OBJECT_PROPERTIES_MINIMUM: 300,
	OBJECT_PROPERTIES_MAXIMUM: 301,
	OBJECT_REQUIRED: 302,
	OBJECT_ADDITIONAL_PROPERTIES: 303,
	OBJECT_DEPENDENCY_KEY: 304,
	// Array errors
	ARRAY_LENGTH_SHORT: 400,
	ARRAY_LENGTH_LONG: 401,
	ARRAY_UNIQUE: 402,
	ARRAY_ADDITIONAL_ITEMS: 403,
	// Format errors
	FORMAT_CUSTOM: 500,
	// Schema structure
	CIRCULAR_REFERENCE: 500,
	// Non-standard validation options
	UNKNOWN_PROPERTY: 1000
};
var ErrorMessagesDefault = {
	INVALID_TYPE: "invalid type: {type} (expected {expected})",
	ENUM_MISMATCH: "No enum match for: {value}",
	ANY_OF_MISSING: "Data does not match any schemas from \"anyOf\"",
	ONE_OF_MISSING: "Data does not match any schemas from \"oneOf\"",
	ONE_OF_MULTIPLE: "Data is valid against more than one schema from \"oneOf\": indices {index1} and {index2}",
	NOT_PASSED: "Data matches schema from \"not\"",
	// Numeric errors
	NUMBER_MULTIPLE_OF: "Value {value} is not a multiple of {multipleOf}",
	NUMBER_MINIMUM: "Value {value} is less than minimum {minimum}",
	NUMBER_MINIMUM_EXCLUSIVE: "Value {value} is equal to exclusive minimum {minimum}",
	NUMBER_MAXIMUM: "Value {value} is greater than maximum {maximum}",
	NUMBER_MAXIMUM_EXCLUSIVE: "Value {value} is equal to exclusive maximum {maximum}",
	// String errors
	STRING_LENGTH_SHORT: "String is too short ({length} chars), minimum {minimum}",
	STRING_LENGTH_LONG: "String is too long ({length} chars), maximum {maximum}",
	STRING_PATTERN: "String does not match pattern: {pattern}",
	// Object errors
	OBJECT_PROPERTIES_MINIMUM: "Too few properties defined ({propertyCount}), minimum {minimum}",
	OBJECT_PROPERTIES_MAXIMUM: "Too many properties defined ({propertyCount}), maximum {maximum}",
	OBJECT_REQUIRED: "Missing required property: {key}",
	OBJECT_ADDITIONAL_PROPERTIES: "Additional properties not allowed",
	OBJECT_DEPENDENCY_KEY: "Dependency failed - key must exist: {missing} (due to key: {key})",
	// Array errors
	ARRAY_LENGTH_SHORT: "Array is too short ({length}), minimum {minimum}",
	ARRAY_LENGTH_LONG: "Array is too long ({length}), maximum {maximum}",
	ARRAY_UNIQUE: "Array items are not unique (indices {match1} and {match2})",
	ARRAY_ADDITIONAL_ITEMS: "Additional items not allowed",
	// Format errors
	FORMAT_CUSTOM: "Format validation failed ({message})",
	// Schema structure
	CIRCULAR_REFERENCE: "Circular $refs: {urls}",
	// Non-standard validation options
	UNKNOWN_PROPERTY: "Unknown property (not in schema)"
};

function ValidationError(code, message, dataPath, schemaPath, subErrors) {
	Error.call(this);
	if (code === undefined) {
		throw new Error ("No code supplied for error: "+ message);
	}
	this.message = message;
	this.code = code;
	this.dataPath = dataPath || "";
	this.schemaPath = schemaPath || "";
	this.subErrors = subErrors || null;

	var err = new Error(this.message);
	this.stack = err.stack || err.stacktrace;
	if (!this.stack) {
		try {
			throw err;
		}
		catch(err) {
			this.stack = err.stack || err.stacktrace;
		}
	}
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;
ValidationError.prototype.name = 'ValidationError';

ValidationError.prototype.prefixWith = function (dataPrefix, schemaPrefix) {
	if (dataPrefix !== null) {
		dataPrefix = dataPrefix.replace(/~/g, "~0").replace(/\//g, "~1");
		this.dataPath = "/" + dataPrefix + this.dataPath;
	}
	if (schemaPrefix !== null) {
		schemaPrefix = schemaPrefix.replace(/~/g, "~0").replace(/\//g, "~1");
		this.schemaPath = "/" + schemaPrefix + this.schemaPath;
	}
	if (this.subErrors !== null) {
		for (var i = 0; i < this.subErrors.length; i++) {
			this.subErrors[i].prefixWith(dataPrefix, schemaPrefix);
		}
	}
	return this;
};

function isTrustedUrl(baseUrl, testUrl) {
	if(testUrl.substring(0, baseUrl.length) === baseUrl){
		var remainder = testUrl.substring(baseUrl.length);
		if ((testUrl.length > 0 && testUrl.charAt(baseUrl.length - 1) === "/")
			|| remainder.charAt(0) === "#"
			|| remainder.charAt(0) === "?") {
			return true;
		}
	}
	return false;
}

var languages = {};
function createApi(language) {
	var globalContext = new ValidatorContext();
	var currentLanguage = language || 'en';
	var api = {
		addFormat: function () {
			globalContext.addFormat.apply(globalContext, arguments);
		},
		language: function (code) {
			if (!code) {
				return currentLanguage;
			}
			if (!languages[code]) {
				code = code.split('-')[0]; // fall back to base language
			}
			if (languages[code]) {
				currentLanguage = code;
				return code; // so you can tell if fall-back has happened
			}
			return false;
		},
		addLanguage: function (code, messageMap) {
			var key;
			for (key in ErrorCodes) {
				if (messageMap[key] && !messageMap[ErrorCodes[key]]) {
					messageMap[ErrorCodes[key]] = messageMap[key];
				}
			}
			var rootCode = code.split('-')[0];
			if (!languages[rootCode]) { // use for base language if not yet defined
				languages[code] = messageMap;
				languages[rootCode] = messageMap;
			} else {
				languages[code] = Object.create(languages[rootCode]);
				for (key in messageMap) {
					if (typeof languages[rootCode][key] === 'undefined') {
						languages[rootCode][key] = messageMap[key];
					}
					languages[code][key] = messageMap[key];
				}
			}
			return this;
		},
		freshApi: function (language) {
			var result = createApi();
			if (language) {
				result.language(language);
			}
			return result;
		},
		validate: function (data, schema, checkRecursive, banUnknownProperties) {
			var context = new ValidatorContext(globalContext, false, languages[currentLanguage], checkRecursive, banUnknownProperties);
			if (typeof schema === "string") {
				schema = {"$ref": schema};
			}
			context.addSchema("", schema);
			var error = context.validateAll(data, schema, null, null, "");
			if (!error && banUnknownProperties) {
				error = context.banUnknownProperties();
			}
			this.error = error;
			this.missing = context.missing;
			this.valid = (error === null);
			return this.valid;
		},
		validateResult: function () {
			var result = {};
			this.validate.apply(result, arguments);
			return result;
		},
		validateMultiple: function (data, schema, checkRecursive, banUnknownProperties) {
			var context = new ValidatorContext(globalContext, true, languages[currentLanguage], checkRecursive, banUnknownProperties);
			if (typeof schema === "string") {
				schema = {"$ref": schema};
			}
			context.addSchema("", schema);
			context.validateAll(data, schema, null, null, "");
			if (banUnknownProperties) {
				context.banUnknownProperties();
			}
			var result = {};
			result.errors = context.errors;
			result.missing = context.missing;
			result.valid = (result.errors.length === 0);
			return result;
		},
		addSchema: function () {
			return globalContext.addSchema.apply(globalContext, arguments);
		},
		getSchema: function () {
			return globalContext.getSchema.apply(globalContext, arguments);
		},
		getSchemaMap: function () {
			return globalContext.getSchemaMap.apply(globalContext, arguments);
		},
		getSchemaUris: function () {
			return globalContext.getSchemaUris.apply(globalContext, arguments);
		},
		getMissingUris: function () {
			return globalContext.getMissingUris.apply(globalContext, arguments);
		},
		dropSchemas: function () {
			globalContext.dropSchemas.apply(globalContext, arguments);
		},
		reset: function () {
			globalContext.reset();
			this.error = null;
			this.missing = [];
			this.valid = true;
		},
		missing: [],
		error: null,
		valid: true,
		normSchema: normSchema,
		resolveUrl: resolveUrl,
		getDocumentUri: getDocumentUri,
		errorCodes: ErrorCodes
	};
	return api;
}

var tv4 = createApi();
tv4.addLanguage('en-gb', ErrorMessagesDefault);

//legacy property
tv4.tv4 = tv4;

if (typeof module !== 'undefined' && module.exports){
	module.exports = tv4;
}
else {
	global.tv4 = tv4;
}

})(this);


exports.tv4 = module.exports;
module = { exports: { } };
}).call(
	_window /* function context */,
	_exports /* param="exports" */,
	_window /* param="window" */,
	window /* param="f2Window" */,
	_module = { exports: { } } /* param="module" */
);

// Create locally scoped vars of our libs
var tv4 = _exports.tv4;
var reqwest = _exports.reqwest;

// Pull the document off exports
_exports = undefined;

/*
	Code generously borrowed from the underscore library. Some code has been
	modified to work outside the complete library.

	http://underscorejs.org/
*/
(function() {

	Helpers._ = {
		defaults: function(obj) {
			Array.prototype.slice.call(arguments, 1).forEach(function(source) {
				if (source) {
					for (var prop in source) {
						if (obj[prop] === void 0) {
							obj[prop] = source[prop];
						}
					}
				}
			});

			return obj;
		},
		extend: function(obj) {
			Array.prototype.slice.call(arguments, 1).forEach(function(source) {
				if (source) {
					for (var prop in source) {
						obj[prop] = source[prop];
					}
				}
			});

			return obj;
		},
		isArray: function(test) {
			if (Array.isArray) {
				return Array.isArray(test);
			}
			else {
				return Object.prototype.toString.call(test) == '[object Array]';
			}
		},
		isFunction: function(test) {
			return typeof test === 'function';
		},
		isNode: function(test) {
			return test && test.nodeType === 1;
		},
		isString: function(test) {
			return typeof test === 'string';
		},
		isObject: function(test) {
			return test === Object(test);
		},
		pluck: function(list, property) {
			var props = [];

			for (var i = 0; i < list.length; i++) {
				if (list[i] && list[i][property]) {
					props.push(list[i][property]);
				}
			}

			return props;
		},
		unique: function(array) {
			if (!array) {
				return [];
			}

			var result = [];
			var seen = [];

			for (var i = 0, length = array.length; i < length; i++) {
				var value = array[i];

				if (value && result.indexOf(value) === -1) {
					result.push(value);
				}

				seen.push(value);
			}

			return result;
		}
	};

})();

(function(_) {

	function loadDependencies(config, deps, callback) {
		// Check for user defined loader
		if (_.isFunction(config.loadDependencies)) {
			config.loadDependencies(deps, callback);
		}
		else {
			// Add the paths to the global config
			deps.forEach(function(map) {
				require.config({
					paths: map
				});
			});

			callback();
		}
	}

	function loadInlineScripts(inlines, callback) {
		if (inlines.length) {
			try {
				eval(inlines.join(';'));
			}
			catch (e) {
				console.error('Error loading inline scripts: ' + e);
			}
		}

		callback();
	}

	function loadScripts(config, paths, callback) {
		// Check for user defined loader
		if (_.isFunction(config.loadScripts)) {
			config.loadScripts(paths, callback);
		}
		else {
			require(paths, function() {
				callback();
			});
		}
	}

	function loadStyles(config, paths, callback) {
		// Check for user defined loader
		if (_.isFunction(config.loadStyles)) {
			config.loadStyles(paths, callback);
		}
		else {
			var head = document.getElementsByTagName('head')[0];

			for (var i = 0; i < paths.length; i++) {
				var node = document.createElement('link');
				node.rel = 'stylesheet';
				node.href = paths[i];
				node.async = false;
				head.appendChild(node);
			}

			callback();
		}
	}

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	Helpers.LoadStaticFiles = {
		load: function(containerConfig, styles, scripts, inlineScripts, deps, callback) {
			// Waterfall of doom
			loadStyles(containerConfig, styles, function() {
				loadScripts(containerConfig, scripts, function() {
					loadDependencies(containerConfig, deps, function() {
						loadInlineScripts(inlineScripts, function() {
							callback();
						});
					});
				});
			});
		}
	};

})(Helpers._);

(function(reqwest) {

	function delim(url) {
		return (url.indexOf('?') === -1) ? '?' : '&';
	}

	/**
	 * Parses URI
	 * @method _parseURI
	 * @private
	 * @param {The URL to parse} url
	 * @returns {Parsed URL} string
	 * Source: https://gist.github.com/Yaffle/1088850
	 * Tests: http://skew.org/uri/uri_tests.html
	 */
	function _parseURI(url) {
		var m = String(url)
			.replace(/^\s+|\s+$/g, '')
			.match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
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
	}

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
	function _absolutizeURI(base, href) { // RFC 3986
		function removeDotSegments(input) {
			var output = [];
			input.replace(/^(\.\.?(\/|$))+/, '')
				.replace(/\/(\.(\/|$))+/g, '/')
				.replace(/\/\.\.$/, '/../')
				.replace(/\/?[^\/]*/g, function(p) {
					if (p === '/..') {
						output.pop();
					}
					else {
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
	 * Tests a URL to see if it's on the same domain (local) or not
	 * @method isLocalRequest
	 * @param {URL to test} url
	 * @returns {bool} Whether the URL is local or not
	 * Derived from: https://github.com/jquery/jquery/blob/master/src/ajax.js
	 */
	function _isLocalRequest(url) {
		var rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
			urlLower = url.toLowerCase(),
			parts = rurl.exec(urlLower),
			ajaxLocation,
			ajaxLocParts;

		try {
			ajaxLocation = location.href;
		}
		catch (e) {
			// Use the href since IE will modify it given document.location
			ajaxLocation = document.createElement('a');
			ajaxLocation.href = '';
			ajaxLocation = ajaxLocation.href;
		}

		ajaxLocation = ajaxLocation.toLowerCase();

		// The url must be relative. Make it fully qualified and re-regex url
		if (!parts) {
			urlLower = _absolutizeURI(ajaxLocation, urlLower).toLowerCase();
			parts = rurl.exec(urlLower);
		}

		// Segment location into parts
		ajaxLocParts = rurl.exec(ajaxLocation) || [];

		// Do hostname, protocol, port of manifest URL match location.href?
		// (a "local" request on the same domain)
		var matched = !(parts &&
			(parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] ||
				(parts[3] || (parts[1] === 'http:' ? '80' : '443')) !==
				(ajaxLocParts[3] || (ajaxLocParts[1] === 'http:' ? '80' : '443'))));

		return matched;
	}

	function rand() {
		return Math.floor(Math.random() * 1000000);
	}

	// --------------------------------------------------------------------------
	// GET/POST
	// --------------------------------------------------------------------------

	Helpers.Ajax = {
		request: function(params, cache) {
			if (!params.url) {
				throw 'F2.Ajax: you must provide a url.';
			}

			params.crossOrigin = !_isLocalRequest(params.url);
			var isFile = (params.url.indexOf('.json') !== -1 || params.url.indexOf('.js') !== -1);

			// Determine the method if none was provided
			if (!params.method) {
				if (params.crossOrigin) {
					params.type = 'jsonp';
				}
				else if (isFile) {
					params.method = 'get';
				}
				else {
					params.method = 'post';
				}
			}

			if (!params.type) {
				params.type = 'json';
			}

			// Bust cache if asked
			if ((params.method === 'get' || params.type === 'jsonp') && !cache) {
				params.url += delim(params.url) + rand();
			}

			if (params.type === 'jsonp') {
				// Create a random callback name
				params.jsonpCallbackName = 'F2_' + rand();

				// Add a jsonp callback to the window
				window[params.jsonpCallbackName] = function(response) {
					if (params.success) {
						params.success(response);
					}

					if (params.complete) {
						params.complete();
					}

					// Pull the callback off the window
					delete window[params.jsonpCallbackName];
				};
			}

			// Kick off the request
			var req = reqwest(params);

			return {
				isAborted: false,
				abort: function() {
					this.isAborted = true;
					req.request.abort();
				}
			};
		}
	};

})(reqwest);

(function() {

	// Generate an AppConfig from the element's attributes
	function getPlaceholderFromElement(node) {
		var output;
		var appConfig;

		if (node) {
			var appId = node.getAttribute('data-f2-appid');
			var manifestUrl = node.getAttribute('data-f2-manifesturl');

			if (appId && manifestUrl) {
				appConfig = {
					appId: appId,
					manifestUrl: manifestUrl
				};

				// See if the user passed in a block of serialized json
				var contextJson = node.getAttribute('data-f2-context');

				if (contextJson) {
					try {
						appConfig.context = JSON.parse(contextJson);
					}
					catch (e) {
						console.warn('F2: "data-f2-context" of node is not valid JSON', '"' + e + '"');
					}
				}
			}
		}

		if (appConfig) {
			// See if this node has children
			// If it does, assume it has already been loaded
			var isPreload = hasNonTextChildNodes(node);

			output = {
				appConfig: appConfig,
				isPreload: isPreload,
				node: node
			};
		}

		return output;
	}

	function getElementsByAttribute(parent, attribute) {
		var elements = [];

		// Start with the first child if the parent isn't a placeholder itself
		if (!parent.getAttribute(attribute)) {
			parent = parent.firstChild;
		}

		(function walk(node) {
			while (node) {
				// Must be a non-text node and have the specified attribute
				if (node.nodeType === 1 && node.getAttribute(attribute)) {
					elements.push(node);
				}

				// Walk children
				if (node.hasChildNodes()) {
					walk(node.firstChild);
				}

				node = node.nextSibling;
			}
		})(parent);

		return elements;
	}

	function hasNonTextChildNodes(node) {
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
	}

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	Helpers.AppPlaceholders = {
		getInNode: function(parentNode) {
			var placeholders = [];
			var elements = getElementsByAttribute(parentNode, 'data-f2-appid');

			for (var i = 0, len = elements.length; i < len; i++) {
				var placeholder = getPlaceholderFromElement(elements[i]);

				if (placeholder) {
					placeholders.push(placeholder);
				}
			}

			return placeholders;
		}
	};

})();

(function() {

	// Track all the guids we've made on this page
	var _guids = {};

	// Reserve this for our "once per page" container token
	var trackedGuids = {};

	Helpers.Guid = {
		guid: function() {
			var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0;
				var v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});

			// Check if we've seen this one before
			if (_guids[guid]) {
				// Get a new guid
				guid = this.guid();
			}

			_guids[guid] = true;

			return guid;
		},
		isTrackedGuid: function(id) {
			return trackedGuids[id];
		},
		trackedGuid: function() {
			var guid = this.guid();
			trackedGuids[guid] = true;
			return guid;
		}
	};

})();

(function() {

	F2.prototype.Constants = {
		EVENTS: {
			// TODO: do we need this?
			APP_SYMBOL_CHANGE: '__appSymbolChange__',
			// TODO: do we need this?
			APP_WIDTH_CHANGE: '__appWidthChange__',
			// TODO: do we need this?
			CONTAINER_SYMBOL_CHANGE: '__containerSymbolChange__',
			// TODO: do we need this?
			CONTAINER_WIDTH_CHANGE: '__containerWidthChange__'
		},
		VIEWS: {
			ABOUT: 'about',
			DATA_ATTRIBUTE: 'data-f2-view',
			HELP: 'help',
			HOME: 'home',
			REMOVE: 'remove',
			SETTINGS: 'settings'
		}
	};

})();

/**
 * Schema validations
 * @class F2.Schemas
 */
(function(tv4, _) {
	'use strict';

	var ERRORS = {
		BAD_NAME: function() {
			return 'F2.Schemas: you must provide a string schema name.';
		},
		BAD_JSON: function() {
			return 'F2.Schemas: you must provide a schema.';
		},
		DUPE_SCHEMA: function(name) {
			return 'F2.Schemas: "' + name + '" is already a registered schema.';
		},
		NO_SCHEMA: function(name) {
			return 'F2.Schemas: "' + name + '" is not a registered schema.';
		}
	};

	F2.prototype.addSchema = function(name, json) {
		if (!_.isString(name)) {
			throw ERRORS.BAD_NAME();
		}

		if (Helpers.hasSchema(name)) {
			throw ERRORS.DUPE_SCHEMA(name);
		}

		if (!_.isObject(json)) {
			throw ERRORS.BAD_JSON();
		}

		tv4.addSchema(name, json);

		return true;
	};

	F2.prototype.hasSchema = Helpers.hasSchema = function(name) {
		if (!_.isString(name)) {
			throw ERRORS.BAD_NAME();
		}

		return !!tv4.getSchema(name);
	};

	F2.prototype.validate = Helpers.validate = function(json, name) {
		if (!_.isString(name)) {
			throw ERRORS.BAD_NAME();
		}

		if (!Helpers.hasSchema(name)) {
			throw ERRORS.NO_SCHEMA(name);
		}

		if (!_.isObject(json)) {
			throw ERRORS.BAD_JSON();
		}

		var schema = tv4.getSchema(name);

		return tv4.validate(json, schema);
	};

	// Hard code some predefined schemas
	var librarySchemas = {
		appConfig: {
			id: 'appConfig',
			title: 'App Config',
			type: 'object',
			properties: {
				appId: {
					type: 'string'
				},
				context: {
					type: 'object'
				},
				manifestUrl: {
					type: 'string'
				},
				enableBatchRequests: {
					type: 'boolean'
				},
				views: {
					type: 'array',
					items: {
						type: 'string'
					}
				}
			},
			required: ['appId']
		},
		appManifest: {
			id: 'appManifest',
			title: 'App Manifest',
			type: 'object',
			properties: {
				scripts: {
					type: 'array',
					items: {
						type: 'string'
					}
				},
				styles: {
					type: 'array',
					items: {
						type: 'string'
					}
				},
				inlineScripts: {
					type: 'array',
					items: {
						type: 'string'
					}
				},
				error: {
					type: 'object'
				},
				data: {
					type: 'object'
				},
				html: {
					type: 'string'
				}
			},
			required: ['scripts', 'styles', 'inlineScripts']
		},
		uiModalParams: {
			id: 'uiModalParams',
			title: 'F2.UI Modal Parameters',
			type: 'object',
			properties: {
				buttons: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							label: {
								type: 'string'
							},
							handler: {
								type: 'function'
							}
						},
						required: ['label', 'handler']
					}
				},
				content: {
					type: 'string'
				},
				onClose: {
					type: 'function'
				},
				title: {
					type: 'string'
				}
			}
		}
	};

	// Add each schema
	for (var name in librarySchemas) {
		tv4.addSchema(name, librarySchemas[name]);
	}

})(tv4, Helpers._);

(function(Ajax, _, Guid, LoadStaticFiles) {
	'use strict';

	var _loadedApps = {};
	var _loadingApps = {};
	var _loadListeners = {};

	var EMPTY_MANIFEST = {
		data: {},
		dependencies: {},
		html: '',
		inlineScripts: [],
		scripts: [],
		styles: []
	};

	// ---------------------------------------------------------------------------
	// Utils
	// ---------------------------------------------------------------------------

	// Find the instance of a loaded app by instance, root, or instanceId
	function _getLoadedApp(id) {
		var instance;

		// See if it's an instance id
		if (_loadedApps[id]) {
			instance = _loadedApps[id];
		}
		// Check if we were passed an instance
		else if (_loadedApps[id.instanceId]) {
			instance = _loadedApps[id.instanceId];
		}
		// See if it's an app root
		else if (_.isNode(id)) {
			for (var instanceId in _loadedApps) {
				if (_loadedApps[instanceId].root === id) {
					instance = _loadedApps[instanceId];
					break;
				}
			}
		}

		return instance;
	}

	// Group appConfigs into "async", "preloaded", and "broken"
	function _categorizeAppConfigs(appConfigs) {
		var async = [];
		var broken = [];
		var preloaded = [];

		for (var i = 0; i < appConfigs.length; i++) {
			var isValid = (Helpers.validate(appConfigs[i], 'appConfig'));
			var isPreloaded = (appConfigs[i].isPreload && _.isNode(appConfigs[i].root));
			var isAsync = (_.isString(appConfigs[i].manifestUrl));

			// Capture invalid configs
			if (!isValid || (!isPreloaded && !isAsync)) {
				broken.push({
					appConfig: appConfigs[i],
					error: 'Invalid app config',
					index: i
				});
			}
			else if (isPreloaded) {
				preloaded.push({
					appConfig: appConfigs[i],
					data: appConfigs[i].context || {},
					index: i,
					instanceId: Guid.guid(),
					root: appConfigs[i].root
				});
			}
			else if (isAsync) {
				async.push({
					appConfig: appConfigs[i],
					index: i,
					instanceId: Guid.guid(),
					isAborted: false,
					isFailed: false
				});
			}
		}

		return {
			async: async,
			broken: broken,
			preloaded: preloaded
		};
	}

	// Group an array of apps into an object keyed by manifestUrl
	function _groupAppsByUrl(apps) {
		var urls = {};

		for (var i = 0; i < apps.length; i++) {
			var config = apps[i].appConfig;

			if (!urls[config.manifestUrl]) {
				urls[config.manifestUrl] = {
					batch: [],
					singles: []
				};
			}

			if (config.enableBatchRequests) {
				urls[config.manifestUrl].batch.push(apps[i]);
			}
			else {
				urls[config.manifestUrl].singles.push(apps[i]);
			}
		}

		return urls;
	}

	function _requestAsyncApps(config, asyncApps, callback) {
		var requests = [];

		if (asyncApps.length) {
			var groupedApps = _groupAppsByUrl(asyncApps);
			var numRequests = 0;
			var allManifests = [];

			// Loop over each url
			for (var url in groupedApps) {
				var appsForUrl = groupedApps[url];
				// Combine the single/batch requests into one array
				// Unbatched apps will get a request to themselves and batched apps will
				// be put together.
				var requestsToMake = appsForUrl.singles.slice();

				if (appsForUrl.batch.length) {
					requestsToMake.push(appsForUrl.batch);
				}

				numRequests += requestsToMake.length;

				// Loop for each request
				requestsToMake.forEach(function(appsForRequest, i) {
					appsForRequest = [].concat(appsForRequest);
					var appConfigs = _.pluck(appsForRequest, 'appConfig');

					// Make the actual request to the remote server
					var xhr = _getManifestFromUrl(url, appConfigs, function(manifests) {
						manifests.forEach(function(manifest, i) {
							if (manifest.error) {
								// Track that every app in this request failed
								appsForRequest.forEach(function(app) {
									app.isFailed = true;
								});
							}
							else {
								// Make sure we have certain properties
								_.defaults({}, manifest, EMPTY_MANIFEST);

								manifest.appConfig = appConfigs[i];

								// Tack on the returned data
								appsForRequest[i].data = manifest.data;
								appsForRequest[i].html = manifest.html;
							}
						});

						allManifests = allManifests.concat(manifests);

						// See if we've completed the last request
						if (!--numRequests) {
							var parts = _getManifestParts(allManifests);

							// Put the manifest files on the page
							LoadStaticFiles.load(
								config,
								parts.styles,
								parts.scripts,
								parts.inlineScripts,
								parts.dependencies,
								function() {
									// Look for aborted requests
									requests.forEach(function(request) {
										if (request.xhr.isAborted) {
											request.apps.forEach(function(app) {
												app.isAborted = true;
											});
										}
									});

									callback();
								}
							);
						}
					});

					requests.push({
						apps: appsForRequest,
						xhr: xhr
					});
				});
			}
		}
		else {
			callback();
		}

		return requests;
	}

	function _isNonEmptyString(str) {
		return str && str.trim();
	}

	// Combine the baseurl and path to get a single unified path
	function _reconcilePaths(baseUrl, path) {
		if (!path || !path.trim()) {
			return null;
		}

		// See if the path is already fine
		if (path.indexOf('//') !== -1) {
			return path;
		}

		// Pull off the trailing action no matter what
		baseUrl = baseUrl.substr(0, baseUrl.lastIndexOf('/') + 1);

		// Create a regex that will match the current directory indicator (./)
		var thisDirectoryMatcher = new RegExp(/^(\.\/)+/i);
		var thisMatches = thisDirectoryMatcher.exec(path);

		if (thisMatches) {
			path = path.substr(2);
		}
		else {
			// Create a regex that will match parent directory traversal (../)
			var parentDirectoryMatcher = new RegExp(/^(\.\.\/)+/i);
			var parentMatches = parentDirectoryMatcher.exec(path);

			if (parentMatches && parentMatches.length) {
				for (var i = 0; i < parentMatches.length - 1; i++) {
					// Go "up" one directory on the base path
					var lastSlash = baseUrl.lastIndexOf('/');
					var secondLastSlash = baseUrl.lastIndexOf('/', lastSlash - 1);
					baseUrl = baseUrl.substr(0, secondLastSlash + 1);

					// Remove the leading "../"
					path = path.substr(3);
				}
			}
		}

		return baseUrl + path;
	}

	// Pick out scripts, styles, inlineScripts, and dependencies from each AppManifest
	function _getManifestParts(manifests) {
		var dependencies = [];
		var inlineScripts = [];
		var scripts = [];
		var styles = [];

		if (manifests.length) {
			// Pick out all the arrays
			for (var i = 0; i < manifests.length; i++) {
				if (!manifests[i].error) {
					if (_.isObject(manifests[i].dependencies)) {
						dependencies.push(manifests[i].dependencies);
					}

					if (_.isArray(manifests[i].inlineScripts) && manifests[i].inlineScripts.length) {
						inlineScripts.push(manifests[i].inlineScripts);
					}

					if (_.isArray(manifests[i].scripts) && manifests[i].scripts.length) {
						manifests[i].scripts = manifests[i].scripts.map(function(path) {
							return _reconcilePaths(manifests[i].appConfig.manifestUrl, path);
						});
						scripts.push(manifests[i].scripts);
					}

					if (_.isArray(manifests[i].styles) && manifests[i].styles.length) {
						manifests[i].styles = manifests[i].styles.map(function(path) {
							return _reconcilePaths(manifests[i].appConfig.manifestUrl, path);
						});
						styles.push(manifests[i].styles);
					}
				}
			}

			// Flatten
			dependencies = Array.prototype.concat.apply([], dependencies);
			inlineScripts = Array.prototype.concat.apply([], inlineScripts);
			scripts = Array.prototype.concat.apply([], scripts);
			styles = Array.prototype.concat.apply([], styles);

			// Dedupe
			inlineScripts = _.unique(inlineScripts);
			scripts = _.unique(scripts);
			styles = _.unique(styles);

			// Filter out invalid paths
			inlineScripts = inlineScripts.filter(_isNonEmptyString);
			scripts = scripts.filter(_isNonEmptyString);
			styles = styles.filter(_isNonEmptyString);
		}

		return {
			dependencies: dependencies,
			inlineScripts: inlineScripts,
			scripts: scripts,
			styles: styles
		};
	}

	function _getManifestFromUrl(url, appConfigs, callback) {
		var invalidManifest = {
			error: 'Invalid app manifest'
		};

		// Strip out any properties the server doesn't need
		var fixedConfigs = appConfigs.map(function(config) {
			var params = {
				appId: config.appId
			};

			if (_.isObject(config.context)) {
				params.context = config.context;
			}

			return params;
		});

		return Ajax.request({
			data: {
				params: JSON.stringify(fixedConfigs)
			},
			error: function() {
				callback([invalidManifest]);
			},
			success: function(manifests) {
				// Make sure the response is valid
				if (!manifests || !_.isArray(manifests)) {
					manifests = [manifests || {}];
				}

				// Make sure each manifest complies with the spec
				for (var i = 0; i < manifests.length; i++) {
					if (!manifests[i] || !Helpers.validate(manifests[i], 'appManifest')) {
						manifests[i] = invalidManifest;
					}
				}

				callback(manifests);
			},
			type: 'json',
			url: url
		});
	}

	function _initAppClasses(apps, callback) {
		if (apps.length) {
			var appIds = apps.map(function(app) {
				// Define a dummy app that will help the dev find missing classes
				define(app.appConfig.appId, [], function() {
					return function() {
						console.error(
							'F2: the app "' + app.appConfig.appId + '" was never defined and could not be loaded.',
							'Did you forget to include a script file?'
						);
					};
				});

				return app.appConfig.appId;
			});

			require(appIds, function() {
				var classes = Array.prototype.slice.call(arguments);

				// Load each AppClass
				apps.forEach(function(app, i) {
					try {
						// Track that we're loading this app right now
						// We need this because an app might try to register an event in
						// its constructor. When that happens we won't be able to check
						// that the "context" is a loaded app... cause it's loading
						_loadingApps[app.instanceId] = true;

						// Instantiate the app
						var instance = new classes[i](
							app.instanceId,
							app.appConfig,
							app.data,
							app.root
						);

						// Clear out the "loading" indicator
						delete _loadingApps[app.instanceId];

						if (!instance) {
							throw new Error();
						}

						// Add the new app to our internal map of loaded apps
						_loadedApps[app.instanceId] = {
							appConfig: app.appConfig,
							instance: instance,
							instanceId: app.instanceId,
							root: app.root
						};

						// Call any listeners for this app
						if (_loadListeners[app.instanceId]) {
							while (_loadListeners[app.instanceId].length) {
								_loadListeners[app.instanceId].shift()(instance);
							}
							delete _loadListeners[app.instanceId];
						}

						// Call "init" if one was provided
						if (instance.init) {
							instance.init();
						}
					}
					catch (e) {
						apps[i] = {
							error: e.toString()
						};
						console.error('F2: could not init', app.appConfig.appId, '"' + e.toString() + '"');
					}
				});

				callback();
			});
		}
		else {
			callback();
		}
	}

	// Whittle down the app's data into something we can pass to the container
	function _extractAppPropsForCallback(app) {
		var output = {
			appConfig: app.appConfig
		};

		if (app.isFailed) {
			output.error = 'App request failed';
		}
		else if (app.isAborted) {
			output.error = 'App request was aborted';
		}
		else {
			output.data = app.data || {};
			output.root = app.root;
			output.instanceId = app.instanceId;
		}

		return output;
	}

	// Test to see if the app failed in any way
	function _appDidSucceed(app) {
		return !app.error && !app.isAborted && !app.isFailed;
	}

	// Turn an app's "html" into a dom node
	function _createAppRoot(app) {
		if (app.appConfig.root) {
			app.root = app.appConfig.root;
			app.root.innerHTML = app.html || '';
		}
		else if (app.html && app.html.trim()) {
			var fakeParent = document.createElement('div');
			fakeParent.innerHTML = app.html;
			app.root = fakeParent.firstChild;
		}
	}

	function _dumpAppsToDom(apps, container) {
		var fragment = document.createDocumentFragment();

		apps.forEach(function(app) {
			if (!app.isFailed && !app.isAborted) {
				// Data apps won't need a root, so we still need to check for one
				if (app.root) {
					fragment.appendChild(app.root);
				}
			}
		});

		container.appendChild(fragment);
	}

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	Helpers.LoadApps = {
		isRealInstanceId: function(id) {
			return !!_loadingApps[id];
		},
		getLoadedApp: function(identifier) {
			if (!identifier) {
				return null;
			}

			return _getLoadedApp(identifier);
		},
		isLoadedApp: function(identifier) {
			return !!this.getLoadedApp(identifier);
		},
		addLoadListener: function(instanceId, callback) {
			if (!_loadListeners[instanceId]) {
				_loadListeners[instanceId] = [];
			}

			_loadListeners[instanceId].push(callback);
		},
		load: function(config, appConfigs, callback) {
			var apps = _categorizeAppConfigs(appConfigs);

			return _requestAsyncApps(config, apps.async, function() {
				var allApps = [].concat(apps.async, apps.preloaded, apps.broken);
				allApps.sort(function(a, b) {
					return a.index - b.index;
				});

				// Strip out the failed apps
				var appsToLoad = allApps.filter(_appDidSucceed);

				// Make sure async apps have valid roots
				if (apps.async.length) {
					apps.async.forEach(_createAppRoot);
				}

				// Instantiate the apps
				_initAppClasses(appsToLoad, function() {
					if (callback) {
						// Get the properties we want to expose to the container
						var outputs = allApps.map(_extractAppPropsForCallback);
						callback(outputs);
					}
					else {
						// Put apps on the page if the container doesn't handle it
						_dumpAppsToDom(apps.async, document.body);
					}
				});
			});
		},
		remove: function(instanceId) {
			delete _loadedApps[instanceId];
		}
	};

})(Helpers.Ajax, Helpers._, Helpers.Guid, Helpers.LoadStaticFiles);

/**
 * Handles context passing
 * @class F2.Events
 */
(function(_, LoadApps, Guid) {

	var _subs = {};

	function appMatchesPattern(app, filters) {
		for (var i = 0; i < filters.length; i++) {
			// See if it's a straight wildcard
			if (filters[i] === '*') {
				return true;
			}

			// Check exact instanceId or appId match
			if (app.instanceId === filters[i] || app.appConfig.appId === filters[i]) {
				return true;
			}

			// Pattern match
			var pattern = new RegExp(filters[i], 'gi');

			if (pattern.test(app.appConfig.appId)) {
				return true;
			}
		}

		return false;
	}

	// ---------------------------------------------------------------------------
	// Utils
	// ---------------------------------------------------------------------------

	function _send(name, args, filters) {
		if (!name || !_.isString(name)) {
			throw new TypeError('F2: ' +
				'You need to provide an event name to emit.'
			);
		}

		if (filters && _.isArray(filters) && !filters.every(_.isString)) {
			throw new TypeError('F2: ' +
				'Your "emit" filters must either be an AppId or an InstanceId.'
			);
		}

		if (_subs[name]) {
			for (var i = 0; i < _subs[name].length; i++) {
				var sub = _subs[name][i];

				if (!filters || appMatchesPattern(sub.instance, filters)) {
					sub.handler.apply(sub.instance, args);
				}

				// See if this is limited to a # of executions
				if (sub.timesLeft !== undefined && --sub.timesLeft === 0) {
					_subs[name].splice(i--, 1);
				}
			}

			// Clear out the list if there's no one left
			if (!_subs[name].length) {
				delete _subs[name];
			}
		}
	}

	function _subscribe(instance, name, handler, timesToListen) {
		var instanceIsBeingLoaded = (instance && LoadApps.isRealInstanceId(instance.instanceId));

		if (!instance) {
			throw new TypeError('F2: ' +
				'Your "instance" must be an app loaded via F2 or the container token.'
			);
		}
		else if (!instanceIsBeingLoaded) {
			var instanceIsApp = LoadApps.isLoadedApp(instance);
			var instanceIsToken = Guid.isTrackedGuid(instance);

			if (!instanceIsApp && !instanceIsToken) {
				throw new TypeError('F2: ' +
					'Your "instance" must be an app loaded via F2 or the container token.'
				);
			}
		}

		if (!name) {
			throw new TypeError('F2: ' +
				'You must provide the "name" of the event to which you\'re subscribing.'
			);
		}

		if (!handler) {
			throw new TypeError('F2: ' +
				'You must provide a "handler" that will fire when your event is triggered.'
			);
		}

		if (timesToListen !== undefined && isNaN(timesToListen) || timesToListen < 1) {
			throw new TypeError('F2: ' +
				'If passed, "timesToListen" must be a number greater than 0.'
			);
		}

		// Create the event if we haven't seen it
		if (!_subs[name]) {
			_subs[name] = [];
		}

		if (!instanceIsBeingLoaded) {
			_subs[name].push({
				handler: handler,
				instance: instance,
				timesLeft: timesToListen
			});
		}
		else {
			// Wait for LoadApps to tell us that this app has been loaded
			LoadApps.addLoadListener(instance.instanceId, function(instance) {
				_subscribe(instance, name, handler, timesToListen);
			});
		}
	}

	function _unsubscribe(instance, name, handler) {
		var handlerIsValid = (handler && _.isFunction(handler));
		var instanceIsValid = (instance && (LoadApps.isLoadedApp(instance) || Guid.isTrackedGuid(instance)));

		var _i, matchesInstance, matchesHandler, namedSubs;

		if (!handlerIsValid && !instanceIsValid) {
			throw new TypeError('F2: ' +
				'The "off" function requires an app instance, InstanceId, or the container token'
			);
		}

		if (name && !_.isString(name)) {
			throw new TypeError('F2: ' +
				'If passed, "name" must be a string.'
			);
		}

		// Create a local reference to reduce access time:
		// http://oreilly.com/server-administration/excerpts/even-faster-websites/writing-efficient-javascript.html
		namedSubs = _subs[name];
		if (name && namedSubs) {
			// Start from the end to reduce index unnecessary index shifting
			for (_i = namedSubs.length - 1; _i >= 0; --_i) {
				matchesInstance = namedSubs[_i].instance === instance;
				matchesHandler = namedSubs[_i].handler === handler;

				if (matchesInstance &&
					(!handlerIsValid) ||
					(handlerIsValid && matchesHandler)
				) {
					namedSubs.splice(_i, 1);
				}
				// Do some garbage collection, otherwise the
				// subs object only grows and lookups take forever
				if (namedSubs.length === 0) {
					delete _subs[name];
				}
			}
		}
		else {
			for (var event in _subs) {
				_unsubscribe(instance, event, handler);
			}
		}
	}

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	/**
	 *
	 * @method emit
	 * @param {String} name The event name
	 * @return void
	 */
	F2.prototype.emit = function(filters, name) {
		var args = Array.prototype.slice.call(arguments, 2);

		// If "filters" is a string then the user didn't actually pass any
		// "filters" will be "name" and "name" will be the first param to the handler
		if (_.isString(filters)) {
			// Reassign the params
			name = filters;
			// Provide a default filter set
			filters = ['*'];
			// Recalculate the N-args
			args = Array.prototype.slice.call(arguments, 1);
		}

		return _send(name, args, filters);
	};

	/**
	 *
	 * @method off
	 * @param {String} name The event name
	 * @param {Function} handler Function to handle the event
	 * @return void
	 */
	F2.prototype.off = function(instance, name, handler) {
		_unsubscribe(instance, name, handler);
	};

	/**
	 *
	 * @method on
	 * @param {String} name The event name
	 * @param {Function} handler Function to handle the event
	 * @return void
	 */
	F2.prototype.on = function(instance, name, handler, timesToListen) {
		_subscribe(instance, name, handler, timesToListen);
	};

})(Helpers._, Helpers.LoadApps, Helpers.Guid);

/**
 * F2 Core
 * @class F2
 */
(function(LoadApps, _, Guid, AppPlaceholders) {

	// Set up a default config
	var _config = {
		loadDependencies: null,
		loadInlineScripts: null,
		loadScripts: null,
		loadStyles: null,
		ui: {
			modal: null,
			toggleLoading: null
		}
	};

	function tokenKiller() {
		throw 'F2: onetime token has already been used.';
	}

	// --------------------------------------------------------------------------
	// API
	// --------------------------------------------------------------------------

	F2.prototype.config = function(config) {
		if (_.isObject(config)) {
			if (!config.loadDependencies || _.isFunction(config.loadDependencies)) {
				_config.loadDependencies = config.loadDependencies;
			}

			if (!config.loadInlineScripts || _.isFunction(config.loadInlineScripts)) {
				_config.loadInlineScripts = config.loadInlineScripts;
			}

			if (!config.loadScripts || _.isFunction(config.loadScripts)) {
				_config.loadScripts = config.loadScripts;
			}

			if (!config.loadStyles || _.isFunction(config.loadStyles)) {
				_config.loadStyles = config.loadStyles;
			}

			if (_.isObject(config.ui)) {
				if (!_config.ui) {
					_config.ui = {};
				}

				if (!config.ui.modal || _.isFunction(config.ui.modal)) {
					_config.ui.modal = config.ui.modal;
				}

				if (!config.ui.toggleLoading || _.isFunction(config.ui.toggleLoading)) {
					_config.ui.toggleLoading = config.ui.toggleLoading;
				}
			}
		}

		return _config;
	};

	/**
	 * Generates an RFC4122 v4 compliant id
	 * @method guid
	 * @return {string} A random id
	 * @for F2
	 * Derived from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript#answer-2117523
	 */
	F2.prototype.guid = function() {
		return Guid.guid();
	};

	F2.prototype.load = function(appConfigs, callback) {
		if (!_.isArray(appConfigs) || !appConfigs.length) {
			throw 'F2: no appConfigs passed to "load"';
		}

		if (!_.isFunction(callback)) {
			callback = noop;
		}

		// Kill the token if it hasn't been called
		// This should prevent apps from pretending to be the container
		if (this.onetimeToken !== tokenKiller) {
			this.onetimeToken();
		}

		// Request all the apps and get the xhr objects so we can abort
		var requests = LoadApps.load(this.config(), appConfigs, callback);

		return {
			abort: function() {
				for (var i = 0; i < this.requests.length; i++) {
					this.requests[i].xhr.abort();
				}
			},
			requests: requests || []
		};
	};

	F2.prototype.loadPlaceholders = function(parentNode, callback) {
		// Default to the body if no node was passed
		if (!parentNode || !_.isNode(parentNode)) {
			parentNode = document.body;
		}

		if (!callback || (!_.isFunction(callback))) {
			callback = noop;
		}

		// Find the placeholders on the DOM
		var placeholders = AppPlaceholders.getInNode(parentNode);

		if (placeholders.length) {
			var appConfigs = placeholders.map(function(placeholder) {
				placeholder.appConfig.isPreload = placeholder.isPreload;
				placeholder.appConfig.root = placeholder.node;
				return placeholder.appConfig;
			});

			this.load(appConfigs, function(manifests) {
				manifests.forEach(function(manifest, i) {
					if (!manifest.error && !placeholders[i].isPreload) {
						placeholders[i].node.parentNode.replaceChild(
							manifest.root,
							placeholders[i].node
						);
					}
				});

				callback(manifests);
			});
		}
		else {
			console.warn('F2: no placeholders were found inside', parentNode);
			callback([]);
		}
	};

	F2.prototype.new = function(params) {
		// Wrap up the output in a function to prevent prototype tampering
		return (function(params) {
			return new F2(params);
		})();
	};

	F2.prototype.onetimeToken = function() {
		this.onetimeToken = tokenKiller;

		return Guid.trackedGuid();
	};

	/**
	 * Removes an app from the container
	 * @method remove
	 * @param {string} indentifiers Array of app instanceIds or roots to be removed
	 */
	F2.prototype.unload = function(identifiers) {
		var args = Array.prototype.slice.apply(arguments);

		// See if multiple parameters were passed
		if (args.length > 1) {
			identifiers = args;
		}
		else {
			identifiers = [].concat(identifiers);
		}

		for (var i = 0; i < identifiers.length; i++) {
			var identifier = identifiers[i];

			if (!identifier) {
				throw 'F2: you must provide an instanceId, root, or app instance to remove an app';
			}

			// See if this an another reference to an existing app
			// If so, switch to that for a more reliable lookup
			if (identifier.instanceId) {
				identifier = identifier.instanceId;
			}

			// Try to find the app in our internal cache
			var loaded = LoadApps.getLoadedApp(identifier);

			if (loaded && loaded.instanceId) {
				// Call the app's dipose method if it has one
				if (loaded.instance.dispose) {
					loaded.instance.dispose();
				}

				// Automatically pull off events
				this.off(loaded.instance);

				// Remove ourselves from the DOM
				if (loaded.root && loaded.root.parentNode) {
					loaded.root.parentNode.removeChild(loaded.root);
				}

				// Remove ourselves from the internal map
				LoadApps.remove(loaded.instanceId);
			}
			else {
				console.warn('F2: could not find an app to remove');
			}
		}
	};

})(Helpers.LoadApps, Helpers._, Helpers.Guid, Helpers.AppPlaceholders);

/**
 *
 * @class F2.UI
 */
(function(_) {

	F2.prototype.UI = {
		modal: function(params) {
			var config = F2.prototype.config.call(this);

			if (config.ui && _.isFunction(config.ui.modal)) {
				if (_.isObject(params) && F2.prototype.validate.call(this, params, 'uiModalParams')) {
					config.ui.modal(params);
				}
				else {
					console.error('F2.UI: The parameters to ui.modal are incorrect.');
				}
			}
			else {
				console.error('F2.UI: The container has not defined ui.modal.');
			}
		},
		toggleLoading: function(root) {
			var config = F2.prototype.config.call(this);

			if (config.ui && _.isFunction(config.ui.toggleLoading)) {
				if (!root || (root && root.nodeType === 1)) {
					config.ui.toggleLoading(root);
				}
				else {
					console.error('F2.UI: the root passed was not a native DOM node.');
				}
			}
			else {
				console.error('F2.UI: The container has not defined ui.toggleLoading.');
			}
		}
	};

})(Helpers._);

define('F2.AppClass', ['F2'], function(F2) {

	var AppClass = function(instanceId, appConfig, context, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.context = context;
		this.root = root;
	};

	AppClass.prototype = {
		dispose: function() {},
		events: {
			many: function(name, timesToListen, handler) {
				return F2.Events.many(name, timesToListen, handler, this);
			},
			off: function(name, handler) {
				return F2.off(name, handler, this);
			},
			on: function(name, handler) {
				return F2.on(name, handler, this);
			},
			once: function(name, handler) {
				return F2.once(name, handler, this);
			}
		},
		reload: function(context) {
			var self = this;
			_.extend(this.appConfig.context, context);

			// Reload this app using the existing appConfig
			F2.load(this.appConfig).then(function(app) {
				app.root = self.root;
				F2.unload(self.instanceId);
			});
		}
	};

	return AppClass;

});

	// Make the F2 singleton module
	define('F2', [], function() {
		return new F2();
	});

})(window, document);
