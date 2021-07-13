/*!
 * 
 * F2 v2.0.0-alpha 7/13/21
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
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["F2"] = factory();
	else
		root["F2"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 137:
/***/ ((module) => {


/**
 * Expose `parse`.
 */

module.exports = parse;

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
  if ('string' != typeof html) throw new TypeError('String expected');

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
  var wrap = Object.prototype.hasOwnProperty.call(map, tag) ? map[tag] : map._default;
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


/***/ }),

/***/ 387:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
;!function(undefined) {
  var hasOwnProperty= Object.hasOwnProperty;
  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;
  var nextTickSupported= typeof process=='object' && typeof process.nextTick=='function';
  var symbolsSupported= typeof Symbol==='function';
  var reflectSupported= typeof Reflect === 'object';
  var setImmediateSupported= typeof setImmediate === 'function';
  var _setImmediate= setImmediateSupported ? setImmediate : setTimeout;
  var ownKeys= symbolsSupported? (reflectSupported && typeof Reflect.ownKeys==='function'? Reflect.ownKeys : function(obj){
    var arr= Object.getOwnPropertyNames(obj);
    arr.push.apply(arr, Object.getOwnPropertySymbols(obj));
    return arr;
  }) : Object.keys;

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

      if(conf.maxListeners!==undefined){
          this._maxListeners= conf.maxListeners;
      }

      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this._newListener = conf.newListener);
      conf.removeListener && (this._removeListener = conf.removeListener);
      conf.verboseMemoryLeak && (this.verboseMemoryLeak = conf.verboseMemoryLeak);
      conf.ignoreErrors && (this.ignoreErrors = conf.ignoreErrors);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    }
  }

  function logPossibleMemoryLeak(count, eventName) {
    var errorMsg = '(node) warning: possible EventEmitter memory ' +
        'leak detected. ' + count + ' listeners added. ' +
        'Use emitter.setMaxListeners() to increase limit.';

    if(this.verboseMemoryLeak){
      errorMsg += ' Event name: ' + eventName + '.';
    }

    if(typeof process !== 'undefined' && process.emitWarning){
      var e = new Error(errorMsg);
      e.name = 'MaxListenersExceededWarning';
      e.emitter = this;
      e.count = count;
      process.emitWarning(e);
    } else {
      console.error(errorMsg);

      if (console.trace){
        console.trace();
      }
    }
  }

  var toArray = function (a, b, c) {
    var n = arguments.length;
    switch (n) {
      case 0:
        return [];
      case 1:
        return [a];
      case 2:
        return [a, b];
      case 3:
        return [a, b, c];
      default:
        var arr = new Array(n);
        while (n--) {
          arr[n] = arguments[n];
        }
        return arr;
    }
  };

  function toObject(keys, values) {
    var obj = {};
    var key;
    var len = keys.length;
    var valuesCount = values ? value.length : 0;
    for (var i = 0; i < len; i++) {
      key = keys[i];
      obj[key] = i < valuesCount ? values[i] : undefined;
    }
    return obj;
  }

  function TargetObserver(emitter, target, options) {
    this._emitter = emitter;
    this._target = target;
    this._listeners = {};
    this._listenersCount = 0;

    var on, off;

    if (options.on || options.off) {
      on = options.on;
      off = options.off;
    }

    if (target.addEventListener) {
      on = target.addEventListener;
      off = target.removeEventListener;
    } else if (target.addListener) {
      on = target.addListener;
      off = target.removeListener;
    } else if (target.on) {
      on = target.on;
      off = target.off;
    }

    if (!on && !off) {
      throw Error('target does not implement any known event API');
    }

    if (typeof on !== 'function') {
      throw TypeError('on method must be a function');
    }

    if (typeof off !== 'function') {
      throw TypeError('off method must be a function');
    }

    this._on = on;
    this._off = off;

    var _observers= emitter._observers;
    if(_observers){
      _observers.push(this);
    }else{
      emitter._observers= [this];
    }
  }

  Object.assign(TargetObserver.prototype, {
    subscribe: function(event, localEvent, reducer){
      var observer= this;
      var target= this._target;
      var emitter= this._emitter;
      var listeners= this._listeners;
      var handler= function(){
        var args= toArray.apply(null, arguments);
        var eventObj= {
          data: args,
          name: localEvent,
          original: event
        };
        if(reducer){
          var result= reducer.call(target, eventObj);
          if(result!==false){
            emitter.emit.apply(emitter, [eventObj.name].concat(args))
          }
          return;
        }
        emitter.emit.apply(emitter, [localEvent].concat(args));
      };


      if(listeners[event]){
        throw Error('Event \'' + event + '\' is already listening');
      }

      this._listenersCount++;

      if(emitter._newListener && emitter._removeListener && !observer._onNewListener){

        this._onNewListener = function (_event) {
          if (_event === localEvent && listeners[event] === null) {
            listeners[event] = handler;
            observer._on.call(target, event, handler);
          }
        };

        emitter.on('newListener', this._onNewListener);

        this._onRemoveListener= function(_event){
          if(_event === localEvent && !emitter.hasListeners(_event) && listeners[event]){
            listeners[event]= null;
            observer._off.call(target, event, handler);
          }
        };

        listeners[event]= null;

        emitter.on('removeListener', this._onRemoveListener);
      }else{
        listeners[event]= handler;
        observer._on.call(target, event, handler);
      }
    },

    unsubscribe: function(event){
      var observer= this;
      var listeners= this._listeners;
      var emitter= this._emitter;
      var handler;
      var events;
      var off= this._off;
      var target= this._target;
      var i;

      if(event && typeof event!=='string'){
        throw TypeError('event must be a string');
      }

      function clearRefs(){
        if(observer._onNewListener){
          emitter.off('newListener', observer._onNewListener);
          emitter.off('removeListener', observer._onRemoveListener);
          observer._onNewListener= null;
          observer._onRemoveListener= null;
        }
        var index= findTargetIndex.call(emitter, observer);
        emitter._observers.splice(index, 1);
      }

      if(event){
        handler= listeners[event];
        if(!handler) return;
        off.call(target, event, handler);
        delete listeners[event];
        if(!--this._listenersCount){
          clearRefs();
        }
      }else{
        events= ownKeys(listeners);
        i= events.length;
        while(i-->0){
          event= events[i];
          off.call(target, event, listeners[event]);
        }
        this._listeners= {};
        this._listenersCount= 0;
        clearRefs();
      }
    }
  });

  function resolveOptions(options, schema, reducers, allowUnknown) {
    var computedOptions = Object.assign({}, schema);

    if (!options) return computedOptions;

    if (typeof options !== 'object') {
      throw TypeError('options must be an object')
    }

    var keys = Object.keys(options);
    var length = keys.length;
    var option, value;
    var reducer;

    function reject(reason) {
      throw Error('Invalid "' + option + '" option value' + (reason ? '. Reason: ' + reason : ''))
    }

    for (var i = 0; i < length; i++) {
      option = keys[i];
      if (!allowUnknown && !hasOwnProperty.call(schema, option)) {
        throw Error('Unknown "' + option + '" option');
      }
      value = options[option];
      if (value !== undefined) {
        reducer = reducers[option];
        computedOptions[option] = reducer ? reducer(value, reject) : value;
      }
    }
    return computedOptions;
  }

  function constructorReducer(value, reject) {
    if (typeof value !== 'function' || !value.hasOwnProperty('prototype')) {
      reject('value must be a constructor');
    }
    return value;
  }

  function makeTypeReducer(types) {
    var message= 'value must be type of ' + types.join('|');
    var len= types.length;
    var firstType= types[0];
    var secondType= types[1];

    if (len === 1) {
      return function (v, reject) {
        if (typeof v === firstType) {
          return v;
        }
        reject(message);
      }
    }

    if (len === 2) {
      return function (v, reject) {
        var kind= typeof v;
        if (kind === firstType || kind === secondType) return v;
        reject(message);
      }
    }

    return function (v, reject) {
      var kind = typeof v;
      var i = len;
      while (i-- > 0) {
        if (kind === types[i]) return v;
      }
      reject(message);
    }
  }

  var functionReducer= makeTypeReducer(['function']);

  var objectFunctionReducer= makeTypeReducer(['object', 'function']);

  function makeCancelablePromise(Promise, executor, options) {
    var isCancelable;
    var callbacks;
    var timer= 0;
    var subscriptionClosed;

    var promise = new Promise(function (resolve, reject, onCancel) {
      options= resolveOptions(options, {
        timeout: 0,
        overload: false
      }, {
        timeout: function(value, reject){
          value*= 1;
          if (typeof value !== 'number' || value < 0 || !Number.isFinite(value)) {
            reject('timeout must be a positive number');
          }
          return value;
        }
      });

      isCancelable = !options.overload && typeof Promise.prototype.cancel === 'function' && typeof onCancel === 'function';

      function cleanup() {
        if (callbacks) {
          callbacks = null;
        }
        if (timer) {
          clearTimeout(timer);
          timer = 0;
        }
      }

      var _resolve= function(value){
        cleanup();
        resolve(value);
      };

      var _reject= function(err){
        cleanup();
        reject(err);
      };

      if (isCancelable) {
        executor(_resolve, _reject, onCancel);
      } else {
        callbacks = [function(reason){
          _reject(reason || Error('canceled'));
        }];
        executor(_resolve, _reject, function (cb) {
          if (subscriptionClosed) {
            throw Error('Unable to subscribe on cancel event asynchronously')
          }
          if (typeof cb !== 'function') {
            throw TypeError('onCancel callback must be a function');
          }
          callbacks.push(cb);
        });
        subscriptionClosed= true;
      }

      if (options.timeout > 0) {
        timer= setTimeout(function(){
          var reason= Error('timeout');
          reason.code = 'ETIMEDOUT'
          timer= 0;
          promise.cancel(reason);
          reject(reason);
        }, options.timeout);
      }
    });

    if (!isCancelable) {
      promise.cancel = function (reason) {
        if (!callbacks) {
          return;
        }
        var length = callbacks.length;
        for (var i = 1; i < length; i++) {
          callbacks[i](reason);
        }
        // internal callback to reject the promise
        callbacks[0](reason);
        callbacks = null;
      };
    }

    return promise;
  }

  function findTargetIndex(observer) {
    var observers = this._observers;
    if(!observers){
      return -1;
    }
    var len = observers.length;
    for (var i = 0; i < len; i++) {
      if (observers[i]._target === observer) return i;
    }
    return -1;
  }

  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i, typeLength) {
    if (!tree) {
      return null;
    }

    if (i === 0) {
      var kind = typeof type;
      if (kind === 'string') {
        var ns, n, l = 0, j = 0, delimiter = this.delimiter, dl = delimiter.length;
        if ((n = type.indexOf(delimiter)) !== -1) {
          ns = new Array(5);
          do {
            ns[l++] = type.slice(j, n);
            j = n + dl;
          } while ((n = type.indexOf(delimiter, j)) !== -1);

          ns[l++] = type.slice(j);
          type = ns;
          typeLength = l;
        } else {
          type = [type];
          typeLength = 1;
        }
      } else if (kind === 'object') {
        typeLength = type.length;
      } else {
        type = [type];
        typeLength = 1;
      }
    }

    var listeners= null, branch, xTree, xxTree, isolatedBranch, endReached, currentType = type[i],
        nextType = type[i + 1], branches, _listeners;

    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        handlers && handlers.push.apply(handlers, tree._listeners);
        return [tree];
      }
    }

    if (currentType === '*') {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      branches= ownKeys(tree);
      n= branches.length;
      while(n-->0){
        branch= branches[n];
        if (branch !== '_listeners') {
          _listeners = searchListenerTree(handlers, type, tree[branch], i + 1, typeLength);
          if(_listeners){
            if(listeners){
              listeners.push.apply(listeners, _listeners);
            }else{
              listeners = _listeners;
            }
          }
        }
      }
      return listeners;
    } else if (currentType === '**') {
      endReached = (i + 1 === typeLength || (i + 2 === typeLength && nextType === '*'));
      if (endReached && tree._listeners) {
        // The next element has a _listeners, add it to the handlers.
        listeners = searchListenerTree(handlers, type, tree, typeLength, typeLength);
      }

      branches= ownKeys(tree);
      n= branches.length;
      while(n-->0){
        branch= branches[n];
        if (branch !== '_listeners') {
          if (branch === '*' || branch === '**') {
            if (tree[branch]._listeners && !endReached) {
              _listeners = searchListenerTree(handlers, type, tree[branch], typeLength, typeLength);
              if(_listeners){
                if(listeners){
                  listeners.push.apply(listeners, _listeners);
                }else{
                  listeners = _listeners;
                }
              }
            }
            _listeners = searchListenerTree(handlers, type, tree[branch], i, typeLength);
          } else if (branch === nextType) {
            _listeners = searchListenerTree(handlers, type, tree[branch], i + 2, typeLength);
          } else {
            // No match on this one, shift into the tree but not in the type array.
            _listeners = searchListenerTree(handlers, type, tree[branch], i, typeLength);
          }
          if(_listeners){
            if(listeners){
              listeners.push.apply(listeners, _listeners);
            }else{
              listeners = _listeners;
            }
          }
        }
      }
      return listeners;
    }else if (tree[currentType]) {
      listeners= searchListenerTree(handlers, type, tree[currentType], i + 1, typeLength);
    }

      xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i + 1, typeLength);
    }

    xxTree = tree['**'];
    if (xxTree) {
      if (i < typeLength) {
        if (xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength, typeLength);
        }

        // Build arrays of matching next branches and others.
        branches= ownKeys(xxTree);
        n= branches.length;
        while(n-->0){
          branch= branches[n];
          if (branch !== '_listeners') {
            if (branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i + 2, typeLength);
            } else if (branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i + 1, typeLength);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, {'**': isolatedBranch}, i + 1, typeLength);
            }
          }
        }
      } else if (xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength, typeLength);
      } else if (xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength, typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener, prepend) {
    var len = 0, j = 0, i, delimiter = this.delimiter, dl= delimiter.length, ns;

    if(typeof type==='string') {
      if ((i = type.indexOf(delimiter)) !== -1) {
        ns = new Array(5);
        do {
          ns[len++] = type.slice(j, i);
          j = i + dl;
        } while ((i = type.indexOf(delimiter, j)) !== -1);

        ns[len++] = type.slice(j);
      }else{
        ns= [type];
        len= 1;
      }
    }else{
      ns= type;
      len= type.length;
    }

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    if (len > 1) {
      for (i = 0; i + 1 < len; i++) {
        if (ns[i] === '**' && ns[i + 1] === '**') {
          return;
        }
      }
    }



    var tree = this.listenerTree, name;

    for (i = 0; i < len; i++) {
      name = ns[i];

      tree = tree[name] || (tree[name] = {});

      if (i === len - 1) {
        if (!tree._listeners) {
          tree._listeners = listener;
        } else {
          if (typeof tree._listeners === 'function') {
            tree._listeners = [tree._listeners];
          }

          if (prepend) {
            tree._listeners.unshift(listener);
          } else {
            tree._listeners.push(listener);
          }

          if (
              !tree._listeners.warned &&
              this._maxListeners > 0 &&
              tree._listeners.length > this._maxListeners
          ) {
            tree._listeners.warned = true;
            logPossibleMemoryLeak.call(this, tree._listeners.length, name);
          }
        }
        return true;
      }
    }

    return true;
  }

  function collectTreeEvents(tree, events, root, asArray){
     var branches= ownKeys(tree);
     var i= branches.length;
     var branch, branchName, path;
     var hasListeners= tree['_listeners'];
     var isArrayPath;

     while(i-->0){
         branchName= branches[i];

         branch= tree[branchName];

         if(branchName==='_listeners'){
             path= root;
         }else {
             path = root ? root.concat(branchName) : [branchName];
         }

         isArrayPath= asArray || typeof branchName==='symbol';

         hasListeners && events.push(isArrayPath? path : path.join(this.delimiter));

         if(typeof branch==='object'){
             collectTreeEvents.call(this, branch, events, path, isArrayPath);
         }
     }

     return events;
  }

  function recursivelyGarbageCollect(root) {
    var keys = ownKeys(root);
    var i= keys.length;
    var obj, key, flag;
    while(i-->0){
      key = keys[i];
      obj = root[key];

      if(obj){
          flag= true;
          if(key !== '_listeners' && !recursivelyGarbageCollect(obj)){
             delete root[key];
          }
      }
    }

    return flag;
  }

  function Listener(emitter, event, listener){
    this.emitter= emitter;
    this.event= event;
    this.listener= listener;
  }

  Listener.prototype.off= function(){
    this.emitter.off(this.event, this.listener);
    return this;
  };

  function setupListener(event, listener, options){
      if (options === true) {
        promisify = true;
      } else if (options === false) {
        async = true;
      } else {
        if (!options || typeof options !== 'object') {
          throw TypeError('options should be an object or true');
        }
        var async = options.async;
        var promisify = options.promisify;
        var nextTick = options.nextTick;
        var objectify = options.objectify;
      }

      if (async || nextTick || promisify) {
        var _listener = listener;
        var _origin = listener._origin || listener;

        if (nextTick && !nextTickSupported) {
          throw Error('process.nextTick is not supported');
        }

        if (promisify === undefined) {
          promisify = listener.constructor.name === 'AsyncFunction';
        }

        listener = function () {
          var args = arguments;
          var context = this;
          var event = this.event;

          return promisify ? (nextTick ? Promise.resolve() : new Promise(function (resolve) {
            _setImmediate(resolve);
          }).then(function () {
            context.event = event;
            return _listener.apply(context, args)
          })) : (nextTick ? process.nextTick : _setImmediate)(function () {
            context.event = event;
            _listener.apply(context, args)
          });
        };

        listener._async = true;
        listener._origin = _origin;
      }

    return [listener, objectify? new Listener(this, event, listener): this];
  }

  function EventEmitter(conf) {
    this._events = {};
    this._newListener = false;
    this._removeListener = false;
    this.verboseMemoryLeak = false;
    configure.call(this, conf);
  }

  EventEmitter.EventEmitter2 = EventEmitter; // backwards compatibility for exporting EventEmitter property

  EventEmitter.prototype.listenTo= function(target, events, options){
    if(typeof target!=='object'){
      throw TypeError('target musts be an object');
    }

    var emitter= this;

    options = resolveOptions(options, {
      on: undefined,
      off: undefined,
      reducers: undefined
    }, {
      on: functionReducer,
      off: functionReducer,
      reducers: objectFunctionReducer
    });

    function listen(events){
      if(typeof events!=='object'){
        throw TypeError('events must be an object');
      }

      var reducers= options.reducers;
      var index= findTargetIndex.call(emitter, target);
      var observer;

      if(index===-1){
        observer= new TargetObserver(emitter, target, options);
      }else{
        observer= emitter._observers[index];
      }

      var keys= ownKeys(events);
      var len= keys.length;
      var event;
      var isSingleReducer= typeof reducers==='function';

      for(var i=0; i<len; i++){
        event= keys[i];
        observer.subscribe(
            event,
            events[event] || event,
            isSingleReducer ? reducers : reducers && reducers[event]
        );
      }
    }

    isArray(events)?
        listen(toObject(events)) :
        (typeof events==='string'? listen(toObject(events.split(/\s+/))): listen(events));

    return this;
  };

  EventEmitter.prototype.stopListeningTo = function (target, event) {
    var observers = this._observers;

    if(!observers){
      return false;
    }

    var i = observers.length;
    var observer;
    var matched= false;

    if(target && typeof target!=='object'){
      throw TypeError('target should be an object');
    }

    while (i-- > 0) {
      observer = observers[i];
      if (!target || observer._target === target) {
        observer.unsubscribe(event);
        matched= true;
      }
    }

    return matched;
  };

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    if (n !== undefined) {
      this._maxListeners = n;
      if (!this._conf) this._conf = {};
      this._conf.maxListeners = n;
    }
  };

  EventEmitter.prototype.getMaxListeners = function() {
    return this._maxListeners;
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function(event, fn, options) {
    return this._once(event, fn, false, options);
  };

  EventEmitter.prototype.prependOnceListener = function(event, fn, options) {
    return this._once(event, fn, true, options);
  };

  EventEmitter.prototype._once = function(event, fn, prepend, options) {
    return this._many(event, 1, fn, prepend, options);
  };

  EventEmitter.prototype.many = function(event, ttl, fn, options) {
    return this._many(event, ttl, fn, false, options);
  };

  EventEmitter.prototype.prependMany = function(event, ttl, fn, options) {
    return this._many(event, ttl, fn, true, options);
  };

  EventEmitter.prototype._many = function(event, ttl, fn, prepend, options) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      return fn.apply(this, arguments);
    }

    listener._origin = fn;

    return this._on(event, listener, prepend, options);
  };

  EventEmitter.prototype.emit = function() {
    if (!this._events && !this._all) {
      return false;
    }

    this._events || init.call(this);

    var type = arguments[0], ns, wildcard= this.wildcard;
    var args,l,i,j, containsSymbol;

    if (type === 'newListener' && !this._newListener) {
      if (!this._events.newListener) {
        return false;
      }
    }

    if (wildcard) {
      ns= type;
      if(type!=='newListener' && type!=='removeListener'){
        if (typeof type === 'object') {
          l = type.length;
          if (symbolsSupported) {
            for (i = 0; i < l; i++) {
              if (typeof type[i] === 'symbol') {
                containsSymbol = true;
                break;
              }
            }
          }
          if (!containsSymbol) {
            type = type.join(this.delimiter);
          }
        }
      }
    }

    var al = arguments.length;
    var handler;

    if (this._all && this._all.length) {
      handler = this._all.slice();

      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this, type);
          break;
        case 2:
          handler[i].call(this, type, arguments[1]);
          break;
        case 3:
          handler[i].call(this, type, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, arguments);
        }
      }
    }

    if (wildcard) {
      handler = [];
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0, l);
    } else {
      handler = this._events[type];
      if (typeof handler === 'function') {
        this.event = type;
        switch (al) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          args = new Array(al - 1);
          for (j = 1; j < al; j++) args[j - 1] = arguments[j];
          handler.apply(this, args);
        }
        return true;
      } else if (handler) {
        // need to make copy of handlers because list can change in the middle
        // of emit call
        handler = handler.slice();
      }
    }

    if (handler && handler.length) {
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this);
          break;
        case 2:
          handler[i].call(this, arguments[1]);
          break;
        case 3:
          handler[i].call(this, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
      return true;
    } else if (!this.ignoreErrors && !this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
    }

    return !!this._all;
  };

  EventEmitter.prototype.emitAsync = function() {
    if (!this._events && !this._all) {
      return false;
    }

    this._events || init.call(this);

    var type = arguments[0], wildcard= this.wildcard, ns, containsSymbol;
    var args,l,i,j;

    if (type === 'newListener' && !this._newListener) {
        if (!this._events.newListener) { return Promise.resolve([false]); }
    }

    if (wildcard) {
      ns= type;
      if(type!=='newListener' && type!=='removeListener'){
        if (typeof type === 'object') {
          l = type.length;
          if (symbolsSupported) {
            for (i = 0; i < l; i++) {
              if (typeof type[i] === 'symbol') {
                containsSymbol = true;
                break;
              }
            }
          }
          if (!containsSymbol) {
            type = type.join(this.delimiter);
          }
        }
      }
    }

    var promises= [];

    var al = arguments.length;
    var handler;

    if (this._all) {
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(this._all[i].call(this, type));
          break;
        case 2:
          promises.push(this._all[i].call(this, type, arguments[1]));
          break;
        case 3:
          promises.push(this._all[i].call(this, type, arguments[1], arguments[2]));
          break;
        default:
          promises.push(this._all[i].apply(this, arguments));
        }
      }
    }

    if (wildcard) {
      handler = [];
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      switch (al) {
      case 1:
        promises.push(handler.call(this));
        break;
      case 2:
        promises.push(handler.call(this, arguments[1]));
        break;
      case 3:
        promises.push(handler.call(this, arguments[1], arguments[2]));
        break;
      default:
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
        promises.push(handler.apply(this, args));
      }
    } else if (handler && handler.length) {
      handler = handler.slice();
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(handler[i].call(this));
          break;
        case 2:
          promises.push(handler[i].call(this, arguments[1]));
          break;
        case 3:
          promises.push(handler[i].call(this, arguments[1], arguments[2]));
          break;
        default:
          promises.push(handler[i].apply(this, args));
        }
      }
    } else if (!this.ignoreErrors && !this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        return Promise.reject(arguments[1]); // Unhandled 'error' event
      } else {
        return Promise.reject("Uncaught, unspecified 'error' event.");
      }
    }

    return Promise.all(promises);
  };

  EventEmitter.prototype.on = function(type, listener, options) {
    return this._on(type, listener, false, options);
  };

  EventEmitter.prototype.prependListener = function(type, listener, options) {
    return this._on(type, listener, true, options);
  };

  EventEmitter.prototype.onAny = function(fn) {
    return this._onAny(fn, false);
  };

  EventEmitter.prototype.prependAny = function(fn) {
    return this._onAny(fn, true);
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype._onAny = function(fn, prepend){
    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if (!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    if(prepend){
      this._all.unshift(fn);
    }else{
      this._all.push(fn);
    }

    return this;
  };

  EventEmitter.prototype._on = function(type, listener, prepend, options) {
    if (typeof type === 'function') {
      this._onAny(type, listener);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    var returnValue= this, temp;

    if (options !== undefined) {
      temp = setupListener.call(this, type, listener, options);
      listener = temp[0];
      returnValue = temp[1];
    }

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    if (this._newListener) {
      this.emit('newListener', type, listener);
    }

    if (this.wildcard) {
      growListenerTree.call(this, type, listener, prepend);
      return returnValue;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    } else {
      if (typeof this._events[type] === 'function') {
        // Change to array.
        this._events[type] = [this._events[type]];
      }

      // If we've already got an array, just add
      if(prepend){
        this._events[type].unshift(listener);
      }else{
        this._events[type].push(listener);
      }

      // Check for listener leak
      if (
        !this._events[type].warned &&
        this._maxListeners > 0 &&
        this._events[type].length > this._maxListeners
      ) {
        this._events[type].warned = true;
        logPossibleMemoryLeak.call(this, this._events[type].length, type);
      }
    }

    return returnValue;
  };

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
      if(!leafs) return this;
    } else {
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
        if (this._removeListener)
          this.emit("removeListener", type, listener);

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
        if (this._removeListener)
          this.emit("removeListener", type, listener);
      }
    }

    this.listenerTree && recursivelyGarbageCollect(this.listenerTree);

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          if (this._removeListener)
            this.emit("removeListenerAny", fn);
          return this;
        }
      }
    } else {
      fns = this._all;
      if (this._removeListener) {
        for(i = 0, l = fns.length; i < l; i++)
          this.emit("removeListenerAny", fns[i]);
      }
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function (type) {
    if (type === undefined) {
      !this._events || init.call(this);
      return this;
    }

    if (this.wildcard) {
      var leafs = searchListenerTree.call(this, null, type, this.listenerTree, 0), leaf, i;
      if (!leafs) return this;
      for (i = 0; i < leafs.length; i++) {
        leaf = leafs[i];
        leaf._listeners = null;
      }
      this.listenerTree && recursivelyGarbageCollect(this.listenerTree);
    } else if (this._events) {
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function (type) {
    var _events = this._events;
    var keys, listeners, allListeners;
    var i;
    var listenerTree;

    if (type === undefined) {
      if (this.wildcard) {
        throw Error('event name required for wildcard emitter');
      }

      if (!_events) {
        return [];
      }

      keys = ownKeys(_events);
      i = keys.length;
      allListeners = [];
      while (i-- > 0) {
        listeners = _events[keys[i]];
        if (typeof listeners === 'function') {
          allListeners.push(listeners);
        } else {
          allListeners.push.apply(allListeners, listeners);
        }
      }
      return allListeners;
    } else {
      if (this.wildcard) {
        listenerTree= this.listenerTree;
        if(!listenerTree) return [];
        var handlers = [];
        var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
        searchListenerTree.call(this, handlers, ns, listenerTree, 0);
        return handlers;
      }

      if (!_events) {
        return [];
      }

      listeners = _events[type];

      if (!listeners) {
        return [];
      }
      return typeof listeners === 'function' ? [listeners] : listeners;
    }
  };

  EventEmitter.prototype.eventNames = function(nsAsArray){
    var _events= this._events;
    return this.wildcard? collectTreeEvents.call(this, this.listenerTree, [], null, nsAsArray) : (_events? ownKeys(_events) : []);
  };

  EventEmitter.prototype.listenerCount = function(type) {
    return this.listeners(type).length;
  };

  EventEmitter.prototype.hasListeners = function (type) {
    if (this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers.length > 0;
    }

    var _events = this._events;
    var _all = this._all;

    return !!(_all && _all.length || _events && (type === undefined ? ownKeys(_events).length : _events[type]));
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  EventEmitter.prototype.waitFor = function (event, options) {
    var self = this;
    var type = typeof options;
    if (type === 'number') {
      options = {timeout: options};
    } else if (type === 'function') {
      options = {filter: options};
    }

    options= resolveOptions(options, {
      timeout: 0,
      filter: undefined,
      handleError: false,
      Promise: Promise,
      overload: false
    }, {
      filter: functionReducer,
      Promise: constructorReducer
    });

    return makeCancelablePromise(options.Promise, function (resolve, reject, onCancel) {
      function listener() {
        var filter= options.filter;
        if (filter && !filter.apply(self, arguments)) {
          return;
        }
        self.off(event, listener);
        if (options.handleError) {
          var err = arguments[0];
          err ? reject(err) : resolve(toArray.apply(null, arguments).slice(1));
        } else {
          resolve(toArray.apply(null, arguments));
        }
      }

      onCancel(function(){
        self.off(event, listener);
      });

      self._on(event, listener, false);
    }, {
      timeout: options.timeout,
      overload: options.overload
    })
  };

  function once(emitter, name, options) {
    options= resolveOptions(options, {
      Promise: Promise,
      timeout: 0,
      overload: false
    }, {
      Promise: constructorReducer
    });

    var _Promise= options.Promise;

    return makeCancelablePromise(_Promise, function(resolve, reject, onCancel){
      var handler;
      if (typeof emitter.addEventListener === 'function') {
        handler=  function () {
          resolve(toArray.apply(null, arguments));
        };

        onCancel(function(){
          emitter.removeEventListener(name, handler);
        });

        emitter.addEventListener(
            name,
            handler,
            {once: true}
        );
        return;
      }

      var eventListener = function(){
        errorListener && emitter.removeListener('error', errorListener);
        resolve(toArray.apply(null, arguments));
      };

      var errorListener;

      if (name !== 'error') {
        errorListener = function (err){
          emitter.removeListener(name, eventListener);
          reject(err);
        };

        emitter.once('error', errorListener);
      }

      onCancel(function(){
        errorListener && emitter.removeListener('error', errorListener);
        emitter.removeListener(name, eventListener);
      });

      emitter.once(name, eventListener);
    }, {
      timeout: options.timeout,
      overload: options.overload
    });
  }

  var prototype= EventEmitter.prototype;

  Object.defineProperties(EventEmitter, {
    defaultMaxListeners: {
      get: function () {
        return prototype._maxListeners;
      },
      set: function (n) {
        if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
          throw TypeError('n must be a non-negative number')
        }
        prototype._maxListeners = n;
      },
      enumerable: true
    },
    once: {
      value: once,
      writable: true,
      configurable: true
    }
  });

  Object.defineProperties(prototype, {
      _maxListeners: {
          value: defaultMaxListeners,
          writable: true,
          configurable: true
      },
      _observers: {value: null, writable: true, configurable: true}
  });

  if (true) {
     // AMD. Register as an anonymous module.
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return EventEmitter;
    }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var _global; }
}();


/***/ }),

/***/ 144:
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports, module], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var mod; }
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

/***/ }),

/***/ 525:
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
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
var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

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
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
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
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
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
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
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

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

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

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

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
  return this.has(key) && delete this.__data__[key];
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
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
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
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

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

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

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
  return getMapData(this, key)['delete'](key);
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
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
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
  return this.__data__['delete'](key);
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
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
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
    object[key] = value;
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
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {boolean} [isFull] Specify a clone including symbols.
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
  var result;
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
      if (isHostObject(value)) {
        return object ? value : {};
      }
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (!isArr) {
    var props = isFull ? getAllKeys(value) : keys(value);
  }
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
  });
  return result;
}

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(proto) {
  return isObject(proto) ? objectCreate(proto) : {};
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
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
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
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
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
  var result = new buffer.constructor(buffer.length);
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
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
  return arrayReduce(array, addMapEntry, new map.constructor);
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
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
  return arrayReduce(array, addSetEntry, new set.constructor);
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
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Copies own symbol properties of `source` to `object`.
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
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

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
      result = array.constructor(length);

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
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
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
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

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
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
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
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
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
  return baseClone(value, true, true);
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
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

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
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
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
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
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
  return !!value && (type == 'object' || type == 'function');
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
  return !!value && typeof value == 'object';
}

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

module.exports = cloneDeep;


/***/ }),

/***/ 621:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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

/**
 * Open F2
 * @module f2
 * @main f2
 */
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
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
	version: function() {
		/* jshint undef: false */
		return "2.0.0-alpha";
	}
});


/***/ }),

/***/ 282:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var domify__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(137);
/* harmony import */ var domify__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(domify__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _F2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(621);



// the hidden token that we will check against every time someone tries to add, remove, fire handler
var _ct = _F2__WEBPACK_IMPORTED_MODULE_1__/* .default.guid */ .Z.guid();
var _f2t = _F2__WEBPACK_IMPORTED_MODULE_1__/* .default.guid */ .Z.guid();

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
		if(!_F2__WEBPACK_IMPORTED_MODULE_1__/* .default.isNativeDOMNode */ .Z.isNativeDOMNode(appConfig.root))
		{
			appConfig.root = domify__WEBPACK_IMPORTED_MODULE_0___default()(appHtml);
		}
		else
		{
			// append the app html to the root
			appConfig.root.appendChild(domify__WEBPACK_IMPORTED_MODULE_0___default()(appHtml));
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
			_F2__WEBPACK_IMPORTED_MODULE_1__/* .default.log */ .Z.log(appInstance.config.appId + ' has a destroy property, but destroy is not of type function and as such will not be executed.');
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
		domNode: (_F2__WEBPACK_IMPORTED_MODULE_1__/* .default.isNativeDOMNode */ .Z.isNativeDOMNode(func_or_element)) ? func_or_element : null
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

/**
 * The `AppHandlers` functionality provides Container Developers a higher level of control over configuring app rendering and interaction.
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
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
				_defaultMethods[eventKey].apply(_F2__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z, passableArgs);
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
					arguments[2].root.appendChild(domify__WEBPACK_IMPORTED_MODULE_0___default()(arguments[3]));
					handler.domNode.appendChild(arguments[2].root);
				}
				else if (handler.domNode && arguments[2] && !arguments[2].root && arguments[3])
				{
					// set the root to the actual HTML of the app
					arguments[2].root = domify__WEBPACK_IMPORTED_MODULE_0___default()(arguments[3]);
					// appends the root to the dom node specified
					handler.domNode.appendChild(arguments[2].root);
				}
				else
				{
					handler.func.apply(_F2__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z, passableArgs);
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
});


/***/ }),

/***/ 245:
/***/ ((module) => {

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
module.exports = function(appConfig, appContent, root) {
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
};


/***/ }),

/***/ 210:
/***/ ((module) => {

/**
 * The AppConfig object represents an app's meta data
 * @class F2.AppConfig
 */
module.exports = {
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
};

/***/ }),

/***/ 595:
/***/ ((module) => {

/**
 * The AppContent object
 * @class F2.AppManifest.AppContent
 **/
module.exports = {
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
};

/***/ }),

/***/ 700:
/***/ ((module) => {

/**
 * The assets needed to render an app on the page
 * @class F2.AppManifest
 */
module.exports = {
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
};

/***/ }),

/***/ 379:
/***/ ((module) => {

/**
 * An object containing configuration information for the
 * [container](../../container-development.html)
 * @class F2.ContainerConfig
 */
module.exports = {
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
	 * @return {XMLHttpRequest} The XMLHttpRequest object
	 *
	 * @example
         *     F2.init({
         *         xhr: function(url, appConfigs,successCallback, errorCallback, completeCallback) {
         *          var jsonpCallback = F2.Constants.JSONP_CALLBACK + appConfigs[0].appId, // Unique function name
			 *          var fetchUrl = url + '?params=' + F2.stringify(appConfigs.apps, F2.appConfigReplacer);
         *          var fetchFunc = fetchJsonp(fetchUrl, {
         *                          timeout: 3000,
         *                          jsonpCallbackFunction: jsonpCallback
         *                          });                
         *           fetchFunc.then(function(response) {
         *                          return response.json();
         *                      })
         *                      .then(function(data) {
         *                      	successCallback(data);
         *                      	completeCallback();                         
         *                  })
         *                  .catch(function(error) {
         *                      F2.log('Failed to load app(s)', error.toString());
         *                      errorCallback();
         *                  });
         *         }
         *     });
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
		 * Allows the container to override the request method that is used.
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
};

/***/ }),

/***/ 81:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(245);
/* harmony import */ var _app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _appConfig__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(210);
/* harmony import */ var _appConfig__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_appConfig__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _appContent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(595);
/* harmony import */ var _appContent__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_appContent__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _appManifest__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(700);
/* harmony import */ var _appManifest__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_appManifest__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _containerConfig__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(379);
/* harmony import */ var _containerConfig__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_containerConfig__WEBPACK_IMPORTED_MODULE_4__);






/**
 * Class stubs for documentation purposes
 * @main F2
 */
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
	App: (_app__WEBPACK_IMPORTED_MODULE_0___default()),
	AppConfig: (_appConfig__WEBPACK_IMPORTED_MODULE_1___default()),
	AppContent: (_appContent__WEBPACK_IMPORTED_MODULE_2___default()),
	AppManifest: (_appManifest__WEBPACK_IMPORTED_MODULE_3___default()),
	ContainerConfig: (_containerConfig__WEBPACK_IMPORTED_MODULE_4___default())
});


/***/ }),

/***/ 785:
/***/ ((module) => {

/**
 * Constants used throughout the Open Financial Framework
 * @class F2.Constants.AppHandlers
 * @static
 */
module.exports = {
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
	*   var _token = F2.AppHandlers.getToken();
            *   F2.AppHandlers.on(
            *       _token,
            *       F2.Constants.AppHandlers.APP_RENDER,
            *       function(appConfig, appHtml)
            *       {
            *           // if no app root is defined use the app's outer most node
            *           if(!F2.isNativeDOMNode(appConfig.root))
            *           {
            *               appConfig.root = domify(appHtml);                               
            *           }
            *           else
            *           {                       
            *               // append the app html to the root
            *               appConfig.root.appendChild(domify(appHtml));
            *           }           
            *           
            *           // append the root to the body by default.
            *           document.body.appendChild(appConfig.root);
            *       }
            *   );
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
	*   var _token = F2.AppHandlers.getToken();
            *   F2.AppHandlers.on(
            *       _token,
            *       F2.Constants.AppHandlers.APP_DESTROY,
            *       function(appInstance)
            *       {
            *           // call the apps destroy method, if it has one
            *           if(appInstance && appInstance.app && appInstance.app.destroy && typeof(appInstance.app.destroy) == 'function')
            *           {
            *               appInstance.app.destroy();
            *           }
            *           else if(appInstance && appInstance.app && appInstance.app.destroy)
            *           {
            *               F2.log(appInstance.config.appId + ' has a destroy property, but destroy is not of type function and as such will not be executed.');
            *           }
            *           
            *           // remove the root          
            *           appInstance.config.root.parentNode.removeChild(appInstance.config.root);
            *       }
            *   );
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
	*   var _token = F2.AppHandlers.getToken();
            *   F2.AppHandlers.on(
            *       _token,
            *       F2.Constants.AppHandlers.APP_DESTROY_AFTER,
            *       function(appInstance)
            *       {
            *           F2.log(appInstance);
            *       }
            *   );
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

/***/ }),

/***/ 10:
/***/ ((module) => {

/**
 * Constants used throughout the Open Financial Framework
 * @class F2.Constants.Css
 * @static
 */
module.exports = {
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
	APP: 'f2-app',
	/**
	 * The APP\_CONTAINER class should be applied to the outermost DOM Element
	 * of the app.
	 * @property APP_CONTAINER
	 * @type string
	 * @static
	 * @final
	 */
	APP_CONTAINER: 'f2-app-container'
};

/***/ }),

/***/ 973:
/***/ ((module) => {

/**
 * Constants used throughout the Open Financial Framework
 * @class F2.Constants.Events
 * @static
 */
module.exports = {
	/**
	 * The APP_SCRIPTS_LOADED event is fired when all the scripts defined in
	 * the AppManifest have been loaded.
	 * @property APP_SCRIPTS_LOADED
	 * @type string
	 * @static
	 * @final
	 */
	APP_SCRIPTS_LOADED: 'App.scriptsLoaded',
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
	APP_SYMBOL_CHANGE: 'App.symbolChange',
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
	APP_WIDTH_CHANGE: 'App.widthChange.',
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
	CONTAINER_SYMBOL_CHANGE: 'Container.symbolChange',
	/**
	 * The CONTAINER\_WIDTH\_CHANGE event will be fired by the container when
	 * the width of the container has changed.
	 * @property CONTAINER_WIDTH_CHANGE
	 * @type string
	 * @static
	 * @final
	 */
	CONTAINER_WIDTH_CHANGE: 'Container.widthChange',
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
	CONTAINER_LOCALE_CHANGE: 'Container.localeChange',
	/**
	 * The RESOURCE_FAILED_TO_LOAD event will be fired by the container when
	 * it fails to load a script or style.
	 * @property RESOURCE_FAILED_TO_LOAD
	 * @depreciated since 1.4
	 * @type string
	 * @static
	 * @final
	 */
	RESOURCE_FAILED_TO_LOAD: 'Container.resourceFailedToLoad'
};


/***/ }),

/***/ 257:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _appHandlers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(785);
/* harmony import */ var _appHandlers__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_appHandlers__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);
/* harmony import */ var _css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_css__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(973);
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_events__WEBPACK_IMPORTED_MODULE_2__);




/**
 * Constants used throughout the Open Financial Framework
 * @class F2.Constants
 * @static
 */
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
	AppHandlers: (_appHandlers__WEBPACK_IMPORTED_MODULE_0___default()),
	AppStatus: {
		ERROR: 'ERROR',
		SUCCESS: 'SUCCESS'
	},
	Css: (_css__WEBPACK_IMPORTED_MODULE_1___default()),
	Events: (_events__WEBPACK_IMPORTED_MODULE_2___default()),
	JSONP_CALLBACK: 'F2_jsonpCallback_'
});


/***/ }),

/***/ 239:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _appHandlers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(282);
/* harmony import */ var _classes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(81);
/* harmony import */ var lodash_cloneDeep__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(525);
/* harmony import */ var lodash_cloneDeep__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_cloneDeep__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(257);
/* harmony import */ var domify__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(137);
/* harmony import */ var domify__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(domify__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(478);
/* harmony import */ var _F2__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(621);
/* harmony import */ var fetch_jsonp__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(144);
/* harmony import */ var fetch_jsonp__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(fetch_jsonp__WEBPACK_IMPORTED_MODULE_7__);









var _apps = {};
var _config = false;
var _sAppHandlerToken = _appHandlers__WEBPACK_IMPORTED_MODULE_0__/* .default.__f2GetToken */ .Z.__f2GetToken();
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
	appConfig = lodash_cloneDeep__WEBPACK_IMPORTED_MODULE_2___default()(appConfig) || {};

	// create the instanceId for the app
	appConfig.instanceId = appConfig.instanceId || _F2__WEBPACK_IMPORTED_MODULE_6__/* .default.guid */ .Z.guid();

	//pass container-defined locale to each app
	if (_classes__WEBPACK_IMPORTED_MODULE_1__/* .default.ContainerConfig.locale */ .Z.ContainerConfig.locale){
		appConfig.containerLocale = _classes__WEBPACK_IMPORTED_MODULE_1__/* .default.ContainerConfig.locale */ .Z.ContainerConfig.locale;
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
					appConfig.context = _F2__WEBPACK_IMPORTED_MODULE_6__/* .default.parse */ .Z.parse(contextJson);
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
		containerConfig.scriptErrorTimeout = _classes__WEBPACK_IMPORTED_MODULE_1__/* .default.ContainerConfig.scriptErrorTimeout */ .Z.ContainerConfig.scriptErrorTimeout;
	}

	if (containerConfig.debugMode !== true) {
		containerConfig.debugMode = _classes__WEBPACK_IMPORTED_MODULE_1__/* .default.ContainerConfig.debugMode */ .Z.ContainerConfig.debugMode;
	}

	if (containerConfig.locale && typeof containerConfig.locale == 'string'){
		_classes__WEBPACK_IMPORTED_MODULE_1__/* .default.ContainerConfig.locale */ .Z.ContainerConfig.locale = containerConfig.locale;
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
		_events__WEBPACK_IMPORTED_MODULE_5__/* .default.emit */ .Z.emit(_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.Events.CONTAINER_WIDTH_CHANGE */ .Z.Events.CONTAINER_WIDTH_CHANGE);
	};

	// TODO: remove this on destroy()
	window.addEventListener('resize', function() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(resizeHandler, 100);
	});

	//listen for container-broadcasted locale changes
	_events__WEBPACK_IMPORTED_MODULE_5__/* .default.on */ .Z.on(_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.Events.CONTAINER_LOCALE_CHANGE */ .Z.Events.CONTAINER_LOCALE_CHANGE,function(data){
		if (data.locale && typeof data.locale == 'string'){
			_classes__WEBPACK_IMPORTED_MODULE_1__/* .default.ContainerConfig.locale */ .Z.ContainerConfig.locale = data.locale;
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
		_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.isNativeDOMNode */ .Z.isNativeDOMNode(node) &&
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
	if (_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.Apps */ .Z.Apps[appConfig.appId] !== undefined) {
		if (typeof _F2__WEBPACK_IMPORTED_MODULE_6__/* .default.Apps */ .Z.Apps[appConfig.appId] === 'function') {

			// IE
			setTimeout(function() {
				_apps[appConfig.instanceId].app = new _F2__WEBPACK_IMPORTED_MODULE_6__/* .default.Apps */ .Z.Apps[appConfig.appId](appConfig, appContent, appConfig.root);
				if (_apps[appConfig.instanceId].app['init'] !== undefined) {
					_apps[appConfig.instanceId].app.init();
				}
			}, 0);

		}
		else {
			_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('app initialization class is defined but not a function. (' + appConfig.appId + ')');
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
		_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('The number of apps defined in the AppManifest do not match the number requested.', appManifest);
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
			var node = domify__WEBPACK_IMPORTED_MODULE_4___default()(stylesFragment.join(''));
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
				_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('Script defined in \'' + evtData.appId + '\' failed to load \'' + evtData.src + '\'');

				// @Brian ? TODO: deprecate, see #222
				_events__WEBPACK_IMPORTED_MODULE_5__/* .default.emit */ .Z.emit(_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.Events.RESOURCE_FAILED_TO_LOAD */ .Z.Events.RESOURCE_FAILED_TO_LOAD, evtData);

				_appHandlers__WEBPACK_IMPORTED_MODULE_0__/* .default.__trigger */ .Z.__trigger(
						_sAppHandlerToken,
						_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.AppHandlers.APP_SCRIPT_LOAD_FAILED */ .Z.AppHandlers.APP_SCRIPT_LOAD_FAILED,
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
					_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('Error loading inline script: ' + exception + '\n\n' + inlines[i]);

					// Emit events
					_events__WEBPACK_IMPORTED_MODULE_5__/* .default.emit */ .Z.emit('RESOURCE_FAILED_TO_LOAD', { appId:appConfigs[0].appId, src: inlines[i], err: exception });
						_appHandlers__WEBPACK_IMPORTED_MODULE_0__/* .default.__trigger */ .Z.__trigger(
							_sAppHandlerToken,
							_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.AppHandlers.APP_SCRIPT_LOAD_FAILED */ .Z.AppHandlers.APP_SCRIPT_LOAD_FAILED,
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
				var node = domify__WEBPACK_IMPORTED_MODULE_4___default()(a.html);
				node.classList.add(_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.Css.APP_CONTAINER */ .Z.Css.APP_CONTAINER);
				node.classList.add(appConfigs[i].appId);
				appConfigs[i].root.classList.add(_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.Css.APP */ .Z.Css.APP);
				appConfigs[i].root.appendChild(node);
			}
			else {
				var container = document.createElement('div');
				var childNode = domify__WEBPACK_IMPORTED_MODULE_4___default()(a.html);
				childNode.classList.add(_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.Css.APP_CONTAINER */ .Z.Css.APP_CONTAINER);
				childNode.classList.add(appConfigs[i].appId);
				container.appendChild(childNode);

				_appHandlers__WEBPACK_IMPORTED_MODULE_0__/* .default.__trigger */ .Z.__trigger(
					_sAppHandlerToken,
					_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.AppHandlers.APP_RENDER */ .Z.AppHandlers.APP_RENDER,
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

				_appHandlers__WEBPACK_IMPORTED_MODULE_0__/* .default.__trigger */ .Z.__trigger(
					_sAppHandlerToken,
					_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.AppHandlers.APP_RENDER_AFTER */ .Z.AppHandlers.APP_RENDER_AFTER,
					appConfigs[i] // the app config
				);

				if (!_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.isNativeDOMNode */ .Z.isNativeDOMNode(root)) {
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
			if (appConfigs[0]){ _events__WEBPACK_IMPORTED_MODULE_5__/* .default.emit */ .Z.emit('APP_SCRIPTS_LOADED', { appId:appConfigs[0].appId, scripts:scripts }); }
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
		_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('"appId" missing from app object');
		return false;
	}
	else if (!appConfig.root && !appConfig.manifestUrl) {
		_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('"manifestUrl" missing from app object');
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

/**
 * Root namespace of the F2 SDK
 * @module f2
 * @class F2
 */
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
	/**
	 * Gets the current list of apps in the container
	 * @method getContainerState
	 * @returns {Array} An array of objects containing the appId
	 */
	getContainerState: function() {
		if (!_isInit()) {
			_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('F2.init() must be called before F2.getContainerState()');
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
			_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('F2.init() must be called before F2.getContainerLocale()');
			return;
		}

		return _classes__WEBPACK_IMPORTED_MODULE_1__/* .default.ContainerConfig.locale */ .Z.ContainerConfig.locale;
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

		var self = this,
			elements = [],
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

		if (!!parentNode && !_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.isNativeDOMNode */ .Z.isNativeDOMNode(parentNode)) {
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
			self.registerApps(appConfigs);
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
			_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('F2.init() must be called before F2.registerApps()');
			return;
		}
		else if (!appConfigs) {
			_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('At least one AppConfig must be passed when calling F2.registerApps()');
			return;
		}

		var self = this;
		var appStack = [];
		var batches = {};
		var callbackStack = {};
		var haveManifests = false;
		appConfigs = [].concat(appConfigs);
		appManifests = [].concat(appManifests || []);
		haveManifests = !! appManifests.length;

		// appConfigs must have a length
		if (!appConfigs.length) {
			_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('At least one AppConfig must be passed when calling F2.registerApps()');
			return;
			// ensure that the array of apps and manifests are qual
		}
		else if (appConfigs.length && haveManifests && appConfigs.length != appManifests.length) {
			_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('The length of "apps" does not equal the length of "appManifests"');
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
				if ((!a.root && typeof(a.root) != 'string') && !_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.isNativeDOMNode */ .Z.isNativeDOMNode(a.root)) {
					_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('AppConfig invalid for pre-load, not a valid string and not dom node');
					_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('AppConfig instance:', a);
					throw ('Preloaded appConfig.root property must be a native dom node or a string representing a sizzle selector. Please check your inputs and try again.');
				}

				// instantiate F2.App
				_createAppInstance(a, {
					preloaded: true,
					status: _constants__WEBPACK_IMPORTED_MODULE_3__/* .default.AppStatus.SUCCESS */ .Z.AppStatus.SUCCESS
				});


				// Continue on in the .each loop, no need to continue because the app is on the page
				// the js in initialized, and it is ready to role.
				return; // equivalent to continue in .each
			}

			if (!_isPlaceholderElement(a.root)) {
					_appHandlers__WEBPACK_IMPORTED_MODULE_0__/* .default.__trigger */ .Z.__trigger(
						_sAppHandlerToken,
						_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.AppHandlers.APP_CREATE_ROOT */ .Z.AppHandlers.APP_CREATE_ROOT,
						a // the app config
					);

					_appHandlers__WEBPACK_IMPORTED_MODULE_0__/* .default.__trigger */ .Z.__trigger(
						_sAppHandlerToken,
						_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.AppHandlers.APP_RENDER_BEFORE */ .Z.AppHandlers.APP_RENDER_BEFORE,
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
				var jsonpCallback = _constants__WEBPACK_IMPORTED_MODULE_3__/* .default.JSONP_CALLBACK */ .Z.JSONP_CALLBACK + req.apps[0].appId;

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
								_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('Removed failed ' + item.name + ' app', item);
								_appHandlers__WEBPACK_IMPORTED_MODULE_0__/* .default.__trigger */ .Z.__trigger(
									_sAppHandlerToken,
									_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.AppHandlers.APP_MANIFEST_REQUEST_FAIL */ .Z.AppHandlers.APP_MANIFEST_REQUEST_FAIL,
									item // the app config
								);
								self.removeApp(item.instanceId);
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
								fetchUrl = url + '?params=' + _F2__WEBPACK_IMPORTED_MODULE_6__/* .default.stringify */ .Z.stringify(req.apps, _F2__WEBPACK_IMPORTED_MODULE_6__/* .default.appConfigReplacer */ .Z.appConfigReplacer);

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
										params: _F2__WEBPACK_IMPORTED_MODULE_6__/* .default.stringify */ .Z.stringify(req.apps, _F2__WEBPACK_IMPORTED_MODULE_6__/* .default.appConfigReplacer */ .Z.appConfigReplacer)
									};
								}

								fetchFunc = fetch(fetchUrl, fetchInputs);
							} else if (dataType === 'jsonp') {
								fetchFunc = fetch_jsonp__WEBPACK_IMPORTED_MODULE_7___default()(fetchUrl, {
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
								_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('Failed to load app(s)', error, req.apps);
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

		var self = this;

		if (!_isInit()) {
			_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('F2.init() must be called before F2.removeAllApps()');
			return;
		}

		if(Object.keys(_apps).length > 0) {
			 Object.keys(_apps).forEach(function(key) {
			 	self.removeApp(_apps[key].config.instanceId);
			});
		}
	},
	/**
	 * Removes an app from the container
	 * @method removeApp
	 * @param {string} instanceId The app's instanceId
	 */
	removeApp: function(instanceId) {

		if (!_isInit()) {
			_F2__WEBPACK_IMPORTED_MODULE_6__/* .default.log */ .Z.log('F2.init() must be called before F2.removeApp()');
			return;
		}

		if (_apps[instanceId]) {
			_appHandlers__WEBPACK_IMPORTED_MODULE_0__/* .default.__trigger */ .Z.__trigger(
				_sAppHandlerToken,
				_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.AppHandlers.APP_DESTROY_BEFORE */ .Z.AppHandlers.APP_DESTROY_BEFORE,
				_apps[instanceId] // the app instance
			);

			_appHandlers__WEBPACK_IMPORTED_MODULE_0__/* .default.__trigger */ .Z.__trigger(
				_sAppHandlerToken,
				_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.AppHandlers.APP_DESTROY */ .Z.AppHandlers.APP_DESTROY,
				_apps[instanceId] // the app instance
			);

			_appHandlers__WEBPACK_IMPORTED_MODULE_0__/* .default.__trigger */ .Z.__trigger(
				_sAppHandlerToken,
				_constants__WEBPACK_IMPORTED_MODULE_3__/* .default.AppHandlers.APP_DESTROY_AFTER */ .Z.AppHandlers.APP_DESTROY_AFTER,
				_apps[instanceId] // the app instance
			);

			delete _apps[instanceId];
		}
	}
});


/***/ }),

/***/ 478:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var eventemitter2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(387);
/* harmony import */ var eventemitter2__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(eventemitter2__WEBPACK_IMPORTED_MODULE_0__);


/**
 * Handles [Context](../../app-development.html#context) passing from
 * containers to apps and apps to apps.
 * @class F2.Events
 */
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((function() {
	// init EventEmitter
	var _events = new (eventemitter2__WEBPACK_IMPORTED_MODULE_0___default())({
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
			return eventemitter2__WEBPACK_IMPORTED_MODULE_0___default().prototype.emit.apply(_events, [].slice.call(arguments));
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ src)
});

// EXTERNAL MODULE: ./src/appHandlers.js
var appHandlers = __webpack_require__(282);
// EXTERNAL MODULE: ./src/container.js
var container = __webpack_require__(239);
;// CONCATENATED MODULE: ./src/autoload.js


/* harmony default export */ function autoload() {

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
			container/* default.init */.Z.init();
			for (var i = 0, len = autoloadEls.length; i < len; i++) {
				container/* default.loadPlaceholders */.Z.loadPlaceholders(autoloadEls[i]);
			}
		}
	};

	if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
		callback();
	} else {
		document.addEventListener('DOMContentLoaded', callback);
	}
}
// EXTERNAL MODULE: ./src/classes/index.js
var classes = __webpack_require__(81);
// EXTERNAL MODULE: ./src/constants/index.js
var constants = __webpack_require__(257);
// EXTERNAL MODULE: ./src/events.js
var events = __webpack_require__(478);
// EXTERNAL MODULE: ./src/F2.js
var F2 = __webpack_require__(621);
;// CONCATENATED MODULE: ./src/index.js








autoload();

/* harmony default export */ const src = ({
	...F2/* default */.Z,
	...classes/* default */.Z,
	...container/* default */.Z,
	AppHandlers: appHandlers/* default */.Z,
	Constants: constants/* default */.Z,
	Events: events/* default */.Z
});
})();

__webpack_exports__ = __webpack_exports__.default;
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=f2.js.map