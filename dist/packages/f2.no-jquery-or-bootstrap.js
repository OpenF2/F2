(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (window, document, location, setTimeout, decodeURIComponent, encodeURIComponent) {
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global JSON, XMLHttpRequest, window, escape, unescape, ActiveXObject */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

var global = this;
var channelId = Math.floor(Math.random() * 10000); // randomize the initial id in case of multiple closures loaded 
var emptyFn = Function.prototype;
var reURI = /^((http.?:)\/\/([^:\/\s]+)(:\d+)*)/; // returns groups for protocol (2), domain (3) and port (4) 
var reParent = /[\-\w]+\/\.\.\//; // matches a foo/../ expression 
var reDoubleSlash = /([^:])\/\//g; // matches // anywhere but in the protocol
var namespace = ""; // stores namespace under which easyXDM object is stored on the page (empty if object is global)
var easyXDM = {};
var _easyXDM = window.easyXDM; // map over global easyXDM in case of overwrite
var IFRAME_PREFIX = "easyXDM_";
var HAS_NAME_PROPERTY_BUG;
var useHash = false; // whether to use the hash over the query
var flashVersion; // will be set if using flash
var HAS_FLASH_THROTTLED_BUG;


// http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
function isHostMethod(object, property){
    var t = typeof object[property];
    return t == 'function' ||
    (!!(t == 'object' && object[property])) ||
    t == 'unknown';
}

function isHostObject(object, property){
    return !!(typeof(object[property]) == 'object' && object[property]);
}

// end

// http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
function isArray(o){
    return Object.prototype.toString.call(o) === '[object Array]';
}

// end
function hasFlash(){
    var name = "Shockwave Flash", mimeType = "application/x-shockwave-flash";
    
    if (!undef(navigator.plugins) && typeof navigator.plugins[name] == "object") {
        // adapted from the swfobject code
        var description = navigator.plugins[name].description;
        if (description && !undef(navigator.mimeTypes) && navigator.mimeTypes[mimeType] && navigator.mimeTypes[mimeType].enabledPlugin) {
            flashVersion = description.match(/\d+/g);
        }
    }
    if (!flashVersion) {
        var flash;
        try {
            flash = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            flashVersion = Array.prototype.slice.call(flash.GetVariable("$version").match(/(\d+),(\d+),(\d+),(\d+)/), 1);
            flash = null;
        } 
        catch (notSupportedException) {
        }
    }
    if (!flashVersion) {
        return false;
    }
    var major = parseInt(flashVersion[0], 10), minor = parseInt(flashVersion[1], 10);
    HAS_FLASH_THROTTLED_BUG = major > 9 && minor > 0;
    return true;
}

/*
 * Cross Browser implementation for adding and removing event listeners.
 */
var on, un;
if (isHostMethod(window, "addEventListener")) {
    on = function(target, type, listener){
        target.addEventListener(type, listener, false);
    };
    un = function(target, type, listener){
        target.removeEventListener(type, listener, false);
    };
}
else if (isHostMethod(window, "attachEvent")) {
    on = function(object, sEvent, fpNotify){
        object.attachEvent("on" + sEvent, fpNotify);
    };
    un = function(object, sEvent, fpNotify){
        object.detachEvent("on" + sEvent, fpNotify);
    };
}
else {
    throw new Error("Browser not supported");
}

/*
 * Cross Browser implementation of DOMContentLoaded.
 */
var domIsReady = false, domReadyQueue = [], readyState;
if ("readyState" in document) {
    // If browser is WebKit-powered, check for both 'loaded' (legacy browsers) and
    // 'interactive' (HTML5 specs, recent WebKit builds) states.
    // https://bugs.webkit.org/show_bug.cgi?id=45119
    readyState = document.readyState;
    domIsReady = readyState == "complete" || (~ navigator.userAgent.indexOf('AppleWebKit/') && (readyState == "loaded" || readyState == "interactive"));
}
else {
    // If readyState is not supported in the browser, then in order to be able to fire whenReady functions apropriately
    // when added dynamically _after_ DOM load, we have to deduce wether the DOM is ready or not.
    // We only need a body to add elements to, so the existence of document.body is enough for us.
    domIsReady = !!document.body;
}

function dom_onReady(){
    if (domIsReady) {
        return;
    }
    domIsReady = true;
    for (var i = 0; i < domReadyQueue.length; i++) {
        domReadyQueue[i]();
    }
    domReadyQueue.length = 0;
}


if (!domIsReady) {
    if (isHostMethod(window, "addEventListener")) {
        on(document, "DOMContentLoaded", dom_onReady);
    }
    else {
        on(document, "readystatechange", function(){
            if (document.readyState == "complete") {
                dom_onReady();
            }
        });
        if (document.documentElement.doScroll && window === top) {
            var doScrollCheck = function(){
                if (domIsReady) {
                    return;
                }
                // http://javascript.nwbox.com/IEContentLoaded/
                try {
                    document.documentElement.doScroll("left");
                } 
                catch (e) {
                    setTimeout(doScrollCheck, 1);
                    return;
                }
                dom_onReady();
            };
            doScrollCheck();
        }
    }
    
    // A fallback to window.onload, that will always work
    on(window, "load", dom_onReady);
}
/**
 * This will add a function to the queue of functions to be run once the DOM reaches a ready state.
 * If functions are added after this event then they will be executed immediately.
 * @param {function} fn The function to add
 * @param {Object} scope An optional scope for the function to be called with.
 */
function whenReady(fn, scope){
    if (domIsReady) {
        fn.call(scope);
        return;
    }
    domReadyQueue.push(function(){
        fn.call(scope);
    });
}

/**
 * Returns an instance of easyXDM from the parent window with
 * respect to the namespace.
 *
 * @return An instance of easyXDM (in the parent window)
 */
function getParentObject(){
    var obj = parent;
    if (namespace !== "") {
        for (var i = 0, ii = namespace.split("."); i < ii.length; i++) {
            obj = obj[ii[i]];
        }
    }
    return obj.easyXDM;
}

/**
 * Removes easyXDM variable from the global scope. It also returns control
 * of the easyXDM variable to whatever code used it before.
 *
 * @param {String} ns A string representation of an object that will hold
 *                    an instance of easyXDM.
 * @return An instance of easyXDM
 */
function noConflict(ns){
    
    window.easyXDM = _easyXDM;
    namespace = ns;
    if (namespace) {
        IFRAME_PREFIX = "easyXDM_" + namespace.replace(".", "_") + "_";
    }
    return easyXDM;
}

/*
 * Methods for working with URLs
 */
/**
 * Get the domain name from a url.
 * @param {String} url The url to extract the domain from.
 * @return The domain part of the url.
 * @type {String}
 */
function getDomainName(url){
    return url.match(reURI)[3];
}

/**
 * Get the port for a given URL, or "" if none
 * @param {String} url The url to extract the port from.
 * @return The port part of the url.
 * @type {String}
 */
function getPort(url){
    return url.match(reURI)[4] || "";
}

/**
 * Returns  a string containing the schema, domain and if present the port
 * @param {String} url The url to extract the location from
 * @return {String} The location part of the url
 */
function getLocation(url){
    var m = url.toLowerCase().match(reURI);
    var proto = m[2], domain = m[3], port = m[4] || "";
    if ((proto == "http:" && port == ":80") || (proto == "https:" && port == ":443")) {
        port = "";
    }
    return proto + "//" + domain + port;
}

/**
 * Resolves a relative url into an absolute one.
 * @param {String} url The path to resolve.
 * @return {String} The resolved url.
 */
function resolveUrl(url){
    
    // replace all // except the one in proto with /
    url = url.replace(reDoubleSlash, "$1/");
    
    // If the url is a valid url we do nothing
    if (!url.match(/^(http||https):\/\//)) {
        // If this is a relative path
        var path = (url.substring(0, 1) === "/") ? "" : location.pathname;
        if (path.substring(path.length - 1) !== "/") {
            path = path.substring(0, path.lastIndexOf("/") + 1);
        }
        
        url = location.protocol + "//" + location.host + path + url;
    }
    
    // reduce all 'xyz/../' to just '' 
    while (reParent.test(url)) {
        url = url.replace(reParent, "");
    }
    
    return url;
}

/**
 * Appends the parameters to the given url.<br/>
 * The base url can contain existing query parameters.
 * @param {String} url The base url.
 * @param {Object} parameters The parameters to add.
 * @return {String} A new valid url with the parameters appended.
 */
function appendQueryParameters(url, parameters){
    
    var hash = "", indexOf = url.indexOf("#");
    if (indexOf !== -1) {
        hash = url.substring(indexOf);
        url = url.substring(0, indexOf);
    }
    var q = [];
    for (var key in parameters) {
        if (parameters.hasOwnProperty(key)) {
            q.push(key + "=" + encodeURIComponent(parameters[key]));
        }
    }
    return url + (useHash ? "#" : (url.indexOf("?") == -1 ? "?" : "&")) + q.join("&") + hash;
}


// build the query object either from location.query, if it contains the xdm_e argument, or from location.hash
var query = (function(input){
    input = input.substring(1).split("&");
    var data = {}, pair, i = input.length;
    while (i--) {
        pair = input[i].split("=");
        data[pair[0]] = decodeURIComponent(pair[1]);
    }
    return data;
}(/xdm_e=/.test(location.search) ? location.search : location.hash));

/*
 * Helper methods
 */
/**
 * Helper for checking if a variable/property is undefined
 * @param {Object} v The variable to test
 * @return {Boolean} True if the passed variable is undefined
 */
function undef(v){
    return typeof v === "undefined";
}

/**
 * A safe implementation of HTML5 JSON. Feature testing is used to make sure the implementation works.
 * @return {JSON} A valid JSON conforming object, or null if not found.
 */
var getJSON = function(){
    var cached = {};
    var obj = {
        a: [1, 2, 3]
    }, json = "{\"a\":[1,2,3]}";
    
    if (typeof JSON != "undefined" && typeof JSON.stringify === "function" && JSON.stringify(obj).replace((/\s/g), "") === json) {
        // this is a working JSON instance
        return JSON;
    }
    if (Object.toJSON) {
        if (Object.toJSON(obj).replace((/\s/g), "") === json) {
            // this is a working stringify method
            cached.stringify = Object.toJSON;
        }
    }
    
    if (typeof String.prototype.evalJSON === "function") {
        obj = json.evalJSON();
        if (obj.a && obj.a.length === 3 && obj.a[2] === 3) {
            // this is a working parse method           
            cached.parse = function(str){
                return str.evalJSON();
            };
        }
    }
    
    if (cached.stringify && cached.parse) {
        // Only memoize the result if we have valid instance
        getJSON = function(){
            return cached;
        };
        return cached;
    }
    return null;
};

/**
 * Applies properties from the source object to the target object.<br/>
 * @param {Object} target The target of the properties.
 * @param {Object} source The source of the properties.
 * @param {Boolean} noOverwrite Set to True to only set non-existing properties.
 */
function apply(destination, source, noOverwrite){
    var member;
    for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
            if (prop in destination) {
                member = source[prop];
                if (typeof member === "object") {
                    apply(destination[prop], member, noOverwrite);
                }
                else if (!noOverwrite) {
                    destination[prop] = source[prop];
                }
            }
            else {
                destination[prop] = source[prop];
            }
        }
    }
    return destination;
}

// This tests for the bug in IE where setting the [name] property using javascript causes the value to be redirected into [submitName].
function testForNamePropertyBug(){
    var form = document.body.appendChild(document.createElement("form")), input = form.appendChild(document.createElement("input"));
    input.name = IFRAME_PREFIX + "TEST" + channelId; // append channelId in order to avoid caching issues
    HAS_NAME_PROPERTY_BUG = input !== form.elements[input.name];
    document.body.removeChild(form);
}

/**
 * Creates a frame and appends it to the DOM.
 * @param config {object} This object can have the following properties
 * <ul>
 * <li> {object} prop The properties that should be set on the frame. This should include the 'src' property.</li>
 * <li> {object} attr The attributes that should be set on the frame.</li>
 * <li> {DOMElement} container Its parent element (Optional).</li>
 * <li> {function} onLoad A method that should be called with the frames contentWindow as argument when the frame is fully loaded. (Optional)</li>
 * </ul>
 * @return The frames DOMElement
 * @type DOMElement
 */
function createFrame(config){
    if (undef(HAS_NAME_PROPERTY_BUG)) {
        testForNamePropertyBug();
    }
    var frame;
    // This is to work around the problems in IE6/7 with setting the name property. 
    // Internally this is set as 'submitName' instead when using 'iframe.name = ...'
    // This is not required by easyXDM itself, but is to facilitate other use cases 
    if (HAS_NAME_PROPERTY_BUG) {
        frame = document.createElement("<iframe name=\"" + config.props.name + "\"/>");
    }
    else {
        frame = document.createElement("IFRAME");
        frame.name = config.props.name;
    }
    
    frame.id = frame.name = config.props.name;
    delete config.props.name;
    
    if (typeof config.container == "string") {
        config.container = document.getElementById(config.container);
    }
    
    if (!config.container) {
        // This needs to be hidden like this, simply setting display:none and the like will cause failures in some browsers.
        apply(frame.style, {
            position: "absolute",
            top: "-2000px",
            // Avoid potential horizontal scrollbar
            left: "0px"
        });
        config.container = document.body;
    }
    
    // HACK: IE cannot have the src attribute set when the frame is appended
    //       into the container, so we set it to "javascript:false" as a
    //       placeholder for now.  If we left the src undefined, it would
    //       instead default to "about:blank", which causes SSL mixed-content
    //       warnings in IE6 when on an SSL parent page.
    var src = config.props.src;
    config.props.src = "javascript:false";
    
    // transfer properties to the frame
    apply(frame, config.props);
    
    frame.border = frame.frameBorder = 0;
    frame.allowTransparency = true;
    config.container.appendChild(frame);
    
    if (config.onLoad) {
        on(frame, "load", config.onLoad);
    }
    
    // set the frame URL to the proper value (we previously set it to
    // "javascript:false" to work around the IE issue mentioned above)
    if(config.usePost) {
        var form = config.container.appendChild(document.createElement('form')), input;
        form.target = frame.name;
        form.action = src;
        form.method = 'POST';
        if (typeof(config.usePost) === 'object') {
            for (var i in config.usePost) {
                if (config.usePost.hasOwnProperty(i)) {
                    if (HAS_NAME_PROPERTY_BUG) {
                        input = document.createElement('<input name="' + i + '"/>');
                    } else {
                        input = document.createElement("INPUT");
                        input.name = i;
                    }
                    input.value = config.usePost[i];
                    form.appendChild(input);
                }
            }
        }
        form.submit();
        form.parentNode.removeChild(form);
    } else {
        frame.src = src;
    }
    config.props.src = src;
    
    return frame;
}

/**
 * Check whether a domain is allowed using an Access Control List.
 * The ACL can contain * and ? as wildcards, or can be regular expressions.
 * If regular expressions they need to begin with ^ and end with $.
 * @param {Array/String} acl The list of allowed domains
 * @param {String} domain The domain to test.
 * @return {Boolean} True if the domain is allowed, false if not.
 */
function checkAcl(acl, domain){
    // normalize into an array
    if (typeof acl == "string") {
        acl = [acl];
    }
    var re, i = acl.length;
    while (i--) {
        re = acl[i];
        re = new RegExp(re.substr(0, 1) == "^" ? re : ("^" + re.replace(/(\*)/g, ".$1").replace(/\?/g, ".") + "$"));
        if (re.test(domain)) {
            return true;
        }
    }
    return false;
}

/*
 * Functions related to stacks
 */
/**
 * Prepares an array of stack-elements suitable for the current configuration
 * @param {Object} config The Transports configuration. See easyXDM.Socket for more.
 * @return {Array} An array of stack-elements with the TransportElement at index 0.
 */
function prepareTransportStack(config){
    var protocol = config.protocol, stackEls;
    config.isHost = config.isHost || undef(query.xdm_p);
    useHash = config.hash || false;
    
    if (!config.props) {
        config.props = {};
    }
    if (!config.isHost) {
        config.channel = query.xdm_c.replace(/["'<>\\]/g, "");
        config.secret = query.xdm_s;
        config.remote = query.xdm_e.replace(/["'<>\\]/g, "");
        ;
        protocol = query.xdm_p;
        if (config.acl && !checkAcl(config.acl, config.remote)) {
            throw new Error("Access denied for " + config.remote);
        }
    }
    else {
        config.remote = resolveUrl(config.remote);
        config.channel = config.channel || "default" + channelId++;
        config.secret = Math.random().toString(16).substring(2);
        if (undef(protocol)) {
            if (getLocation(location.href) == getLocation(config.remote)) {
                /*
                 * Both documents has the same origin, lets use direct access.
                 */
                protocol = "4";
            }
            else if (isHostMethod(window, "postMessage") || isHostMethod(document, "postMessage")) {
                /*
                 * This is supported in IE8+, Firefox 3+, Opera 9+, Chrome 2+ and Safari 4+
                 */
                protocol = "1";
            }
            else if (config.swf && isHostMethod(window, "ActiveXObject") && hasFlash()) {
                /*
                 * The Flash transport superseedes the NixTransport as the NixTransport has been blocked by MS
                 */
                protocol = "6";
            }
            else if (navigator.product === "Gecko" && "frameElement" in window && navigator.userAgent.indexOf('WebKit') == -1) {
                /*
                 * This is supported in Gecko (Firefox 1+)
                 */
                protocol = "5";
            }
            else if (config.remoteHelper) {
                /*
                 * This is supported in all browsers that retains the value of window.name when
                 * navigating from one domain to another, and where parent.frames[foo] can be used
                 * to get access to a frame from the same domain
                 */
                protocol = "2";
            }
            else {
                /*
                 * This is supported in all browsers where [window].location is writable for all
                 * The resize event will be used if resize is supported and the iframe is not put
                 * into a container, else polling will be used.
                 */
                protocol = "0";
            }
        }
    }
    config.protocol = protocol; // for conditional branching
    switch (protocol) {
        case "0":// 0 = HashTransport
            apply(config, {
                interval: 100,
                delay: 2000,
                useResize: true,
                useParent: false,
                usePolling: false
            }, true);
            if (config.isHost) {
                if (!config.local) {
                    // If no local is set then we need to find an image hosted on the current domain
                    var domain = location.protocol + "//" + location.host, images = document.body.getElementsByTagName("img"), image;
                    var i = images.length;
                    while (i--) {
                        image = images[i];
                        if (image.src.substring(0, domain.length) === domain) {
                            config.local = image.src;
                            break;
                        }
                    }
                    if (!config.local) {
                        // If no local was set, and we are unable to find a suitable file, then we resort to using the current window 
                        config.local = window;
                    }
                }
                
                var parameters = {
                    xdm_c: config.channel,
                    xdm_p: 0
                };
                
                if (config.local === window) {
                    // We are using the current window to listen to
                    config.usePolling = true;
                    config.useParent = true;
                    config.local = location.protocol + "//" + location.host + location.pathname + location.search;
                    parameters.xdm_e = config.local;
                    parameters.xdm_pa = 1; // use parent
                }
                else {
                    parameters.xdm_e = resolveUrl(config.local);
                }
                
                if (config.container) {
                    config.useResize = false;
                    parameters.xdm_po = 1; // use polling
                }
                config.remote = appendQueryParameters(config.remote, parameters);
            }
            else {
                apply(config, {
                    channel: query.xdm_c,
                    remote: query.xdm_e,
                    useParent: !undef(query.xdm_pa),
                    usePolling: !undef(query.xdm_po),
                    useResize: config.useParent ? false : config.useResize
                });
            }
            stackEls = [new easyXDM.stack.HashTransport(config), new easyXDM.stack.ReliableBehavior({}), new easyXDM.stack.QueueBehavior({
                encode: true,
                maxLength: 4000 - config.remote.length
            }), new easyXDM.stack.VerifyBehavior({
                initiate: config.isHost
            })];
            break;
        case "1":
            stackEls = [new easyXDM.stack.PostMessageTransport(config)];
            break;
        case "2":
            if (config.isHost) {
                config.remoteHelper = resolveUrl(config.remoteHelper);
            }
            stackEls = [new easyXDM.stack.NameTransport(config), new easyXDM.stack.QueueBehavior(), new easyXDM.stack.VerifyBehavior({
                initiate: config.isHost
            })];
            break;
        case "3":
            stackEls = [new easyXDM.stack.NixTransport(config)];
            break;
        case "4":
            stackEls = [new easyXDM.stack.SameOriginTransport(config)];
            break;
        case "5":
            stackEls = [new easyXDM.stack.FrameElementTransport(config)];
            break;
        case "6":
            if (!flashVersion) {
                hasFlash();
            }
            stackEls = [new easyXDM.stack.FlashTransport(config)];
            break;
    }
    // this behavior is responsible for buffering outgoing messages, and for performing lazy initialization
    stackEls.push(new easyXDM.stack.QueueBehavior({
        lazy: config.lazy,
        remove: true
    }));
    return stackEls;
}

/**
 * Chains all the separate stack elements into a single usable stack.<br/>
 * If an element is missing a necessary method then it will have a pass-through method applied.
 * @param {Array} stackElements An array of stack elements to be linked.
 * @return {easyXDM.stack.StackElement} The last element in the chain.
 */
function chainStack(stackElements){
    var stackEl, defaults = {
        incoming: function(message, origin){
            this.up.incoming(message, origin);
        },
        outgoing: function(message, recipient){
            this.down.outgoing(message, recipient);
        },
        callback: function(success){
            this.up.callback(success);
        },
        init: function(){
            this.down.init();
        },
        destroy: function(){
            this.down.destroy();
        }
    };
    for (var i = 0, len = stackElements.length; i < len; i++) {
        stackEl = stackElements[i];
        apply(stackEl, defaults, true);
        if (i !== 0) {
            stackEl.down = stackElements[i - 1];
        }
        if (i !== len - 1) {
            stackEl.up = stackElements[i + 1];
        }
    }
    return stackEl;
}

/**
 * This will remove a stackelement from its stack while leaving the stack functional.
 * @param {Object} element The elment to remove from the stack.
 */
function removeFromStack(element){
    element.up.down = element.down;
    element.down.up = element.up;
    element.up = element.down = null;
}

/*
 * Export the main object and any other methods applicable
 */
/** 
 * @class easyXDM
 * A javascript library providing cross-browser, cross-domain messaging/RPC.
 * @version 2.4.19
 * @singleton
 */
apply(easyXDM, {
    /**
     * The version of the library
     * @type {string}
     */
    version: "2.4.19",
    /**
     * This is a map containing all the query parameters passed to the document.
     * All the values has been decoded using decodeURIComponent.
     * @type {object}
     */
    query: query,
    /**
     * @private
     */
    stack: {},
    /**
     * Applies properties from the source object to the target object.<br/>
     * @param {object} target The target of the properties.
     * @param {object} source The source of the properties.
     * @param {boolean} noOverwrite Set to True to only set non-existing properties.
     */
    apply: apply,
    
    /**
     * A safe implementation of HTML5 JSON. Feature testing is used to make sure the implementation works.
     * @return {JSON} A valid JSON conforming object, or null if not found.
     */
    getJSONObject: getJSON,
    /**
     * This will add a function to the queue of functions to be run once the DOM reaches a ready state.
     * If functions are added after this event then they will be executed immediately.
     * @param {function} fn The function to add
     * @param {object} scope An optional scope for the function to be called with.
     */
    whenReady: whenReady,
    /**
     * Removes easyXDM variable from the global scope. It also returns control
     * of the easyXDM variable to whatever code used it before.
     *
     * @param {String} ns A string representation of an object that will hold
     *                    an instance of easyXDM.
     * @return An instance of easyXDM
     */
    noConflict: noConflict
});

/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global console, _FirebugCommandLine,  easyXDM, window, escape, unescape, isHostObject, undef, _trace, domIsReady, emptyFn, namespace */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, isHostObject, isHostMethod, un, on, createFrame, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/** 
 * @class easyXDM.DomHelper
 * Contains methods for dealing with the DOM
 * @singleton
 */
easyXDM.DomHelper = {
    /**
     * Provides a consistent interface for adding eventhandlers
     * @param {Object} target The target to add the event to
     * @param {String} type The name of the event
     * @param {Function} listener The listener
     */
    on: on,
    /**
     * Provides a consistent interface for removing eventhandlers
     * @param {Object} target The target to remove the event from
     * @param {String} type The name of the event
     * @param {Function} listener The listener
     */
    un: un,
    /**
     * Checks for the presence of the JSON object.
     * If it is not present it will use the supplied path to load the JSON2 library.
     * This should be called in the documents head right after the easyXDM script tag.
     * http://json.org/json2.js
     * @param {String} path A valid path to json2.js
     */
    requiresJSON: function(path){
        if (!isHostObject(window, "JSON")) {
            // we need to encode the < in order to avoid an illegal token error
            // when the script is inlined in a document.
            document.write('<' + 'script type="text/javascript" src="' + path + '"><' + '/script>');
        }
    }
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

(function(){
    // The map containing the stored functions
    var _map = {};
    
    /**
     * @class easyXDM.Fn
     * This contains methods related to function handling, such as storing callbacks.
     * @singleton
     * @namespace easyXDM
     */
    easyXDM.Fn = {
        /**
         * Stores a function using the given name for reference
         * @param {String} name The name that the function should be referred by
         * @param {Function} fn The function to store
         * @namespace easyXDM.fn
         */
        set: function(name, fn){
            _map[name] = fn;
        },
        /**
         * Retrieves the function referred to by the given name
         * @param {String} name The name of the function to retrieve
         * @param {Boolean} del If the function should be deleted after retrieval
         * @return {Function} The stored function
         * @namespace easyXDM.fn
         */
        get: function(name, del){
            if (!_map.hasOwnProperty(name)) {
                return;
            }
            var fn = _map[name];
            
            if (del) {
                delete _map[name];
            }
            return fn;
        }
    };
    
}());
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, chainStack, prepareTransportStack, getLocation, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.Socket
 * This class creates a transport channel between two domains that is usable for sending and receiving string-based messages.<br/>
 * The channel is reliable, supports queueing, and ensures that the message originates from the expected domain.<br/>
 * Internally different stacks will be used depending on the browsers features and the available parameters.
 * <h2>How to set up</h2>
 * Setting up the provider:
 * <pre><code>
 * var socket = new easyXDM.Socket({
 * &nbsp; local: "name.html",
 * &nbsp; onReady: function(){
 * &nbsp; &nbsp; &#47;&#47; you need to wait for the onReady callback before using the socket
 * &nbsp; &nbsp; socket.postMessage("foo-message");
 * &nbsp; },
 * &nbsp; onMessage: function(message, origin) {
 * &nbsp;&nbsp; alert("received " + message + " from " + origin);
 * &nbsp; }
 * });
 * </code></pre>
 * Setting up the consumer:
 * <pre><code>
 * var socket = new easyXDM.Socket({
 * &nbsp; remote: "http:&#47;&#47;remotedomain/page.html",
 * &nbsp; remoteHelper: "http:&#47;&#47;remotedomain/name.html",
 * &nbsp; onReady: function(){
 * &nbsp; &nbsp; &#47;&#47; you need to wait for the onReady callback before using the socket
 * &nbsp; &nbsp; socket.postMessage("foo-message");
 * &nbsp; },
 * &nbsp; onMessage: function(message, origin) {
 * &nbsp;&nbsp; alert("received " + message + " from " + origin);
 * &nbsp; }
 * });
 * </code></pre>
 * If you are unable to upload the <code>name.html</code> file to the consumers domain then remove the <code>remoteHelper</code> property
 * and easyXDM will fall back to using the HashTransport instead of the NameTransport when not able to use any of the primary transports.
 * @namespace easyXDM
 * @constructor
 * @cfg {String/Window} local The url to the local name.html document, a local static file, or a reference to the local window.
 * @cfg {Boolean} lazy (Consumer only) Set this to true if you want easyXDM to defer creating the transport until really needed. 
 * @cfg {String} remote (Consumer only) The url to the providers document.
 * @cfg {String} remoteHelper (Consumer only) The url to the remote name.html file. This is to support NameTransport as a fallback. Optional.
 * @cfg {Number} delay The number of milliseconds easyXDM should try to get a reference to the local window.  Optional, defaults to 2000.
 * @cfg {Number} interval The interval used when polling for messages. Optional, defaults to 300.
 * @cfg {String} channel (Consumer only) The name of the channel to use. Can be used to set consistent iframe names. Must be unique. Optional.
 * @cfg {Function} onMessage The method that should handle incoming messages.<br/> This method should accept two arguments, the message as a string, and the origin as a string. Optional.
 * @cfg {Function} onReady A method that should be called when the transport is ready. Optional.
 * @cfg {DOMElement|String} container (Consumer only) The element, or the id of the element that the primary iframe should be inserted into. If not set then the iframe will be positioned off-screen. Optional.
 * @cfg {Array/String} acl (Provider only) Here you can specify which '[protocol]://[domain]' patterns that should be allowed to act as the consumer towards this provider.<br/>
 * This can contain the wildcards ? and *.  Examples are 'http://example.com', '*.foo.com' and '*dom?.com'. If you want to use reqular expressions then you pattern needs to start with ^ and end with $.
 * If none of the patterns match an Error will be thrown.  
 * @cfg {Object} props (Consumer only) Additional properties that should be applied to the iframe. This can also contain nested objects e.g: <code>{style:{width:"100px", height:"100px"}}</code>. 
 * Properties such as 'name' and 'src' will be overrided. Optional.
 */
easyXDM.Socket = function(config){
    
    // create the stack
    var stack = chainStack(prepareTransportStack(config).concat([{
        incoming: function(message, origin){
            config.onMessage(message, origin);
        },
        callback: function(success){
            if (config.onReady) {
                config.onReady(success);
            }
        }
    }])), recipient = getLocation(config.remote);
    
    // set the origin
    this.origin = getLocation(config.remote);
	
    /**
     * Initiates the destruction of the stack.
     */
    this.destroy = function(){
        stack.destroy();
    };
    
    /**
     * Posts a message to the remote end of the channel
     * @param {String} message The message to send
     */
    this.postMessage = function(message){
        stack.outgoing(message, recipient);
    };
    
    stack.init();
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, undef,, chainStack, prepareTransportStack, debug, getLocation */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/** 
 * @class easyXDM.Rpc
 * Creates a proxy object that can be used to call methods implemented on the remote end of the channel, and also to provide the implementation
 * of methods to be called from the remote end.<br/>
 * The instantiated object will have methods matching those specified in <code>config.remote</code>.<br/>
 * This requires the JSON object present in the document, either natively, using json.org's json2 or as a wrapper around library spesific methods.
 * <h2>How to set up</h2>
 * <pre><code>
 * var rpc = new easyXDM.Rpc({
 * &nbsp; &#47;&#47; this configuration is equal to that used by the Socket.
 * &nbsp; remote: "http:&#47;&#47;remotedomain/...",
 * &nbsp; onReady: function(){
 * &nbsp; &nbsp; &#47;&#47; you need to wait for the onReady callback before using the proxy
 * &nbsp; &nbsp; rpc.foo(...
 * &nbsp; }
 * },{
 * &nbsp; local: {..},
 * &nbsp; remote: {..}
 * });
 * </code></pre>
 * 
 * <h2>Exposing functions (procedures)</h2>
 * <pre><code>
 * var rpc = new easyXDM.Rpc({
 * &nbsp; ...
 * },{
 * &nbsp; local: {
 * &nbsp; &nbsp; nameOfMethod: {
 * &nbsp; &nbsp; &nbsp; method: function(arg1, arg2, success, error){
 * &nbsp; &nbsp; &nbsp; &nbsp; ...
 * &nbsp; &nbsp; &nbsp; }
 * &nbsp; &nbsp; },
 * &nbsp; &nbsp; &#47;&#47; with shorthand notation 
 * &nbsp; &nbsp; nameOfAnotherMethod:  function(arg1, arg2, success, error){
 * &nbsp; &nbsp; }
 * &nbsp; },
 * &nbsp; remote: {...}
 * });
 * </code></pre>

 * The function referenced by  [method] will receive the passed arguments followed by the callback functions <code>success</code> and <code>error</code>.<br/>
 * To send a successfull result back you can use
 *     <pre><code>
 *     return foo;
 *     </pre></code>
 * or
 *     <pre><code>
 *     success(foo);
 *     </pre></code>
 *  To return an error you can use
 *     <pre><code>
 *     throw new Error("foo error");
 *     </code></pre>
 * or
 *     <pre><code>
 *     error("foo error");
 *     </code></pre>
 *
 * <h2>Defining remotely exposed methods (procedures/notifications)</h2>
 * The definition of the remote end is quite similar:
 * <pre><code>
 * var rpc = new easyXDM.Rpc({
 * &nbsp; ...
 * },{
 * &nbsp; local: {...},
 * &nbsp; remote: {
 * &nbsp; &nbsp; nameOfMethod: {}
 * &nbsp; }
 * });
 * </code></pre>
 * To call a remote method use
 * <pre><code>
 * rpc.nameOfMethod("arg1", "arg2", function(value) {
 * &nbsp; alert("success: " + value);
 * }, function(message) {
 * &nbsp; alert("error: " + message + );
 * });
 * </code></pre>
 * Both the <code>success</code> and <code>errror</code> callbacks are optional.<br/>
 * When called with no callback a JSON-RPC 2.0 notification will be executed.
 * Be aware that you will not be notified of any errors with this method.
 * <br/>
 * <h2>Specifying a custom serializer</h2>
 * If you do not want to use the JSON2 library for non-native JSON support, but instead capabilities provided by some other library
 * then you can specify a custom serializer using <code>serializer: foo</code>
 * <pre><code>
 * var rpc = new easyXDM.Rpc({
 * &nbsp; ...
 * },{
 * &nbsp; local: {...},
 * &nbsp; remote: {...},
 * &nbsp; serializer : {
 * &nbsp; &nbsp; parse: function(string){ ... },
 * &nbsp; &nbsp; stringify: function(object) {...}
 * &nbsp; }
 * });
 * </code></pre>
 * If <code>serializer</code> is set then the class will not attempt to use the native implementation.
 * @namespace easyXDM
 * @constructor
 * @param {Object} config The underlying transports configuration. See easyXDM.Socket for available parameters.
 * @param {Object} jsonRpcConfig The description of the interface to implement.
 */
easyXDM.Rpc = function(config, jsonRpcConfig){
    
    // expand shorthand notation
    if (jsonRpcConfig.local) {
        for (var method in jsonRpcConfig.local) {
            if (jsonRpcConfig.local.hasOwnProperty(method)) {
                var member = jsonRpcConfig.local[method];
                if (typeof member === "function") {
                    jsonRpcConfig.local[method] = {
                        method: member
                    };
                }
            }
        }
    }
	
    // create the stack
    var stack = chainStack(prepareTransportStack(config).concat([new easyXDM.stack.RpcBehavior(this, jsonRpcConfig), {
        callback: function(success){
            if (config.onReady) {
                config.onReady(success);
            }
        }
    }]));
	
    // set the origin 
    this.origin = getLocation(config.remote);
	
    
    /**
     * Initiates the destruction of the stack.
     */
    this.destroy = function(){
        stack.destroy();
    };
    
    stack.init();
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, getLocation, appendQueryParameters, createFrame, debug, un, on, apply, whenReady, getParentObject, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.SameOriginTransport
 * SameOriginTransport is a transport class that can be used when both domains have the same origin.<br/>
 * This can be useful for testing and for when the main application supports both internal and external sources.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remote The remote document to communicate with.
 */
easyXDM.stack.SameOriginTransport = function(config){
    var pub, frame, send, targetOrigin;
    
    return (pub = {
        outgoing: function(message, domain, fn){
            send(message);
            if (fn) {
                fn();
            }
        },
        destroy: function(){
            if (frame) {
                frame.parentNode.removeChild(frame);
                frame = null;
            }
        },
        onDOMReady: function(){
            targetOrigin = getLocation(config.remote);
            
            if (config.isHost) {
                // set up the iframe
                apply(config.props, {
                    src: appendQueryParameters(config.remote, {
                        xdm_e: location.protocol + "//" + location.host + location.pathname,
                        xdm_c: config.channel,
                        xdm_p: 4 // 4 = SameOriginTransport
                    }),
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                frame = createFrame(config);
                easyXDM.Fn.set(config.channel, function(sendFn){
                    send = sendFn;
                    setTimeout(function(){
                        pub.up.callback(true);
                    }, 0);
                    return function(msg){
                        pub.up.incoming(msg, targetOrigin);
                    };
                });
            }
            else {
                send = getParentObject().Fn.get(config.channel, true)(function(msg){
                    pub.up.incoming(msg, targetOrigin);
                });
                setTimeout(function(){
                    pub.up.callback(true);
                }, 0);
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global global, easyXDM, window, getLocation, appendQueryParameters, createFrame, debug, apply, whenReady, IFRAME_PREFIX, namespace, resolveUrl, getDomainName, HAS_FLASH_THROTTLED_BUG, getPort, query*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.FlashTransport
 * FlashTransport is a transport class that uses an SWF with LocalConnection to pass messages back and forth.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remote The remote domain to communicate with.
 * @cfg {String} secret the pre-shared secret used to secure the communication.
 * @cfg {String} swf The path to the swf file
 * @cfg {Boolean} swfNoThrottle Set this to true if you want to take steps to avoid beeing throttled when hidden.
 * @cfg {String || DOMElement} swfContainer Set this if you want to control where the swf is placed
 */
easyXDM.stack.FlashTransport = function(config){
    var pub, // the public interface
 frame, send, targetOrigin, swf, swfContainer;
    
    function onMessage(message, origin){
        setTimeout(function(){
            pub.up.incoming(message, targetOrigin);
        }, 0);
    }
    
    /**
     * This method adds the SWF to the DOM and prepares the initialization of the channel
     */
    function addSwf(domain){
        // the differentiating query argument is needed in Flash9 to avoid a caching issue where LocalConnection would throw an error.
        var url = config.swf + "?host=" + config.isHost;
        var id = "easyXDM_swf_" + Math.floor(Math.random() * 10000);
        
        // prepare the init function that will fire once the swf is ready
        easyXDM.Fn.set("flash_loaded" + domain.replace(/[\-.]/g, "_"), function(){
            easyXDM.stack.FlashTransport[domain].swf = swf = swfContainer.firstChild;
            var queue = easyXDM.stack.FlashTransport[domain].queue;
            for (var i = 0; i < queue.length; i++) {
                queue[i]();
            }
            queue.length = 0;
        });
        
        if (config.swfContainer) {
            swfContainer = (typeof config.swfContainer == "string") ? document.getElementById(config.swfContainer) : config.swfContainer;
        }
        else {
            // create the container that will hold the swf
            swfContainer = document.createElement('div');
            
            // http://bugs.adobe.com/jira/browse/FP-4796
            // http://tech.groups.yahoo.com/group/flexcoders/message/162365
            // https://groups.google.com/forum/#!topic/easyxdm/mJZJhWagoLc
            apply(swfContainer.style, HAS_FLASH_THROTTLED_BUG && config.swfNoThrottle ? {
                height: "20px",
                width: "20px",
                position: "fixed",
                right: 0,
                top: 0
            } : {
                height: "1px",
                width: "1px",
                position: "absolute",
                overflow: "hidden",
                right: 0,
                top: 0
            });
            document.body.appendChild(swfContainer);
        }
        
        // create the object/embed
        var flashVars = "callback=flash_loaded" + encodeURIComponent(domain.replace(/[\-.]/g, "_"))
            + "&proto=" + global.location.protocol
            + "&domain=" + encodeURIComponent(getDomainName(global.location.href))
            + "&port=" + encodeURIComponent(getPort(global.location.href))
            + "&ns=" + encodeURIComponent(namespace);
        swfContainer.innerHTML = "<object height='20' width='20' type='application/x-shockwave-flash' id='" + id + "' data='" + url + "'>" +
        "<param name='allowScriptAccess' value='always'></param>" +
        "<param name='wmode' value='transparent'>" +
        "<param name='movie' value='" +
        url +
        "'></param>" +
        "<param name='flashvars' value='" +
        flashVars +
        "'></param>" +
        "<embed type='application/x-shockwave-flash' FlashVars='" +
        flashVars +
        "' allowScriptAccess='always' wmode='transparent' src='" +
        url +
        "' height='1' width='1'></embed>" +
        "</object>";
    }
    
    return (pub = {
        outgoing: function(message, domain, fn){
            swf.postMessage(config.channel, message.toString());
            if (fn) {
                fn();
            }
        },
        destroy: function(){
            try {
                swf.destroyChannel(config.channel);
            } 
            catch (e) {
            }
            swf = null;
            if (frame) {
                frame.parentNode.removeChild(frame);
                frame = null;
            }
        },
        onDOMReady: function(){
            
            targetOrigin = config.remote;
            
            // Prepare the code that will be run after the swf has been intialized
            easyXDM.Fn.set("flash_" + config.channel + "_init", function(){
                setTimeout(function(){
                    pub.up.callback(true);
                });
            });
            
            // set up the omMessage handler
            easyXDM.Fn.set("flash_" + config.channel + "_onMessage", onMessage);
            
            config.swf = resolveUrl(config.swf); // reports have been made of requests gone rogue when using relative paths
            var swfdomain = getDomainName(config.swf);
            var fn = function(){
                // set init to true in case the fn was called was invoked from a separate instance
                easyXDM.stack.FlashTransport[swfdomain].init = true;
                swf = easyXDM.stack.FlashTransport[swfdomain].swf;
                // create the channel
                swf.createChannel(config.channel, config.secret, getLocation(config.remote), config.isHost);
                
                if (config.isHost) {
                    // if Flash is going to be throttled and we want to avoid this
                    if (HAS_FLASH_THROTTLED_BUG && config.swfNoThrottle) {
                        apply(config.props, {
                            position: "fixed",
                            right: 0,
                            top: 0,
                            height: "20px",
                            width: "20px"
                        });
                    }
                    // set up the iframe
                    apply(config.props, {
                        src: appendQueryParameters(config.remote, {
                            xdm_e: getLocation(location.href),
                            xdm_c: config.channel,
                            xdm_p: 6, // 6 = FlashTransport
                            xdm_s: config.secret
                        }),
                        name: IFRAME_PREFIX + config.channel + "_provider"
                    });
                    frame = createFrame(config);
                }
            };
            
            if (easyXDM.stack.FlashTransport[swfdomain] && easyXDM.stack.FlashTransport[swfdomain].init) {
                // if the swf is in place and we are the consumer
                fn();
            }
            else {
                // if the swf does not yet exist
                if (!easyXDM.stack.FlashTransport[swfdomain]) {
                    // add the queue to hold the init fn's
                    easyXDM.stack.FlashTransport[swfdomain] = {
                        queue: [fn]
                    };
                    addSwf(swfdomain);
                }
                else {
                    easyXDM.stack.FlashTransport[swfdomain].queue.push(fn);
                }
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, getLocation, appendQueryParameters, createFrame, debug, un, on, apply, whenReady, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.PostMessageTransport
 * PostMessageTransport is a transport class that uses HTML5 postMessage for communication.<br/>
 * <a href="http://msdn.microsoft.com/en-us/library/ms644944(VS.85).aspx">http://msdn.microsoft.com/en-us/library/ms644944(VS.85).aspx</a><br/>
 * <a href="https://developer.mozilla.org/en/DOM/window.postMessage">https://developer.mozilla.org/en/DOM/window.postMessage</a>
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remote The remote domain to communicate with.
 */
easyXDM.stack.PostMessageTransport = function(config){
    var pub, // the public interface
 frame, // the remote frame, if any
 callerWindow, // the window that we will call with
 targetOrigin; // the domain to communicate with
    /**
     * Resolves the origin from the event object
     * @private
     * @param {Object} event The messageevent
     * @return {String} The scheme, host and port of the origin
     */
    function _getOrigin(event){
        if (event.origin) {
            // This is the HTML5 property
            return getLocation(event.origin);
        }
        if (event.uri) {
            // From earlier implementations 
            return getLocation(event.uri);
        }
        if (event.domain) {
            // This is the last option and will fail if the 
            // origin is not using the same schema as we are
            return location.protocol + "//" + event.domain;
        }
        throw "Unable to retrieve the origin of the event";
    }
    
    /**
     * This is the main implementation for the onMessage event.<br/>
     * It checks the validity of the origin and passes the message on if appropriate.
     * @private
     * @param {Object} event The messageevent
     */
    function _window_onMessage(event){
        var origin = _getOrigin(event);
        if (origin == targetOrigin && event.data.substring(0, config.channel.length + 1) == config.channel + " ") {
            pub.up.incoming(event.data.substring(config.channel.length + 1), origin);
        }
    }
    
    return (pub = {
        outgoing: function(message, domain, fn){
            callerWindow.postMessage(config.channel + " " + message, domain || targetOrigin);
            if (fn) {
                fn();
            }
        },
        destroy: function(){
            un(window, "message", _window_onMessage);
            if (frame) {
                callerWindow = null;
                frame.parentNode.removeChild(frame);
                frame = null;
            }
        },
        onDOMReady: function(){
            targetOrigin = getLocation(config.remote);
            if (config.isHost) {
                // add the event handler for listening
                var waitForReady = function(event){  
                    if (event.data == config.channel + "-ready") {
                        // replace the eventlistener
                        callerWindow = ("postMessage" in frame.contentWindow) ? frame.contentWindow : frame.contentWindow.document;
                        un(window, "message", waitForReady);
                        on(window, "message", _window_onMessage);
                        setTimeout(function(){
                            pub.up.callback(true);
                        }, 0);
                    }
                };
                on(window, "message", waitForReady);
                
                // set up the iframe
                apply(config.props, {
                    src: appendQueryParameters(config.remote, {
                        xdm_e: getLocation(location.href),
                        xdm_c: config.channel,
                        xdm_p: 1 // 1 = PostMessage
                    }),
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                frame = createFrame(config);
            }
            else {
                // add the event handler for listening
                on(window, "message", _window_onMessage);
                callerWindow = ("postMessage" in window.parent) ? window.parent : window.parent.document;
                callerWindow.postMessage(config.channel + "-ready", targetOrigin);
                
                setTimeout(function(){
                    pub.up.callback(true);
                }, 0);
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, getLocation, appendQueryParameters, createFrame, debug, apply, query, whenReady, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.FrameElementTransport
 * FrameElementTransport is a transport class that can be used with Gecko-browser as these allow passing variables using the frameElement property.<br/>
 * Security is maintained as Gecho uses Lexical Authorization to determine under which scope a function is running.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remote The remote document to communicate with.
 */
easyXDM.stack.FrameElementTransport = function(config){
    var pub, frame, send, targetOrigin;
    
    return (pub = {
        outgoing: function(message, domain, fn){
            send.call(this, message);
            if (fn) {
                fn();
            }
        },
        destroy: function(){
            if (frame) {
                frame.parentNode.removeChild(frame);
                frame = null;
            }
        },
        onDOMReady: function(){
            targetOrigin = getLocation(config.remote);
            
            if (config.isHost) {
                // set up the iframe
                apply(config.props, {
                    src: appendQueryParameters(config.remote, {
                        xdm_e: getLocation(location.href),
                        xdm_c: config.channel,
                        xdm_p: 5 // 5 = FrameElementTransport
                    }),
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                frame = createFrame(config);
                frame.fn = function(sendFn){
                    delete frame.fn;
                    send = sendFn;
                    setTimeout(function(){
                        pub.up.callback(true);
                    }, 0);
                    // remove the function so that it cannot be used to overwrite the send function later on
                    return function(msg){
                        pub.up.incoming(msg, targetOrigin);
                    };
                };
            }
            else {
                // This is to mitigate origin-spoofing
                if (document.referrer && getLocation(document.referrer) != query.xdm_e) {
                    window.top.location = query.xdm_e;
                }
                send = window.frameElement.fn(function(msg){
                    pub.up.incoming(msg, targetOrigin);
                });
                pub.up.callback(true);
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, undef, getLocation, appendQueryParameters, resolveUrl, createFrame, debug, un, apply, whenReady, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.NameTransport
 * NameTransport uses the window.name property to relay data.
 * The <code>local</code> parameter needs to be set on both the consumer and provider,<br/>
 * and the <code>remoteHelper</code> parameter needs to be set on the consumer.
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remoteHelper The url to the remote instance of hash.html - this is only needed for the host.
 * @namespace easyXDM.stack
 */
easyXDM.stack.NameTransport = function(config){
    
    var pub; // the public interface
    var isHost, callerWindow, remoteWindow, readyCount, callback, remoteOrigin, remoteUrl;
    
    function _sendMessage(message){
        var url = config.remoteHelper + (isHost ? "#_3" : "#_2") + config.channel;
        callerWindow.contentWindow.sendMessage(message, url);
    }
    
    function _onReady(){
        if (isHost) {
            if (++readyCount === 2 || !isHost) {
                pub.up.callback(true);
            }
        }
        else {
            _sendMessage("ready");
            pub.up.callback(true);
        }
    }
    
    function _onMessage(message){
        pub.up.incoming(message, remoteOrigin);
    }
    
    function _onLoad(){
        if (callback) {
            setTimeout(function(){
                callback(true);
            }, 0);
        }
    }
    
    return (pub = {
        outgoing: function(message, domain, fn){
            callback = fn;
            _sendMessage(message);
        },
        destroy: function(){
            callerWindow.parentNode.removeChild(callerWindow);
            callerWindow = null;
            if (isHost) {
                remoteWindow.parentNode.removeChild(remoteWindow);
                remoteWindow = null;
            }
        },
        onDOMReady: function(){
            isHost = config.isHost;
            readyCount = 0;
            remoteOrigin = getLocation(config.remote);
            config.local = resolveUrl(config.local);
            
            if (isHost) {
                // Register the callback
                easyXDM.Fn.set(config.channel, function(message){
                    if (isHost && message === "ready") {
                        // Replace the handler
                        easyXDM.Fn.set(config.channel, _onMessage);
                        _onReady();
                    }
                });
                
                // Set up the frame that points to the remote instance
                remoteUrl = appendQueryParameters(config.remote, {
                    xdm_e: config.local,
                    xdm_c: config.channel,
                    xdm_p: 2
                });
                apply(config.props, {
                    src: remoteUrl + '#' + config.channel,
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                remoteWindow = createFrame(config);
            }
            else {
                config.remoteHelper = config.remote;
                easyXDM.Fn.set(config.channel, _onMessage);
            }
            
            // Set up the iframe that will be used for the transport
            var onLoad = function(){
                // Remove the handler
                var w = callerWindow || this;
                un(w, "load", onLoad);
                easyXDM.Fn.set(config.channel + "_load", _onLoad);
                (function test(){
                    if (typeof w.contentWindow.sendMessage == "function") {
                        _onReady();
                    }
                    else {
                        setTimeout(test, 50);
                    }
                }());
            };
            
            callerWindow = createFrame({
                props: {
                    src: config.local + "#_4" + config.channel
                },
                onLoad: onLoad
            });
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, getLocation, createFrame, debug, un, on, apply, whenReady, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.HashTransport
 * HashTransport is a transport class that uses the IFrame URL Technique for communication.<br/>
 * <a href="http://msdn.microsoft.com/en-us/library/bb735305.aspx">http://msdn.microsoft.com/en-us/library/bb735305.aspx</a><br/>
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String/Window} local The url to the local file used for proxying messages, or the local window.
 * @cfg {Number} delay The number of milliseconds easyXDM should try to get a reference to the local window.
 * @cfg {Number} interval The interval used when polling for messages.
 */
easyXDM.stack.HashTransport = function(config){
    var pub;
    var me = this, isHost, _timer, pollInterval, _lastMsg, _msgNr, _listenerWindow, _callerWindow;
    var useParent, _remoteOrigin;
    
    function _sendMessage(message){
        if (!_callerWindow) {
            return;
        }
        var url = config.remote + "#" + (_msgNr++) + "_" + message;
        ((isHost || !useParent) ? _callerWindow.contentWindow : _callerWindow).location = url;
    }
    
    function _handleHash(hash){
        _lastMsg = hash;
        pub.up.incoming(_lastMsg.substring(_lastMsg.indexOf("_") + 1), _remoteOrigin);
    }
    
    /**
     * Checks location.hash for a new message and relays this to the receiver.
     * @private
     */
    function _pollHash(){
        if (!_listenerWindow) {
            return;
        }
        var href = _listenerWindow.location.href, hash = "", indexOf = href.indexOf("#");
        if (indexOf != -1) {
            hash = href.substring(indexOf);
        }
        if (hash && hash != _lastMsg) {
            _handleHash(hash);
        }
    }
    
    function _attachListeners(){
        _timer = setInterval(_pollHash, pollInterval);
    }
    
    return (pub = {
        outgoing: function(message, domain){
            _sendMessage(message);
        },
        destroy: function(){
            window.clearInterval(_timer);
            if (isHost || !useParent) {
                _callerWindow.parentNode.removeChild(_callerWindow);
            }
            _callerWindow = null;
        },
        onDOMReady: function(){
            isHost = config.isHost;
            pollInterval = config.interval;
            _lastMsg = "#" + config.channel;
            _msgNr = 0;
            useParent = config.useParent;
            _remoteOrigin = getLocation(config.remote);
            if (isHost) {
                apply(config.props, {
                    src: config.remote,
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                if (useParent) {
                    config.onLoad = function(){
                        _listenerWindow = window;
                        _attachListeners();
                        pub.up.callback(true);
                    };
                }
                else {
                    var tries = 0, max = config.delay / 50;
                    (function getRef(){
                        if (++tries > max) {
                            throw new Error("Unable to reference listenerwindow");
                        }
                        try {
                            _listenerWindow = _callerWindow.contentWindow.frames[IFRAME_PREFIX + config.channel + "_consumer"];
                        } 
                        catch (ex) {
                        }
                        if (_listenerWindow) {
                            _attachListeners();
                            pub.up.callback(true);
                        }
                        else {
                            setTimeout(getRef, 50);
                        }
                    }());
                }
                _callerWindow = createFrame(config);
            }
            else {
                _listenerWindow = window;
                _attachListeners();
                if (useParent) {
                    _callerWindow = parent;
                    pub.up.callback(true);
                }
                else {
                    apply(config, {
                        props: {
                            src: config.remote + "#" + config.channel + new Date(),
                            name: IFRAME_PREFIX + config.channel + "_consumer"
                        },
                        onLoad: function(){
                            pub.up.callback(true);
                        }
                    });
                    _callerWindow = createFrame(config);
                }
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.ReliableBehavior
 * This is a behavior that tries to make the underlying transport reliable by using acknowledgements.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The behaviors configuration.
 */
easyXDM.stack.ReliableBehavior = function(config){
    var pub, // the public interface
 callback; // the callback to execute when we have a confirmed success/failure
    var idOut = 0, idIn = 0, currentMessage = "";
    
    return (pub = {
        incoming: function(message, origin){
            var indexOf = message.indexOf("_"), ack = message.substring(0, indexOf).split(",");
            message = message.substring(indexOf + 1);
            
            if (ack[0] == idOut) {
                currentMessage = "";
                if (callback) {
                    callback(true);
                }
            }
            if (message.length > 0) {
                pub.down.outgoing(ack[1] + "," + idOut + "_" + currentMessage, origin);
                if (idIn != ack[1]) {
                    idIn = ack[1];
                    pub.up.incoming(message, origin);
                }
            }
            
        },
        outgoing: function(message, origin, fn){
            currentMessage = message;
            callback = fn;
            pub.down.outgoing(idIn + "," + (++idOut) + "_" + message, origin);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, debug, undef, removeFromStack*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.QueueBehavior
 * This is a behavior that enables queueing of messages. <br/>
 * It will buffer incoming messages and dispach these as fast as the underlying transport allows.
 * This will also fragment/defragment messages so that the outgoing message is never bigger than the
 * set length.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The behaviors configuration. Optional.
 * @cfg {Number} maxLength The maximum length of each outgoing message. Set this to enable fragmentation.
 */
easyXDM.stack.QueueBehavior = function(config){
    var pub, queue = [], waiting = true, incoming = "", destroying, maxLength = 0, lazy = false, doFragment = false;
    
    function dispatch(){
        if (config.remove && queue.length === 0) {
            removeFromStack(pub);
            return;
        }
        if (waiting || queue.length === 0 || destroying) {
            return;
        }
        waiting = true;
        var message = queue.shift();
        
        pub.down.outgoing(message.data, message.origin, function(success){
            waiting = false;
            if (message.callback) {
                setTimeout(function(){
                    message.callback(success);
                }, 0);
            }
            dispatch();
        });
    }
    return (pub = {
        init: function(){
            if (undef(config)) {
                config = {};
            }
            if (config.maxLength) {
                maxLength = config.maxLength;
                doFragment = true;
            }
            if (config.lazy) {
                lazy = true;
            }
            else {
                pub.down.init();
            }
        },
        callback: function(success){
            waiting = false;
            var up = pub.up; // in case dispatch calls removeFromStack
            dispatch();
            up.callback(success);
        },
        incoming: function(message, origin){
            if (doFragment) {
                var indexOf = message.indexOf("_"), seq = parseInt(message.substring(0, indexOf), 10);
                incoming += message.substring(indexOf + 1);
                if (seq === 0) {
                    if (config.encode) {
                        incoming = decodeURIComponent(incoming);
                    }
                    pub.up.incoming(incoming, origin);
                    incoming = "";
                }
            }
            else {
                pub.up.incoming(message, origin);
            }
        },
        outgoing: function(message, origin, fn){
            if (config.encode) {
                message = encodeURIComponent(message);
            }
            var fragments = [], fragment;
            if (doFragment) {
                // fragment into chunks
                while (message.length !== 0) {
                    fragment = message.substring(0, maxLength);
                    message = message.substring(fragment.length);
                    fragments.push(fragment);
                }
                // enqueue the chunks
                while ((fragment = fragments.shift())) {
                    queue.push({
                        data: fragments.length + "_" + fragment,
                        origin: origin,
                        callback: fragments.length === 0 ? fn : null
                    });
                }
            }
            else {
                queue.push({
                    data: message,
                    origin: origin,
                    callback: fn
                });
            }
            if (lazy) {
                pub.down.init();
            }
            else {
                dispatch();
            }
        },
        destroy: function(){
            destroying = true;
            pub.down.destroy();
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, undef, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.VerifyBehavior
 * This behavior will verify that communication with the remote end is possible, and will also sign all outgoing,
 * and verify all incoming messages. This removes the risk of someone hijacking the iframe to send malicious messages.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The behaviors configuration.
 * @cfg {Boolean} initiate If the verification should be initiated from this end.
 */
easyXDM.stack.VerifyBehavior = function(config){
    var pub, mySecret, theirSecret, verified = false;
    
    function startVerification(){
        mySecret = Math.random().toString(16).substring(2);
        pub.down.outgoing(mySecret);
    }
    
    return (pub = {
        incoming: function(message, origin){
            var indexOf = message.indexOf("_");
            if (indexOf === -1) {
                if (message === mySecret) {
                    pub.up.callback(true);
                }
                else if (!theirSecret) {
                    theirSecret = message;
                    if (!config.initiate) {
                        startVerification();
                    }
                    pub.down.outgoing(message);
                }
            }
            else {
                if (message.substring(0, indexOf) === theirSecret) {
                    pub.up.incoming(message.substring(indexOf + 1), origin);
                }
            }
        },
        outgoing: function(message, origin, fn){
            pub.down.outgoing(mySecret + "_" + message, origin, fn);
        },
        callback: function(success){
            if (config.initiate) {
                startVerification();
            }
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, undef, getJSON, debug, emptyFn, isArray */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.RpcBehavior
 * This uses JSON-RPC 2.0 to expose local methods and to invoke remote methods and have responses returned over the the string based transport stack.<br/>
 * Exposed methods can return values synchronous, asyncronous, or bet set up to not return anything.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} proxy The object to apply the methods to.
 * @param {Object} config The definition of the local and remote interface to implement.
 * @cfg {Object} local The local interface to expose.
 * @cfg {Object} remote The remote methods to expose through the proxy.
 * @cfg {Object} serializer The serializer to use for serializing and deserializing the JSON. Should be compatible with the HTML5 JSON object. Optional, will default to JSON.
 */
easyXDM.stack.RpcBehavior = function(proxy, config){
    var pub, serializer = config.serializer || getJSON();
    var _callbackCounter = 0, _callbacks = {};
    
    /**
     * Serializes and sends the message
     * @private
     * @param {Object} data The JSON-RPC message to be sent. The jsonrpc property will be added.
     */
    function _send(data){
        data.jsonrpc = "2.0";
        pub.down.outgoing(serializer.stringify(data));
    }
    
    /**
     * Creates a method that implements the given definition
     * @private
     * @param {Object} The method configuration
     * @param {String} method The name of the method
     * @return {Function} A stub capable of proxying the requested method call
     */
    function _createMethod(definition, method){
        var slice = Array.prototype.slice;
        
        return function(){
            var l = arguments.length, callback, message = {
                method: method
            };
            
            if (l > 0 && typeof arguments[l - 1] === "function") {
                //with callback, procedure
                if (l > 1 && typeof arguments[l - 2] === "function") {
                    // two callbacks, success and error
                    callback = {
                        success: arguments[l - 2],
                        error: arguments[l - 1]
                    };
                    message.params = slice.call(arguments, 0, l - 2);
                }
                else {
                    // single callback, success
                    callback = {
                        success: arguments[l - 1]
                    };
                    message.params = slice.call(arguments, 0, l - 1);
                }
                _callbacks["" + (++_callbackCounter)] = callback;
                message.id = _callbackCounter;
            }
            else {
                // no callbacks, a notification
                message.params = slice.call(arguments, 0);
            }
            if (definition.namedParams && message.params.length === 1) {
                message.params = message.params[0];
            }
            // Send the method request
            _send(message);
        };
    }
    
    /**
     * Executes the exposed method
     * @private
     * @param {String} method The name of the method
     * @param {Number} id The callback id to use
     * @param {Function} method The exposed implementation
     * @param {Array} params The parameters supplied by the remote end
     */
    function _executeMethod(method, id, fn, params){
        if (!fn) {
            if (id) {
                _send({
                    id: id,
                    error: {
                        code: -32601,
                        message: "Procedure not found."
                    }
                });
            }
            return;
        }
        
        var success, error;
        if (id) {
            success = function(result){
                success = emptyFn;
                _send({
                    id: id,
                    result: result
                });
            };
            error = function(message, data){
                error = emptyFn;
                var msg = {
                    id: id,
                    error: {
                        code: -32099,
                        message: message
                    }
                };
                if (data) {
                    msg.error.data = data;
                }
                _send(msg);
            };
        }
        else {
            success = error = emptyFn;
        }
        // Call local method
        if (!isArray(params)) {
            params = [params];
        }
        try {
            var result = fn.method.apply(fn.scope, params.concat([success, error]));
            if (!undef(result)) {
                success(result);
            }
        } 
        catch (ex1) {
            error(ex1.message);
        }
    }
    
    return (pub = {
        incoming: function(message, origin){
            var data = serializer.parse(message);
            if (data.method) {
                // A method call from the remote end
                if (config.handle) {
                    config.handle(data, _send);
                }
                else {
                    _executeMethod(data.method, data.id, config.local[data.method], data.params);
                }
            }
            else {
                // A method response from the other end
                var callback = _callbacks[data.id];
                if (data.error) {
                    if (callback.error) {
                        callback.error(data.error);
                    }
                }
                else if (callback.success) {
                    callback.success(data.result);
                }
                delete _callbacks[data.id];
            }
        },
        init: function(){
            if (config.remote) {
                // Implement the remote sides exposed methods
                for (var method in config.remote) {
                    if (config.remote.hasOwnProperty(method)) {
                        proxy[method] = _createMethod(config.remote[method], method);
                    }
                }
            }
            pub.down.init();
        },
        destroy: function(){
            for (var method in config.remote) {
                if (config.remote.hasOwnProperty(method) && proxy.hasOwnProperty(method)) {
                    delete proxy[method];
                }
            }
            pub.down.destroy();
        }
    });
};
module.exports = easyXDM;
})(window, document, location, window.setTimeout, decodeURIComponent, encodeURIComponent);

},{}],2:[function(require,module,exports){
/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
;!function(undefined) {

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
      return (listeners.length > 0) || !!this._all;
    }
    else {
      return !!this._all;
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

    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if(!this._all) {
      this._all = [];
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

  if (typeof define === 'function' && define.amd) {
     // AMD. Register as an anonymous module.
    define(function() {
      return EventEmitter;
    });
  } else if (typeof exports === 'object') {
    // CommonJS
    exports.EventEmitter2 = EventEmitter;
  }
  else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
}();

},{}],3:[function(require,module,exports){
var jQuery = require('jquery');

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

},{"jquery":undefined}],4:[function(require,module,exports){
var F2 = require('./F2');
var jQuery = require('jquery');

// Token used when adding, removing, or triggering handlers
var _containerToken = F2.guid();
var _f2Token = F2.guid();

var _handlerCollection = {
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
  appRender: function(appConfig, appHtml) {
    // If no app root is defined use the app's outer most node
    if (F2.isNativeDOMNode(appConfig.root)) {
      jQuery(appConfig.root).append(appHtml);
    } else {
      appConfig.root = jQuery(appHtml).get(0);
    }

    document.body.appendChild(appConfig.root);
  },
  appDestroy: function(appInstance) {
    if (appInstance.app && appInstance.app.destroy) {
      if (typeof appInstance.app.destroy === 'function') {
        appInstance.app.destroy();
      } else {
        F2.log(appInstance.config.appId + ' has a destroy property, but destroy is not of type function and as such will not be executed.');
      }
    }

    jQuery(appInstance.config.root).fadeOut(500, function() {
      jQuery(this).remove();
    });
  }
};

function _createHandler(token, namespace, fnOrNode, domNodeAppropriate) {
  _validateToken(token);

  var handler = {
    domNode: null,
    func: null,
    namespace: namespace
  };

  if (F2.isNativeDOMNode(fnOrNode)) {
    handler.domNode = fnOrNode;
  } else if (typeof fnOrNode === 'function') {
    handler.func = fnOrNode;
  }

  if (!handler.func && !handler.domNode) {
    throw new Error('Invalid or null argument passed. Handler will not be added to collection. A valid dom element or callback function is required.');
  }

  if (handler.domNode && !domNodeAppropriate) {
    throw new Error('Invalid argument passed. Handler will not be added to collection. A callback function is required for this event type.');
  }

  return handler;
}

// Token must match F2 or container
function _validateToken(token) {
  if (_containerToken !== token && _f2Token !== token) {
    throw new Error('Invalid token passed. Please verify that you have correctly received and stored token from F2.AppHandlers.getToken().');
  }
}

// Token must match F2
function _validateF2Token(token) {
  if (token !== _f2Token) {
    throw new Error('Token passed is invalid. Only F2 is allowed to call F2.AppHandlers.__trigger().');
  }
}

function _filterHandlersByNamespace(handlers, namespace) {
  var newHandlers = handlers.slice();

  for (var i = newHandlers.length; i >= 0; i--) {
    if (!newHandlers[i] || (newHandlers[i].namespace && newHandlers[i].namespace.toLowerCase() === namespace)) {
      newHandlers.splice(i, 1);
    }
  }

  return newHandlers;
}

function _removeHandler(token, eventKey, namespace) {
  _validateToken(token);

  if (namespace) {
    namespace = namespace.toLowerCase();

    if (eventKey && eventKey in _handlerCollection) {
      _handlerCollection[eventKey] = _filterHandlersByNamespace(_handlerCollection[eventKey], namespace);
    } else {
      for (var key in _handlerCollection) {
        _removeHandler(token, key, namespace);
      }
    }
  } else if (eventKey) {
    _handlerCollection[eventKey] = [];
  }
}

function _parseEventKey(eventKey) {
  var namespace = '';

  if (eventKey.indexOf('.') !== -1) {
    var eventParts = eventKey.split('.');
    eventKey = eventParts[0];
    namespace = eventParts[1];
  }

  return {
    key: eventKey,
    namespace: namespace
  };
}

/**
  The new `AppHandlers` functionality provides Container Developers a higher
  level of control over configuring app rendering and interaction.

  <p class="alert alert-block alert-warning">
  The addition of `F2.AppHandlers` replaces the previous {{#crossLink "F2.ContainerConfig"}}{{/crossLink}} properties `beforeAppRender`, `appRender`, and `afterAppRender`. These methods were deprecated&mdash;but not removed&mdash;in version 1.2. They will be permanently removed in a future version of F2.
  </p>

  <p class="alert alert-block alert-info">
  Starting with F2 version 1.2, `AppHandlers` is the preferred method for
  Container Developers to manage app layout.
  </p>

  ### Order of Execution

  **App Rendering**

  0. {{#crossLink "F2/registerApps"}}F2.registerApps(){{/crossLink}} method is called by the Container Developer and the following methods are run for *each* {{#crossLink "F2.AppConfig"}}{{/crossLink}} passed.
  1. **'appCreateRoot'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_CREATE\_ROOT*) handlers are fired in the order they were attached.
  2. **'appRenderBefore'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_RENDER\_BEFORE*) handlers are fired in the order they were attached.
  3. Each app's `manifestUrl` is requested asynchronously; on success the following methods are fired.
  3. **'appRender'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_RENDER*) handlers are fired in the order they were attached.
  4. **'appRenderAfter'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_RENDER\_AFTER*) handlers are fired in the order they were attached.

  **App Removal**

  0. {{#crossLink "F2/removeApp"}}F2.removeApp(){{/crossLink}} with a specific {{#crossLink "F2.AppConfig/instanceId "}}{{/crossLink}} or {{#crossLink "F2/removeAllApps"}}F2.removeAllApps(){{/crossLink}} method is called by the Container Developer and the following methods are run.
  1. **'appDestroyBefore'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_DESTROY\_BEFORE*) handlers are fired in the order they were attached.
  2. **'appDestroy'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_DESTROY*) handlers are fired in the order they were attached.
  3. **'appDestroyAfter'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_DESTROY\_AFTER*) handlers are fired in the order they were attached.

  **Error Handling**

  0. **'appScriptLoadFailed'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_SCRIPT\_LOAD\_FAILED*) handlers are fired in the order they were attached.

  @class F2.AppHandlers
*/
module.exports = {
  /**
    Allows Container Developer to retrieve a unique token which must be
    passed to all `on` and `off` methods. This function will self destruct
    and can only be called one time. Container Developers must store the
    return value inside of a closure.
    @method getToken
    @returns {string} A one-time container token
  */
  getToken: function() {
    /**
      Delete this method for security that way only the container has
      access to the token 1 time. Kind of Ethan Hunt-ish, this message will
      self-destruct immediately.
      */
    delete this.getToken;
    return _containerToken;
  },
  /**
    Allows F2 to get a token internally. Token is required to call
    {{#crossLink "F2.AppHandlers/\_\_trigger:method"}}{{/crossLink}}. This
    function will self destruct to eliminate other sources from using the
    {{#crossLink "F2.AppHandlers/\_\_trigger:method"}}{{/crossLink}} and
    additional internal methods.
    @method __f2GetToken
    @private
    @returns {string} A one-time container token
  */
  __f2GetToken: function() {
    /*
       Delete this method for security that way only the container has
       access to the token 1 time. Kind of Ethan Hunt-ish, this message will
       self-destruct immediately.
       */
    delete this.__f2GetToken;
    return _f2Token;
  },
  /**
    Allows F2 to trigger specific events internally.
    @method __trigger
    @private
    @chainable
    @param {String} token The token received from {{#crossLink "F2.AppHandlers/\_\_f2GetToken:method"}}{{/crossLink}}.
    @param {String} eventKey The event to fire. The complete list of event
    keys is available in {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
    @returns {object} The F2 instance for chaining purposes
  */
  __trigger: function(token, eventKey) {
    _validateF2Token(token);

    if (!_handlerCollection[eventKey]) {
      throw new Error('Invalid EventKey passed. Check your inputs and try again.');
    }

    var callbackArgs = Array.prototype.slice.call(arguments, 2);

    if (!_handlerCollection[eventKey].length && _defaultMethods[eventKey]) {
      _defaultMethods[eventKey].apply(F2, callbackArgs);
    } else {
      for (var i = 0; i < _handlerCollection[eventKey].length; i++) {
        var handler = _handlerCollection[eventKey][i];

        // Check for appRender
        if (handler.domNode && arguments.length >= 4) {
          var appConfig = arguments[2];
          var appHtml = arguments[3];

          if (appConfig.root) {
            jQuery(appConfig.root).append(appHtml);
          } else {
            appConfig.root = jQuery(appHtml).get(0);
          }

          jQuery(handler.domNode).append(appConfig.root);
        } else {
          handler.func.apply(F2, callbackArgs);
        }
      }
    }

    return this;
  },
  /**
    Allows Container Developer to add listener method that will be triggered
    when a specific event occurs.
    @method on
    @chainable
    @param {String} token The token received from
    {{#crossLink "F2.AppHandlers/getToken:method"}}{{/crossLink}}.
    @param {String} eventKey{.namespace} The event key used to determine
    which event to attach the listener to. The namespace is useful for
    removal purposes. At this time it does not affect when an event is fired.
    Complete list of event keys available in
    {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
    @param {Function} listener A function that will be triggered when a
    specific event occurs. For detailed argument definition refer to
    {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
    @returns {object} The F2 instance for chaining purposes
    @example
    var token = F2.AppHandlers.getToken();
    F2.AppHandlers.on(token, 'appRenderBefore', function() {
    F2.log('before app rendered!');
    });
    @example
    var token = F2.AppHandlers.getToken();
    F2.AppHandlers.on(token, 'appRenderBefore.myNamespace', function() {
    F2.log('before app rendered!');
    });
  */
  on: function(token, eventKey, listener) {
    if (!eventKey) {
      throw new Error('eventKey must be of type string and not null. For available appHandlers check F2.Constants.AppHandlers.');
    }

    var event = _parseEventKey(eventKey);

    if (!_handlerCollection[event.key]) {
      throw new Error('Invalid eventKey passed. Check your inputs and try again.');
    }

    var isAppRender = (event.key === 'appRender');
    var handler = _createHandler(token, event.namespace, listener, isAppRender);
    _handlerCollection[event.key].push(handler);

    return this;
  },
  /**
    Allows Container Developer to remove listener methods for specific events
    @method off
    @chainable
    @param {String} token The token received from {{#crossLink "F2.AppHandlers/getToken:method"}}{{/crossLink}}.
    @param {String} eventKey{.namespace} The event key used to determine
    which event to attach the listener to. If no namespace is provided all
    listeners for the specified event type will be removed. Complete list
    available in {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
    @returns {object} The F2 instance for chaining purposes
    @example
    var token = F2.AppHandlers.getToken();
    F2.AppHandlers.off(token, 'appRenderBefore');
  */
  off: function(token, eventKey) {
    if (!eventKey) {
      throw new Error('eventKey must be of type string and not null. For available appHandlers check F2.Constants.AppHandlers.');
    }

    var event = _parseEventKey(eventKey);

    if (!_handlerCollection[event.key]) {
      throw new Error('Invalid EventKey passed. Check your inputs and try again.');
    }

    _removeHandler(token, event.key, event.namespace);

    return this;
  }
};

},{"./F2":3,"jquery":undefined}],5:[function(require,module,exports){
var container = require('./container');
var jQuery = require('jquery');

var autoloadEls = [];

function add(els) {
  if (!els || !els.length) {
    return;
  }

  for (var i = 0, len = els.length; i < len; i++) {
    if (els[i]) {
      autoloadEls.push(els[i]);
    }
  }
}

// Autoload placeholders
jQuery(function() {
  // Support id-based autoload
  add([document.getElementById('f2-autoload')]);

  // Support class/attribute based autoload
  if (document.querySelectorAll) {
    add(document.querySelectorAll('[data-f2-autoload]'));
    add(document.querySelectorAll('.f2-autoload'));
  }

  // If elements were found, auto-init F2 and load any placeholders
  if (autoloadEls.length) {
    container.init();

    for (var i = 0, len = autoloadEls.length; i < len; i++) {
      container.loadPlaceholders(autoloadEls[i]);
    }
  }
});

},{"./container":20,"jquery":undefined}],6:[function(require,module,exports){
/**
  The App Class is an optional class that can be namespaced onto the
  {{#crossLink "F2\Apps"}}{{/crossLink}} namespace. The
  [F2 Docs](../../app-development.html#app-class) has more information on the
  usage of the App Class.
  @class F2.App
  @constructor
  @param {F2.AppConfig} appConfig The F2.AppConfig object for the app
  @param {F2.AppManifest.AppContent} appContent The F2.AppManifest.AppContent
  object
  @param {Element} root The root DOM Element for the app
*/
module.exports = function(appConfig, appContent, root) {
  return {
    /**
      An optional init function that will automatically be called when
      F2.{{#crossLink "F2\registerApps"}}{{/crossLink}} is called.
      @method init
      @optional
    */
    init: function() {}
  };
};

},{}],7:[function(require,module,exports){
/**
  The AppConfig object represents an app's meta data
  @class F2.AppConfig
*/
module.exports = {
  /**
    The unique ID of the app. More information can be found
    [here](../../app-development.html#f2-appid).
    @property appId
    @type string
    @required
  */
  appId: '',
  /**
    An object that represents the context of an app.
    @property context
    @type object
  */
  context: {},
  /**
    True if the app should be requested in a single request with other apps.
    @property enableBatchRequests
    @type bool
    @default false
  */
  enableBatchRequests: false,
  /**
    The height of the app. The initial height will be pulled from the
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} object, but later modified by
    calling F2.UI.{{#crossLink "F2.UI/updateHeight"}}{{/crossLink}}. This is
    used for secure apps to be able to set the initial height of the iframe.
    @property height
    @type int
  */
  height: 0,
  /**
    The unique runtime ID of the app.
    **This property is populated during the
    F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process**
    @property instanceId
    @type string
  */
  instanceId: '',
  /**
    True if the app will be loaded in an iframe. This property will be true
    if the {{#crossLink "F2.AppConfig"}}{{/crossLink}} object sets
    `isSecure = true`. It will also be true if the
    [container](../../container-development.html) has made the decision to
    run apps in iframes.
    @property isSecure
    @type bool
    @default false
  */
  isSecure: false,
  /**
    The language and region specification for this container represented as
    an IETF-defined standard language tag, e.g. `"en-us"` or `"de-de"`. This
    is passed during the F2.{{#crossLink "F2/registerApps"}}{{/crossLink}}
    process.
    @property containerLocale
    @type string
    @default null
    @since 1.4.0
  */
  containerLocale: null,
  /**
    The languages and regions supported by this app represented as an array
    of IETF-defined standard language tags, e.g. `["en-us","de-de"]`.
    @property localeSupport
    @type array
    @default []
    @since 1.4.0
  */
  localeSupport: [],
  /**
    The url to retrieve the {{#crossLink "F2.AppManifest"}}{{/crossLink}}
    object.
    @property manifestUrl
    @type string
    @required
  */
  manifestUrl: '',
  /**
    The recommended maximum width in pixels that this app should be run. **It
    is up to the [container](../../container-development.html) to implement
    the logic to prevent an app from being run when the maxWidth requirements
    are not met.**
    @property maxWidth
    @type int
  */
  maxWidth: 0,
  /**
    The recommended minimum grid size that this app should be run. This value
    corresponds to the 12-grid system that is used by the
    [container](../../container-development.html). This property should be
    set by apps that require a certain number of columns in their layout.
    @property minGridSize
    @type int
    @default 4
  */
  minGridSize: 4,
  /**
    The recommended minimum width in pixels that this app should be run.
    **It is up to the [container](../../container-development.html) to
    implement the logic to prevent an app from being run when the minWidth
    requirements are not met.
    @property minWidth
    @type int
    @default 300
  */
  minWidth: 300,
  /**
    The name of the app.
    @property name
    @type string
    @required
  */
  name: '',
  /**
    The root DOM element that contains the app.
    **This property is populated during the
    F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process.**
    @property root
    @type Element
  */
  root: undefined,
  /**
    The instance of F2.UI providing easy access to F2.UI methods.
    **This property is populated during the
    F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process.**
    @property ui
    @type F2.UI
  */
  ui: undefined,
  /**
    The views that this app supports. Available views are defined in
    {{#crossLink "F2.Constants.Views"}}{{/crossLink}}. The presence of a view
    can be checked via F2.{{#crossLink "F2/inArray"}}{{/crossLink}}:
    F2.inArray(F2.Constants.Views.SETTINGS, app.views).
    @property views
    @type Array
  */
  views: []
};

},{}],8:[function(require,module,exports){
/**
  The AppContent object.
  @class F2.AppManifest.AppContent
*/
module.exports = {
  /**
    Arbitrary data to be passed along with the app.
    @property data
    @type object
    @optional
  */
  data: {},
  /**
    The string of HTML representing the app.
    @property html
    @type string
    @required
  */
  html: '',
  /**
    A status message.
    @property status
    @type string
    @optional
  */
  status: ''
};

},{}],9:[function(require,module,exports){
/**
  The assets needed to render an app on the page.
  @class F2.AppManifest
*/
module.exports = {
  /**
    The array of {{#crossLink "F2.AppManifest.AppContent"}}{{/crossLink}}
    objects.
    @property apps
    @type Array
    @required
  */
  apps: [],
  /**
    Any inline javascript tha should initially be run.
    @property inlineScripts
    @type Array
    @optional
  */
  inlineScripts: [],
  /**
    Urls to javascript files required by the app.
    @property scripts
    @type Array
    @optional
  */
  scripts: [],
  /**
    Urls to CSS files required by the app.
    @property styles
    @type Array
    @optional
  */
  styles: []
};

},{}],10:[function(require,module,exports){
var uiConfig = require('./uiConfig');
var xhrConfig = require('./xhrConfig');

/**
  An object containing configuration information for the
  [container](../../container-development.html).
  @class F2.ContainerConfig
*/
module.exports = {
  /**
    Allows the [container](../../container-development.html) to override how
    an app's html is inserted into the page. The function should accept an
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} object and also a string of
    html.
    @method afterAppRender
    @deprecated This has been replaced with
    {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @param {string} html The string of html representing the app
    @return {Element} The DOM Element surrounding the app
  */
  afterAppRender: null,
  /**
    Allows the [container](../../container-development.html) to wrap an app
    in extra html. The function should accept an
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} object and also a string of
    html. The extra html can provide links to edit app settings and remove an
    app from the container. See
    {{#crossLink "F2.Constants.Css"}}{{/crossLink}} for CSS classes that
    should be applied to elements.
    @method appRender
    @deprecated This has been replaced with
    {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @param {string} html The string of html representing the app
  */
  appRender: null,
  /**
    Allows the container to render html for an app before the AppManifest for
    an app has loaded. This can be useful if the design calls for loading
    icons to appear for each app before each app is loaded and rendered to
    the page.
    @method beforeAppRender
    @deprecated This has been replaced with
    {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @return {Element} The DOM Element surrounding the app
  */
  beforeAppRender: null,
  /**
    True to enable debug mode in F2.js. Adds additional logging, resource
    cache busting, etc.
    @property debugMode
    @type bool
    @default false
  */
  debugMode: false,
  /**
    The default language and region specification for this container
    represented as an IETF-defined standard language tag, e.g. `"en-us"` or
    `"de-de"`. This value is passed to each app registered as
    `containerLocale`.
    @property locale
    @type string
    @default null
    @since 1.4.0
  */
  locale: null,
  /**
    Milliseconds before F2 fires callback on script resource load errors. Due
    to issue with the way Internet Explorer attaches load events to script
    elements, the error event doesn't fire.
    @property scriptErrorTimeout
    @type milliseconds
    @default 7000 (7 seconds)
  */
  scriptErrorTimeout: 7000,
  /**
    Tells the container that it is currently running within a secure app page.
    @property isSecureAppPage
    @type bool
  */
  isSecureAppPage: false,
  /**
    Allows the container to specify which page is used when loading a secure
    app. The page must reside on a different domain than the container.
    @property secureAppPagePath
    @type string
    @for F2.ContainerConfig
  */
  secureAppPagePath: '',
  /**
    Specifies what views a container will provide buttons or links to.
    Generally, the views will be switched via buttons or links in the app's
    header.
    @property supportedViews
    @type Array
    @required
  */
  supportedViews: [],
  UI: uiConfig,
  xhr: xhrConfig,
  /**
    Allows the container to override the script loader which requests
    dependencies defined in the {{#crossLink "F2.AppManifest"}}{{/crossLink}}.
    @method loadScripts
    @param {Array} scripts Script file urls to be loaded
    @param {Array} inlines Inline JavaScript to be run
    @param {Function} callback Should be called when loading is complete
    @example
      F2.init({
        loadScripts: function(scripts, inlines, callback) {
          // Load scripts using $.load() for each script or require(scripts)
          callback();
        }
      });
  */
  loadScripts: function(scripts, inlines, callback) {},
  /**
    Allows the container to override the stylesheet loader which requests
    dependencies defined in the {{#crossLink "F2.AppManifest"}}{{/crossLink}}.
    @method loadStyles
    @param {Array} styles CSS file urls to be loaded
    @param {Function} callback Should be called when loading is complete
    @example
      F2.init({
        loadStyles: function(styles, callback) {
          // Load styles using $.load() for each stylesheet or another method
          callback();
        }
      });
  */
  loadStyles: function(styles, callback) {}
};

},{"./uiConfig":12,"./xhrConfig":13}],11:[function(require,module,exports){
var app = require('./app');
var appConfig = require('./appConfig');
var appContent = require('./appContent');
var appManifest = require('./appManifest');
var containerConfig = require('./containerConfig');

module.exports = {
  App: app,
  AppConfig: appConfig,
  AppContent: appContent,
  AppManifest: appManifest,
  ContainerConfig: containerConfig
};

},{"./app":6,"./appConfig":7,"./appContent":8,"./appManifest":9,"./containerConfig":10}],12:[function(require,module,exports){
/**
  An object containing configuration defaults for F2.UI.
  @class F2.ContainerConfig.UI
*/
module.exports = {
  /**
    An object containing configuration defaults for the
    F2.UI.{{#crossLink "F2.UI/showMask"}}{{/crossLink}} and
    F2.UI.{{#crossLink "F2.UI/hideMask"}}{{/crossLink}} methods.
    @class F2.ContainerConfig.UI.Mask
  */
  Mask: {
    /**
      The backround color of the overlay.
      @property backgroundColor
      @type string
      @default #FFF
    */
    backgroundColor: '#FFF',
    /**
      The path to the loading icon.
      @property loadingIcon
      @type string
    */
    loadingIcon: '',
    /**
      The opacity of the background overlay.
      @property opacity
      @type int
      @default 0.6
    */
    opacity: 0.6,
    /**
      Do not use inline styles for mask functinality. Instead classes will
      be applied to the elements and it is up to the container provider to
      implement the class definitions.
      @property useClasses
      @type bool
      @default false
    */
    useClasses: false,
    /**
      The z-index to use for the overlay
      @property zIndex
      @type int
      @default 2
    */
    zIndex: 2
  }
};

},{}],13:[function(require,module,exports){
/**
  Allows the container to override individual parts of the AppManifest
  request. See properties and methods with the `xhr.` prefix.
  @property xhr
  @type Object
  @example
    F2.init({
      xhr: {
        url: function(url, appConfigs) {
          return 'http://example.com/proxy.php?url=' + encocdeURIComponent(url);
        }
      }
    });
*/
module.exports = {
  /**
    Allows the container to override the request data type (JSON or JSONP)
    that is used for the request.
    @method xhr.dataType
    @param {string} url The manifest url
    @param {Array} appConfigs An array of
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects
    @return {string} The request data type that should be used
    @example
      F2.init({
        xhr: {
          dataType: function(url) {
            return F2.isLocalRequest(url) ? 'json' : 'jsonp';
          },
          type: function(url) {
            return F2.isLocalRequest(url) ? 'POST' : 'GET';
          }
        }
      });
  */
  dataType: null,
  /**
    Allows the container to override the request method that is used (just
    like the `type` parameter to `jQuery.ajax()`.
    @method xhr.type
    @param {string} url The manifest url
    @param {Array} appConfigs An array of
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects
    @return {string} The request method that should be used
    @example
      F2.init({
        xhr: {
          dataType: function(url) {
            return F2.isLocalRequest(url) ? 'json' : 'jsonp';
          },
          type: function(url) {
            return F2.isLocalRequest(url) ? 'POST' : 'GET';
          }
        }
      });
  */
  type: null,
  /**
    Allows the container to override the url that is used to request an
    app's F2.{{#crossLink "F2.AppManifest"}}{{/crossLink}}.
    @method xhr.url
    @param {string} url The manifest url
    @param {Array} appConfigs An array of
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects
    @return {string} The url that should be used for the request
    @example
      F2.init({
        xhr: {
          url: function(url, appConfigs) {
            return 'http://example.com/proxy.php?url=' + encocdeURIComponent(url);
          }
        }
      });
  */
  url: null
};

},{}],14:[function(require,module,exports){
/**
  A convenient collection of all available appHandler events.
  @class F2.Constants.AppHandlers
*/
module.exports = {
  /**
    Equivalent to `appCreateRoot`. Identifies the create root method for use
    in AppHandlers.on/off. When bound using
    {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the
    listener function passed will receive the following argument(s):
    ({{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}}).
    @property APP_CREATE_ROOT
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_CREATE_ROOT,
        function(appConfig) {
          // If you want to create a custom root. By default F2 uses the app's outermost HTML element.
          // The app's html is not available until after the manifest is retrieved so this logic occurs in F2.Constants.AppHandlers.APP_RENDER
          appConfig.root = jQuery('<section></section>').get(0);
        }
      );
  */
  APP_CREATE_ROOT: 'appCreateRoot',
  /**
    Equivalent to `appRenderBefore`. Identifies the before app render method
    for use in AppHandlers.on/off. When bound using
    {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the
    listener function passed will receive the following argument(s):
    ({{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}}).
    @property APP_RENDER_BEFORE
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_RENDER_BEFORE,
        function(appConfig) {
          F2.log(appConfig);
        }
      );
  */
  APP_RENDER_BEFORE: 'appRenderBefore',
  /**
    Equivalent to `appRender`. Identifies the app render method for use in
    AppHandlers.on/off. When bound using
    {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the
    listener function passed will receive the following argument(s):
    ({{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}},
    [appHtml](../../app-development.html#app-design)).
    @property APP_RENDER
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_RENDER,
        function(appConfig, appHtml) {
          var $root;

          // If no app root is defined use the app's outer most node
          if (!F2.isNativeDOMNode(appConfig.root)) {
            appConfig.root = jQuery(appHtml).get(0);
            // Get a handle on the root in jQuery
            $root = jQuery(appConfig.root);
          } else {
            // Get a handle on the root in jQuery
            $root = jQuery(appConfig.root);
            // Append the app html to the root
            $root.append(appHtml);
          }

          // Append the root to the body by default.
          jQuery('body').append($root);
        }
      );
  */
  APP_RENDER: 'appRender',
  /**
    Equivalent to `appRenderAfter`. Identifies the after app render method
    for use in AppHandlers.on/off. When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}}
    the listener function passed will receive the following argument(s):
    ({{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}})
    @property APP_RENDER_AFTER
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_RENDER_AFTER,
        function(appConfig) {
          F2.log(appConfig);
        }
      );
  */
  APP_RENDER_AFTER: 'appRenderAfter',
  /**
    Equivalent to `appDestroyBefore`. Identifies the before app destroy
    method for use in AppHandlers.(on|off). When bound using
    {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the
    listener function passed will receive the following argument(s):
    (appInstance).
    @property APP_DESTROY_BEFORE
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
        function(appInstance) {
          F2.log(appInstance);
        }
      );
  */
  APP_DESTROY_BEFORE: 'appDestroyBefore',
  /**
    Equivalent to `appDestroy`. Identifies the app destroy method for use in
    AppHandlers.on/off. When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}}
    the listener function passed will receive the following argument(s):
    (appInstance)
    @property APP_DESTROY
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_DESTROY,
        function(appInstance) {
          // Call the apps destroy method, if it has one
          if (appInstance && appInstance.app && appInstance.app.destroy && typeof(appInstance.app.destroy) == 'function') {
            appInstance.app.destroy();
          } else if (appInstance && appInstance.app && appInstance.app.destroy) {
            F2.log(appInstance.config.appId + ' has a destroy property, but destroy is not of type function and as such will not be executed.');
          }

          // Fade out and remove the root
          jQuery(appInstance.config.root).fadeOut(500, function() {
            jQuery(this).remove();
          });
        }
      );
  */
  APP_DESTROY: 'appDestroy',
  /**
    Equivalent to `appDestroyAfter`. Identifies the after app destroy method
    for use in AppHandlers.on/off. When bound using
    {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the
    listener function passed will receive the following argument(s):
    (appInstance)
    @property APP_DESTROY_AFTER
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_DESTROY_AFTER,
        function(appInstance) {
          F2.log(appInstance);
        }
      );
  */
  APP_DESTROY_AFTER: 'appDestroyAfter',
  /**
    Equivalent to `appScriptLoadFailed`. Identifies the app script load
    failed method for use in AppHandlers.on/off. When bound using
    {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}}
    the listener function passed will receive the following argument(s):
    ({{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}}, scriptInfo)
    @property APP_SCRIPT_LOAD_FAILED
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
        function(appConfig, scriptInfo) {
          F2.log(appConfig.appId);
        }
      );
  */
  APP_SCRIPT_LOAD_FAILED: 'appScriptLoadFailed'
};

},{}],15:[function(require,module,exports){
/**
  CSS class constants
  @class F2.Constants.Css
*/
module.exports = {
  /**
    The APP class should be applied to the DOM Element that surrounds the
    entire app, including any extra html that surrounds the APP\_CONTAINER
    that is inserted by the container. See the
    {{#crossLink "F2.ContainerConfig"}}{{/crossLink}} object.
    @property APP
    @type string
    @static
    @final
  */
  APP: 'f2-app',
  /**
    The APP\_CONTAINER class should be applied to the outermost DOM Element
    of the app.
    @property APP_CONTAINER
    @type string
    @static
    @final
  */
  APP_CONTAINER: 'f2-app-container',
  /**
    The APP\_TITLE class should be applied to the DOM Element that contains
    the title for an app. If this class is not present, then
    F2.UI.{{#crossLink "F2.UI/setTitle"}}{{/crossLink}} will not function.
    @property APP_TITLE
    @type string
    @static
    @final
  */
  APP_TITLE: 'f2-app-title',
  /**
    The APP\_VIEW class should be applied to the DOM Element that contains
    a view for an app. The DOM Element should also have a
    {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.DATA_ATTRIBUTE
    attribute that specifies which
    {{#crossLink "F2.Constants.Views"}}{{/crossLink}} it is.
    @property APP_VIEW
    @type string
    @static
    @final
  */
  APP_VIEW: 'f2-app-view',
  /**
    APP\_VIEW\_TRIGGER class should be applied to the DOM Elements that
    trigger an
    {{#crossLink "F2.Constants.Events"}}{{/crossLink}}.APP\_VIEW\_CHANGE
    event. The DOM Element should also have a
    {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.DATA_ATTRIBUTE
    attribute that specifies which
    {{#crossLink "F2.Constants.Views"}}{{/crossLink}} it will trigger.
    @property APP_VIEW_TRIGGER
    @type string
    @static
    @final
  */
  APP_VIEW_TRIGGER: 'f2-app-view-trigger',
  /**
    The MASK class is applied to the overlay element that is created
    when the F2.UI.{{#crossLink "F2.UI/showMask"}}{{/crossLink}} method is
    fired.
    @property MASK
    @type string
    @static
    @final
  */
  MASK: 'f2-mask',
  /**
    The MASK_CONTAINER class is applied to the Element that is passed into
    the F2.UI.{{#crossLink "F2.UI/showMask"}}{{/crossLink}} method.
    @property MASK_CONTAINER
    @type string
    @static
    @final
  */
  MASK_CONTAINER: 'f2-mask-container'
};

},{}],16:[function(require,module,exports){
/**
  Events constants
  @class F2.Constants.Events
*/
module.exports = {
  /**
    The APP\_SYMBOL\_CHANGE event is fired when the symbol is changed in an
    app. It is up to the app developer to fire this event. Returns an object
    with the symbol and company name:
    `{ symbol: 'MSFT', name: 'Microsoft Corp (NASDAQ)' }`
    @property APP_SYMBOL_CHANGE
    @type string
    @static
    @final
  */
  APP_SYMBOL_CHANGE: 'App.symbolChange',
  /**
    The APP\_WIDTH\_CHANGE event will be fired by the container when the
    width of an app is changed. The app's instanceId should be concatenated
    to this constant. Returns an object with the gridSize and width in pixels:
    `{ gridSize: 8, width: 620 }`
    @property APP_WIDTH_CHANGE
    @type string
    @static
    @final
  */
  APP_WIDTH_CHANGE: 'App.widthChange.',
  /**
    The CONTAINER\_SYMBOL\_CHANGE event is fired when the symbol is changed
    at the container level. This event should only be fired by the container
    or container provider. Returns an object with the symbol and company name:
    `{ symbol: 'MSFT', name: 'Microsoft Corp (NASDAQ)' }`
    @property CONTAINER_SYMBOL_CHANGE
    @type string
    @static
    @final
  */
  CONTAINER_SYMBOL_CHANGE: 'Container.symbolChange',
  /**
    The CONTAINER\_WIDTH\_CHANGE event will be fired by the container when
    the width of the container has changed.
    @property CONTAINER_WIDTH_CHANGE
    @type string
    @static
    @final
  */
  CONTAINER_WIDTH_CHANGE: 'Container.widthChange',
  /**
    The CONTAINER\_LOCALE\_CHANGE event will be fired by the container when
    the locale of the container has changed. This event should only be fired
    by the container or container provider. Returns an object with the
    updated locale (IETF-defined standard language tag):
    `{ locale: 'en-us' }`
    @property CONTAINER_LOCALE_CHANGE
    @type string
    @static
    @final
  */
  CONTAINER_LOCALE_CHANGE: 'Container.localeChange'
};

},{}],17:[function(require,module,exports){
var appHandlers = require('./appHandlers');
var css = require('./css');
var events = require('./events');
var sockets = require('./sockets');
var views = require('./views');

module.exports = {
  AppHandlers: appHandlers,
  Css: css,
  Events: events,
  JSONP_CALLBACK: 'F2_jsonpCallback_',
  Sockets: sockets,
  Views: views
};

},{"./appHandlers":14,"./css":15,"./events":16,"./sockets":18,"./views":19}],18:[function(require,module,exports){
/**
  Constants for use with cross-domain sockets.
  @class F2.Constants.Sockets
  @protected
*/
module.exports = {
  /**
    The EVENT message is sent whenever
    F2.Events.{{#crossLink "F2.Events/emit"}}{{/crossLink}} is fired.
    @property EVENT
    @type string
    @static
    @final
  */
  EVENT: '__event__',
  /**
    The LOAD message is sent when an iframe socket initially loads. Returns
    a JSON string that represents: `[ App, AppManifest]`
    @property LOAD
    @type string
    @static
    @final
  */
  LOAD: '__socketLoad__',
  /**
    The RPC message is sent when a method is passed up from within a secure
    app page.
    @property RPC
    @type string
    @static
    @final
  */
  RPC: '__rpc__',
  /**
    The RPC\_CALLBACK message is sent when a call back from an RPC method is
    fired.
    @property RPC_CALLBACK
    @type string
    @static
    @final
  */
  RPC_CALLBACK: '__rpcCallback__',
  /**
    The UI\_RPC message is sent when a UI method called.
    @property UI_RPC
    @type string
    @static
    @final
  */
  UI_RPC: '__uiRpc__'
};

},{}],19:[function(require,module,exports){
/**
  The available view types to apps. The view should be specified by applying
  the {{#crossLink "F2.Constants.Css"}}{{/crossLink}}.APP\_VIEW class to the
  containing DOM Element. A DATA\_ATTRIBUTE attribute should be added to the
  Element as well which defines what view type is represented. The `hide`
  class can be applied to views that should be hidden by default.
  @class F2.Constants.Views
*/
module.exports = {
  /**
    The DATA_ATTRIBUTE should be placed on the DOM Element that contains the
    view.
    @property DATA_ATTRIBUTE
    @type string
    @static
    @final
  */
  DATA_ATTRIBUTE: 'data-f2-view',
  /**
    The ABOUT view gives details about the app.
    @property ABOUT
    @type string
    @static
    @final
  */
  ABOUT: 'about',
  /**
    The HELP view provides users with help information for using an app.
    @property HELP
    @type string
    @static
    @final
  */
  HELP: 'help',
  /**
    The HOME view is the main view for an app. This view should always be
    provided by an app.
    @property HOME
    @type string
    @static
    @final
  */
  HOME: 'home',
  /**
    The REMOVE view is a special view that handles the removal of an app from
    the container.
    @property REMOVE
    @type string
    @static
    @final
  */
  REMOVE: 'remove',
  /**
    The SETTINGS view provides users the ability to modify advanced settings
    for an app.
    @property SETTINGS
    @type string
    @static
    @final
  */
  SETTINGS: 'settings'
};

},{}],20:[function(require,module,exports){
var appHandlers = require('./app_handlers');
var classes = require('./classes');
var constants = require('./constants');
var events = require('./events');
var F2 = require('./F2');
var jQuery = require('jquery');
var ui = require('./ui');
var rpc = require('./rpc');

var _apps = {};
var _config = false;
var _usesAppHandlers = false;
var _appHandlerToken = appHandlers.__f2GetToken();
var _loadedScripts = {};
var _loadedStyles = {};
var _loadingScripts = {};

/**
  Appends the app's html to the DOM.
  @method _afterAppRender
  @deprecated This has been replaced with
  {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0
  @private
  @param {F2.AppConfig} appConfig The F2.AppConfig object
  @param {string} html The string of html
  @return {Element} The DOM Element that contains the app
*/
function _afterAppRender(appConfig, html) {
  var handler = _config.afterAppRender || function(_appConfig, _html) {
    return jQuery(_html).appendTo('body');
  };
  var $appContainer = handler(appConfig, html);

  if (_config.afterAppRender && !$appContainer) {
    F2.log('F2.ContainerConfig.afterAppRender() must return the DOM Element that contains the app');
    return;
  }

  jQuery($appContainer).addClass(constants.Css.APP);

  return $appContainer.get(0);
}

/**
  Renders the html for an app.
  @method _appRender
  @deprecated This has been replaced with
  {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0.
  @private
  @param {F2.AppConfig} appConfig The F2.AppConfig object
  @param {string} html The string of html
  @returns {string} HTML for the app
*/
function _appRender(appConfig, html) {
  // Apply APP_CONTAINER class and AppID
  html = _outerHtml(jQuery(html).addClass(constants.Css.APP_CONTAINER + ' ' + appConfig.appId));

  // Optionally apply wrapper html
  if (_config.appRender) {
    html = _config.appRender(appConfig, html);
  }

  return _outerHtml(html);
}

/**
  Rendering hook to allow containers to render some html prior to an app
  loading.
  @method _beforeAppRender
  @deprecated This has been replaced with
  {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0.
  @private
  @param {F2.AppConfig} appConfig The F2.AppConfig object
  @return {Element} The DOM Element surrounding the app
*/
function _beforeAppRender(appConfig) {
  var handler = _config.beforeAppRender || jQuery.noop;
  return handler(appConfig);
}

/**
  Handler to inform the container that a script failed to load.
  @method _onScriptLoadFailure
  @deprecated This has been replaced with
  {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0.
  @private
  @param {F2.AppConfig} appConfig The F2.AppConfig object
  @param {string} scriptInfo The path of the script that failed to load or
  the exception info for the inline script that failed to execute.
*/
function _appScriptLoadFailed(appConfig, scriptInfo) {
  if (_config.appScriptLoadFailed) {
    _config.appScriptLoadFailed(appConfig, scriptInfo);
  }
}

/**
  Adds properties to the AppConfig object.
  @method _createAppConfig
  @private
  @param {F2.AppConfig} appConfig The F2.AppConfig object
  @return {F2.AppConfig} The new F2.AppConfig object, prepopulated with
  necessary properties.
*/
function _createAppConfig(appConfig) {
  // Make a copy of the app config to ensure that the original is not modified
  appConfig = jQuery.extend(true, {}, appConfig);

  // Create the instanceId for the app
  appConfig.instanceId = appConfig.instanceId || F2.guid();

  // Default the views if not provided
  appConfig.views = appConfig.views || [];
  if (!F2.inArray(constants.Views.HOME, appConfig.views)) {
    appConfig.views.push(constants.Views.HOME);
  }

  // Pass container-defined locale to each app
  if (classes.ContainerConfig.locale) {
    appConfig.containerLocale = classes.ContainerConfig.locale;
  }

  return appConfig;
}

/**
  Generate an AppConfig from the element's attributes.
  @method _getAppConfigFromElement
  @private
  @param {Element} node The DOM node from which to generate the F2.AppConfig
  object
  @return {F2.AppConfig} The new F2.AppConfig object
*/
function _getAppConfigFromElement(node) {
  if (!node) {
    return;
  }

  var appConfig;
  var appId = node.getAttribute('data-f2-appid');
  var manifestUrl = node.getAttribute('data-f2-manifesturl');

  if (appId && manifestUrl) {
    appConfig = {
      appId: appId,
      enableBatchRequests: node.hasAttribute('data-f2-enablebatchrequests'),
      isSecure: node.hasAttribute('data-f2-issecure'),
      manifestUrl: manifestUrl,
      root: node
    };

    // See if the user passed in a block of serialized json
    var contextJson = node.getAttribute('data-f2-context');

    if (contextJson) {
      try {
        appConfig.context = F2.parse(contextJson);
      } catch (e) {
        F2.log('warn', 'F2: "data-f2-context" of node is not valid JSON', '"' + e + '"');
      }
    }
  }

  return appConfig;
}

/**
  Returns true if the DOM node has children that are not text nodes
  @method _hasNonTextChildNodes
  @private
  @param {Element} node The DOM node
  @return {bool} True if there are non-text children
*/
function _hasNonTextChildNodes(node) {
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

/**
  Adds properties to the ContainerConfig object to take advantage of defaults.
  @method _hydrateContainerConfig
  @private
  @param {F2.ContainerConfig} containerConfig The F2.ContainerConfig object
*/
function _hydrateContainerConfig(containerConfig) {
  if (!containerConfig.scriptErrorTimeout) {
    containerConfig.scriptErrorTimeout = classes.ContainerConfig.scriptErrorTimeout;
  }

  if (containerConfig.debugMode !== true) {
    containerConfig.debugMode = classes.ContainerConfig.debugMode;
  }

  if (containerConfig.locale && typeof containerConfig.locale === 'string') {
    classes.ContainerConfig.locale = containerConfig.locale;
  }
}

/**
  Attach app events.
  @method _initAppEvents
  @private
  @param {F2.AppConfig} appConfig The F2.AppConfig object
*/
function _initAppEvents(appConfig) {
  var self = this;
  var elementFilter = '.' + constants.Css.APP_VIEW_TRIGGER + '[' + constants.Views.DATA_ATTRIBUTE + ']';

  jQuery(appConfig.root).on('click', elementFilter, function(e) {
    e.preventDefault();

    var view = jQuery(this).attr(constants.Views.DATA_ATTRIBUTE).toLowerCase();

    // Handle the special REMOVE view
    if (view === constants.Views.REMOVE) {
      self.removeApp(appConfig.instanceId);
    } else {
      appConfig.ui.Views.change(view);
    }
  });
}

/**
  Attach container Events
  @method _initContainerEvents
  @private
*/
function _initContainerEvents() {
  function resizeHandler() {
    events.emit(constants.Events.CONTAINER_WIDTH_CHANGE);
  }

  var resizeTimeout;

  jQuery(window).on('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeHandler, 100);
  });

  // Listen for container-broadcasted locale changes
  events.on(constants.Events.CONTAINER_LOCALE_CHANGE, function(data) {
    if (data.locale && typeof data.locale === 'string') {
      classes.ContainerConfig.locale = data.locale;
    }
  });
}

/**
  Checks if an element is a placeholder element.
  @method _isPlaceholderElement
  @private
  @param {Element} node The DOM element to check
  @return {bool} True if the element is a placeholder
*/
function _isPlaceholderElement(node) {
  return (
    F2.isNativeDOMNode(node) &&
    !_hasNonTextChildNodes(node) &&
    !!node.getAttribute('data-f2-appid') &&
    !!node.getAttribute('data-f2-manifesturl')
  );
}

/**
  Has the container been init?
  @method _isInit
  @private
  @return {bool} True if the container has been init
*/
function _isInit() {
  return !!_config;
}

/**
  Instantiates app from its appConfig and stores that in a private collection.
  @method _createAppInstance
  @private
  @param {object} appConfig An {{#crossLink "F2.AppConfig"}}{{/crossLink}}
  @param {F2.AppManifest.AppContent} appContent The F2.AppManifest.AppContent
  object.
*/
function _createAppInstance(appConfig, appContent) {
  appConfig.ui = new ui(appConfig);

  // instantiate F2.App
  if (F2.Apps[appConfig.appId] !== undefined) {
    if (typeof F2.Apps[appConfig.appId] === 'function') {
      // IE
      setTimeout(function() {
        _apps[appConfig.instanceId].app = new F2.Apps[appConfig.appId](appConfig, appContent, appConfig.root);

        if (_apps[appConfig.instanceId].app.init !== undefined) {
          _apps[appConfig.instanceId].app.init();
        }
      }, 0);
    } else {
      F2.log('app initialization class is defined but not a function. (' + appConfig.appId + ')');
    }
  }
}

/**
  Loads the app's html/css/javascript.
  @method loadApp
  @private
  @param {Array} appConfigs An array of
  {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects.
  @param {F2.AppManifest} [appManifest] The AppManifest object
*/
function _loadApps(appConfigs, appManifest) {
  appConfigs = [].concat(appConfigs);

  // Check for secure app
  if (appConfigs.length === 1 && appConfigs[0].isSecure && !_config.isSecureAppPage) {
    _loadSecureApp(appConfigs[0], appManifest);
    return;
  }

  // Check that the number of apps in manifest matches the number requested
  if (appConfigs.length !== appManifest.apps.length) {
    F2.log('The number of apps defined in the AppManifest do not match the number requested.', appManifest);
    return;
  }

  function _loadStyles(styles, cb) {
    if (_config.loadStyles) {
      return _config.loadStyles(styles, cb);
    }

    // Load styles, see #101
    var stylesFragment;
    var useCreateStyleSheet = !!document.createStyleSheet;

    jQuery.each(styles, function(i, e) {
      var resourceUrl = e;
      var resourceKey = e.toLowerCase();

      if (_loadedStyles[resourceKey]) {
        return;
      }

      if (useCreateStyleSheet) {
        document.createStyleSheet(resourceUrl);
      } else {
        stylesFragment = stylesFragment || [];
        stylesFragment.push('<link rel="stylesheet" type="text/css" href="' + resourceUrl + '"/>');
      }

      _loadedStyles[resourceKey] = true;
    });

    if (stylesFragment) {
      jQuery('head').append(stylesFragment.join(''));
    }

    cb();
  }

  function _loadScripts(scripts, cb) {
    if (_config.loadScripts) {
      return _config.loadScripts(scripts, cb);
    }

    if (!scripts.length) {
      return cb();
    }

    var doc = window.document;
    var scriptCount = scripts.length;
    var scriptsLoaded = 0;
    // http://caniuse.com/#feat=script-async
    var head = doc && (doc.head || doc.getElementsByTagName('head')[0]);
    // For IE, put scripts before any <base> elements, but after any <meta>
    var insertBeforeEl = head && head.getElementsByTagName('base')[0] || null;
    // Check for IE10+ so that we don't rely on onreadystatechange, readyStates for IE6-9
    var readyStates = (window.addEventListener) ? {} : {
      'loaded': true,
      'complete': true
    };

    // Log and emit event for the failed (400,500) scripts
    function _error(e) {
      setTimeout(function() {
        var evtData = {
          src: e.target.src,
          appId: appConfigs[0].appId
        };

        // Send error to console
        F2.log('Script defined in \'' + evtData.appId + '\' failed to load \'' + evtData.src + '\'');

        // Emit events
        events.emit('RESOURCE_FAILED_TO_LOAD', evtData);

        if (!_usesAppHandlers) {
          _appScriptLoadFailed(appConfigs[0], evtData.src);
        } else {
          appHandlers.__trigger(
            _appHandlerToken,
            constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
            appConfigs[0],
            evtData.src
          );
        }
      }, _config.scriptErrorTimeout); // Defaults to 7000
    }

    function _checkComplete() {
      // Are we done loading all scripts for this app?
      if (++scriptsLoaded === scriptCount) {
        cb();
      }
    }

    function _emptyWaitlist(resourceKey, errorEvt) {
      var waiting;
      var waitlist = _loadingScripts[resourceKey];

      if (!waitlist) {
        return;
      }

      for (var i = 0; i < waitlist.length; i++) {
        waiting = waitlist  [i];

        if (errorEvt) {
          waiting.error(errorEvt);
        } else {
          waiting.success();
        }
      }

      _loadingScripts[resourceKey] = null;
    }

    // Load scripts and eval inlines once complete
    jQuery.each(scripts, function(i, url) {
      var script = doc.createElement('script');
      var resourceUrl = url;
      var resourceKey = resourceUrl.toLowerCase();

      // Already finished loading, trigger callback
      if (_loadedScripts[resourceKey]) {
        return _checkComplete();
      }

      // This script is actively loading, add this app to the wait list
      if (_loadingScripts[resourceKey]) {
        _loadingScripts[resourceKey].push({
          success: _checkComplete,
          error: _error
        });

        return;
      }

      // Create the waitlist
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

        // Detect when it's done loading
        // ev.type == 'load' is for all browsers except IE6-9
        // IE6-9 need to use onreadystatechange and look for
        // el.readyState in {loaded, complete} (yes, we need both)
        if (e.type === 'load' || readyStates[script.readyState]) {
          // Done, cleanup
          script.onload = script.onreadystatechange = script.onerror = '';
          // Loaded
          _loadedScripts[resourceKey] = true;
          // Increment and check if scripts are done
          _checkComplete();
          // Empty wait list
          _emptyWaitlist(resourceKey);
          // Dereference script
          script = null;
        }
      };

      // Set the src, start loading
      script.src = resourceUrl;

      // <head> really is the best
      head.insertBefore(script, insertBeforeEl);
    });
  }

  function _loadInlineScripts(inlines, cb) {
    // Attempt to use the user provided method
    if (_config.loadInlineScripts) {
      _config.loadInlineScripts(inlines, cb);
    } else {
      for (var i = 0, len = inlines.length; i < len; i++) {
        try {
          eval(inlines[i]);
        } catch ( exception ) {
          F2.log('Error loading inline script: ' + exception + '\n\n' + inlines[i]);

          // Emit events
          events.emit('RESOURCE_FAILED_TO_LOAD', {
            appId: appConfigs[0].appId,
            src: inlines[i],
            err: exception
          });

          if (!_usesAppHandlers) {
            _appScriptLoadFailed(appConfigs[0], exception);
          } else {
            appHandlers.__trigger(
              _appHandlerToken,
              constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
              appConfigs[0],
              exception
            );
          }
        }
      }
      cb();
    }
  }

  // Determine whether an element has been added to the page
  function elementInDocument(element) {
    if (element) {
      while (element.parentNode) {
        element = element.parentNode;

        if (element === document) {
          return true;
        }
      }
    }

    return false;
  }

  function _loadHtml(apps) {
    jQuery.each(apps, function(i, a) {
      if (_isPlaceholderElement(appConfigs[i].root)) {
        jQuery(appConfigs[i].root)
          .addClass(constants.Css.APP)
          .append(jQuery(a.html).addClass(constants.Css.APP_CONTAINER + ' ' + appConfigs[i].appId));
      } else if (!_usesAppHandlers) {
        // Load html and save the root node
        appConfigs[i].root = _afterAppRender(appConfigs[i], _appRender(appConfigs[i], a.html));
      } else {
        appHandlers.__trigger(
          _appHandlerToken,
          constants.AppHandlers.APP_RENDER,
          appConfigs[i], // the app config
          _outerHtml(jQuery(a.html).addClass(constants.Css.APP_CONTAINER + ' ' + appConfigs[i].appId))
        );

        var appId = appConfigs[i].appId;
        var root = appConfigs[i].root;

        if (!root) {
          throw new Error('Root for ' + appId + ' must be a native DOM element and cannot be null or undefined. Check your AppHandler callbacks to ensure you have set App root to a native DOM element.');
        }

        if (!elementInDocument(root)) {
          throw new Error('App root for ' + appId + ' was not appended to the DOM. Check your AppHandler callbacks to ensure you have rendered the app root to the DOM.');
        }

        appHandlers.__trigger(
          _appHandlerToken,
          constants.AppHandlers.APP_RENDER_AFTER,
          appConfigs[i] // the app config
        );

        if (!F2.isNativeDOMNode(root)) {
          throw new Error('App root for ' + appId + ' must be a native DOM element. Check your AppHandler callbacks to ensure you have set app root to a native DOM element.');
        }
      }

      // init events
      _initAppEvents(appConfigs[i]);
    });
  }

  // Pull out the manifest data
  var manifestScripts = appManifest.scripts || [];
  var manifestStyles = appManifest.styles || [];
  var manifestInlines = appManifest.inlineScripts || [];
  var manifestApps = appManifest.apps || [];

  // Finally, load the styles, html, and scripts
  _loadStyles(manifestStyles, function() {
    _loadHtml(manifestApps);
    _loadScripts(manifestScripts, function() {
      // Emit event we're done with scripts
      if (appConfigs[0]) {
        events.emit('APP_SCRIPTS_LOADED', {
          appId: appConfigs[0].appId,
          scripts: manifestScripts
        });
      }

      _loadInlineScripts(manifestInlines, function() {
        // Create the apps
        jQuery.each(appConfigs, function(i, a) {
          _createAppInstance(a, manifestApps[i]);
        });
      });
    });
  });
}

/**
  Loads the app's html/css/javascript into an iframe.
  @method loadSecureApp
  @private
  @param {F2.AppConfig} appConfig The F2.AppConfig object
  @param {F2.AppManifest} appManifest The app's html/css/js to be loaded into
  the page.
*/
function _loadSecureApp(appConfig, appManifest) {
  // Make sure the container is configured for secure apps
  if (_config.secureAppPagePath) {
    if (_isPlaceholderElement(appConfig.root)) {
      jQuery(appConfig.root)
        .addClass(constants.Css.APP)
        .append(jQuery('<div></div>')
        .addClass(constants.Css.APP_CONTAINER + ' ' + appConfig.appId));
    } else if (!_usesAppHandlers) {
      // Create the html container for the iframe
      appConfig.root = _afterAppRender(appConfig, _appRender(appConfig, '<div></div>'));
    } else {
      var $root = jQuery(appConfig.root);

      appHandlers.__trigger(
        _appHandlerToken,
        constants.AppHandlers.APP_RENDER,
        appConfig,
        _outerHtml(jQuery(appManifest.html).addClass(constants.Css.APP_CONTAINER + ' ' + appConfig.appId))
      );

      if ($root.parents('body:first').length === 0) {
        throw new Error('App was never rendered on the page. Please check your AppHandler callbacks to ensure you have rendered the app root to the DOM.');
      }

      appHandlers.__trigger(
        _appHandlerToken,
        constants.AppHandlers.APP_RENDER_AFTER,
        appConfig // the app config
      );

      if (!appConfig.root) {
        throw new Error('App Root must be a native dom node and can not be null or undefined. Please check your AppHandler callbacks to ensure you have set App Root to a native dom node.');
      }

      if (!F2.isNativeDOMNode(appConfig.root)) {
        throw new Error('App Root must be a native dom node. Please check your AppHandler callbacks to ensure you have set App Root to a native dom node.');
      }
    }

    // Instantiate F2.UI
    appConfig.ui = new ui(appConfig);
    // Init events
    _initAppEvents(appConfig);
    // Create RPC socket
    rpc.register(appConfig, appManifest);
  } else {
    F2.log('Unable to load secure app: "secureAppPagePath" is not defined in F2.ContainerConfig.');
  }
}

function _outerHtml(html) {
  return jQuery('<div></div>').append(html).html();
}

/**
  Checks if the app is valid.
  @method _validateApp
  @private
  @param {F2.AppConfig} appConfig The F2.AppConfig object
  @returns {bool} True if the app is valid
*/
function _validateApp(appConfig) {
  // Check for valid app configurations
  if (!appConfig.appId) {
    F2.log('"appId" missing from app object');
    return false;
  } else if (!appConfig.root && !appConfig.manifestUrl) {
    F2.log('"manifestUrl" missing from app object');
    return false;
  }

  return true;
}

/**
  Checks if the ContainerConfig is valid.
  @method _validateContainerConfig
  @private
  @returns {bool} True if the config is valid
*/
function _validateContainerConfig() {
  if (_config) {
    if (_config.xhr) {
      if (!(typeof _config.xhr === 'function' || typeof _config.xhr === 'object')) {
        throw new Error('ContainerConfig.xhr should be a function or an object');
      }
      if (_config.xhr.dataType && typeof _config.xhr.dataType !== 'function') {
        throw new Error('ContainerConfig.xhr.dataType should be a function');
      }
      if (_config.xhr.type && typeof _config.xhr.type !== 'function') {
        throw new Error('ContainerConfig.xhr.type should be a function');
      }
      if (_config.xhr.url && typeof _config.xhr.url !== 'function') {
        throw new Error('ContainerConfig.xhr.url should be a function');
      }
    }
  }

  return true;
}

/**
  Find app placeholders on the page
  @method _getPlaceholders
  @private
  @param {Element} parentNode The element to search for placeholder apps
  @returns {Array} The discovered placeholder elements
*/
function _getPlaceholders(parentNode) {
  var elements = [];

  if (parentNode.hasAttribute('data-f2-appid')) {
    elements.push(parentNode);
  }

  if (parentNode.querySelectorAll) {
    var children = Array.prototype.slice.call(parentNode.querySelectorAll('[data-f2-appid]'));
    elements = elements.concat(children);
  }

  return elements;
}

/**
  Root namespace of the F2 SDK
  @module f2
  @class F2
*/
module.exports = {
  /**
    Gets the current list of apps in the container.
    @method getContainerState
    @returns {Array} An array of objects containing the appId
  */
  getContainerState: function() {
    if (!_isInit()) {
      F2.log('F2.init() must be called before F2.getContainerState()');
      return;
    }

    return jQuery.map(_apps, function(app) {
      return {
        appId: app.config.appId
      };
    });
  },
  /**
    Gets the current locale defined by the container.
    @method getContainerLocale
    @returns {String} IETF-defined standard language tag
  */
  getContainerLocale: function() {
    if (!_isInit()) {
      F2.log('F2.init() must be called before F2.getContainerLocale()');
      return;
    }

    return classes.ContainerConfig.locale;
  },
  /**
    Initializes the container. This method must be called before performing
    any other actions in the container.
    @method init
    @param {F2.ContainerConfig} config The configuration object
  */
  init: function(config) {
    _config = config || {};
    _validateContainerConfig();
    _hydrateContainerConfig(_config);

    // Dictates whether we use the old logic or the new logic.
    // TODO: Remove in v2.0
    _usesAppHandlers = (!_config.beforeAppRender && !_config.appRender && !_config.afterAppRender && !_config.appScriptLoadFailed);

    // Only establish RPC connection if the container supports the secure app page
    if (!!_config.secureAppPagePath || _config.isSecureAppPage) {
      rpc.init(_config.secureAppPagePath ? _config.secureAppPagePath : false);
    }

    ui.init(_config);

    if (!_config.isSecureAppPage) {
      _initContainerEvents();
    }
  },
  /**
    Has the container been init?
    @method isInit
    @return {bool} True if the container has been init
  */
  isInit: _isInit,
  /**
    Automatically load apps that are already defined in the DOM. Elements will
    be rendered into the location of the placeholder DOM element. Any
    AppHandlers that are defined will be bypassed.
    @method loadPlaceholders
    @param {Element} parentNode The element to search for placeholder apps
  */
  loadPlaceholders: function(parentNode) {
    if (parentNode && !F2.isNativeDOMNode(parentNode)) {
      throw new Error('"parentNode" must be null or a DOM node');
    }

    var elements = _getPlaceholders(parentNode || document.body);
    var appConfigs = [];

    for (var i = 0, len = elements.length; i < len; i++) {
      var appConfig = _getAppConfigFromElement(elements[i]);
      appConfigs.push(appConfig);
    }

    if (appConfigs.length) {
      this.registerApps(appConfigs);
    }
  },
  /**
    Begins the loading process for all apps and/or initialization process for
    pre-loaded apps. The app will be passed the
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} object which will contain the
    app's unique instanceId within the container. If the
    {{#crossLink "F2.AppConfig"}}{{/crossLink}}.root property is populated
    the app is considered to be a pre-loaded app and will be handled
    accordingly. Optionally, the
    {{#crossLink "F2.AppManifest"}}{{/crossLink}} can be passed in and those
    assets will be used instead of making a request.
    @method registerApps
    @param {Array} appConfigs An array of
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects
    @param {Array} [appManifests] An array of
    {{#crossLink "F2.AppManifest"}}{{/crossLink}}
    objects. This array must be the same length as the apps array that is
    passed in. This can be useful if apps are loaded on the server-side and
    passed down to the client.
    @example
      // Traditional App requests.
      var configs = [{
        appId: 'com_externaldomain_example_app',
        context: {},
        manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
      }, {
        appId: 'com_externaldomain_example_app',
        context: {},
        manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
      }, {
        appId: 'com_externaldomain_example_app2',
        context: {},
        manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
      }];

      F2.init();
      F2.registerApps(configs);
    @example
      // Pre-loaded and tradition apps mixed.
      // You can preload the same app multiple times as long as you have a unique root for each
      var configs = [{
        appId: 'com_mydomain_example_app',
        context: {},
        root: 'div#example-app-1',
        manifestUrl: ''
      }, {
        appId: 'com_mydomain_example_app',
        context: {},
        root: 'div#example-app-2',
        manifestUrl: ''
      }, {
        appId: 'com_externaldomain_example_app',
        context: {},
        manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
      }];

      F2.init();
      F2.registerApps(configs);
    @example
      // Apps with predefined manifests.
      var configs = [
        { appId: 'com_externaldomain_example_app', context: {} },
        { appId: 'com_externaldomain_example_app', context: {} },
        { appId: 'com_externaldomain_example_app2', context: {} }
      ];

      // Pre requested manifest responses
      var manifests = [{
        apps: ['<div>Example App!</div>'],
        inlineScripts: [],
        scripts: ['http://www.domain.com/js/AppClass.js'],
        styles: ['http://www.domain.com/css/AppStyles.css']
      }, {
        apps: ['<div>Example App!</div>'],
        inlineScripts: [],
        scripts: ['http://www.domain.com/js/AppClass.js'],
        styles: ['http://www.domain.com/css/AppStyles.css']
      }, {
        apps: ['<div>Example App 2!</div>'],
        inlineScripts: [],
        scripts: ['http://www.domain.com/js/App2Class.js'],
        styles: ['http://www.domain.com/css/App2Styles.css']
      }];

      F2.init();
      F2.registerApps(configs, manifests);
  */
  registerApps: function(appConfigs, appManifests) {
    if (!_isInit()) {
      F2.log('F2.init() must be called before F2.registerApps()');
      return;
    }

    if (!appConfigs) {
      F2.log('At least one AppConfig must be passed when calling F2.registerApps()');
      return;
    }

    var self = this;
    var appStack = [];
    var batches = {};
    var callbackStack = {};
    var haveManifests = false;
    appConfigs = [].concat(appConfigs);
    appManifests = [].concat(appManifests || []);
    haveManifests = !!appManifests.length;

    // AppConfigs must have a length
    if (!appConfigs.length) {
      F2.log('At least one AppConfig must be passed when calling F2.registerApps()');
      return;
    }

    // Ensure that the array of apps and manifests are equal
    if (appConfigs.length && haveManifests && appConfigs.length !== appManifests.length) {
      F2.log('The length of "apps" does not equal the length of "appManifests"');
      return;
    }

    // Validate apps, assign instanceId, then determine which apps can be batched together
    jQuery.each(appConfigs, function(i, a) {
      // Add properties and methods
      a = _createAppConfig(a);

      // Set to itself for preloaded apps
      a.root = a.root || null;

      // Validate the app after setting the root because preloaded apps do not require manifest url
      if (!_validateApp(a)) {
        return;
      }

      _apps[a.instanceId] = {
        config: a
      };

      // If the root property is defined then this app is considered to be preloaded and we will run it through that logic.
      if (a.root && !_isPlaceholderElement(a.root)) {
        if ((!a.root && typeof a.root !== 'string') && !F2.isNativeDOMNode(a.root)) {
          F2.log('AppConfig invalid for pre-load, not a valid string and not dom node');
          F2.log('AppConfig instance:', a);
          throw new Error('Preloaded appConfig.root property must be a native dom node or a string representing a sizzle selector. Please check your inputs and try again.');
        } else if (jQuery(a.root).length !== 1) {
          F2.log('AppConfig invalid for pre-load, root not unique');
          F2.log('AppConfig instance:', a);
          F2.log('Number of dom node instances:', jQuery(a.root).length);
          throw new Error('Preloaded appConfig.root property must map to a unique dom node. Please check your inputs and try again.');
        }

        // Instantiate F2.App
        _createAppInstance(a);
        _initAppEvents(a);

        return;
      }

      if (!_isPlaceholderElement(a.root)) {
        if (!_usesAppHandlers) {
          a.root = _beforeAppRender(a);
        } else {
          appHandlers.__trigger(
            _appHandlerToken,
            constants.AppHandlers.APP_CREATE_ROOT,
            a
          );

          appHandlers.__trigger(
            _appHandlerToken,
            constants.AppHandlers.APP_RENDER_BEFORE,
            a
          );
        }
      }

      // Load the page if we have the manifest
      if (haveManifests) {
        _loadApps(a, appManifests[i]);
      } else {
        // Check if this app can be batched
        if (a.enableBatchRequests && !a.isSecure) {
          batches[a.manifestUrl.toLowerCase()] = batches[a.manifestUrl.toLowerCase()] || [];
          batches[a.manifestUrl.toLowerCase()].push(a);
        } else {
          appStack.push({
            apps: [a],
            url: a.manifestUrl
          });
        }
      }
    });

    if (!haveManifests) {
      // Add the batches to the appStack
      jQuery.each(batches, function(i, b) {
        appStack.push({
          url: i,
          apps: b
        });
      });

      /*
        If an app is being loaded more than once on the page, there is the
        potential that the jsonp callback will be clobbered if the request
        for the AppManifest for the app comes back at the same time as
        another request for the same app. We'll create a callbackStack
        that will ensure that requests for the same app are loaded in order
        rather than at the same time
      */
      jQuery.each(appStack, function(i, req) {
        // Define the callback function based on the first app's App ID
        var jsonpCallback = constants.JSONP_CALLBACK + req.apps[0].appId;

        // Push the request onto the callback stack
        callbackStack[jsonpCallback] = callbackStack[jsonpCallback] || [];
        callbackStack[jsonpCallback].push(req);
      });

      /*
        Loop through each item in the callback stack and make the request
        for the AppManifest. When the request is complete, pop the next
        request off the stack and make the request.
      */
      jQuery.each(callbackStack, function(i, requests) {
        function manifestRequest(jsonpCallback, req) {
          if (!req) {
            return;
          }

          // Setup defaults and callbacks
          var type = 'GET';
          var dataType = 'jsonp';

          function completeFunc() {
            manifestRequest(i, requests.pop());
          }

          function errorFunc() {
            jQuery.each(req.apps, function(idx, item) {
              item.name = item.name || item.appId;
              F2.log('Removed failed ' + item.name + ' app', item);
              self.removeApp(item.instanceId);
            });
          }

          function successFunc(appManifest) {
            _loadApps(req.apps, appManifest);
          }

          // Optionally fire xhr overrides
          if (_config.xhr) {
            if (_config.xhr.dataType) {
              dataType = _config.xhr.dataType(req.url, req.apps);

              if (typeof dataType !== 'string') {
                throw new Error('ContainerConfig.xhr.dataType should return a string');
              }
            }

            if (_config.xhr.type) {
              type = _config.xhr.type(req.url, req.apps);

              if (typeof type !== 'string') {
                throw new Error('ContainerConfig.xhr.type should return a string');
              }
            }

            if (_config.xhr.url) {
              req.url = _config.xhr.url(req.url, req.apps);

              if (typeof req.url !== 'string') {
                throw new Error('ContainerConfig.xhr.url should return a string');
              }
            }
          }

          // Setup the default request function if an override is not present
          var requestFunc = _config.xhr;

          if (typeof requestFunc !== 'function') {
            requestFunc = function(url, apps, successCallback, errorCallback, completeCallback) {
              jQuery.ajax({
                url: url,
                type: type,
                data: {
                  params: F2.stringify(req.apps, F2.appConfigReplacer)
                },
                jsonp: false, // do not put 'callback=' in the query string
                jsonpCallback: jsonpCallback, // Unique function name
                dataType: dataType,
                success: successCallback,
                error: function(jqxhr, settings, exception) {
                  F2.log('Failed to load app(s)', exception.toString(), req.apps);
                  errorCallback();
                },
                complete: completeCallback
              });
            };
          }

          requestFunc(req.url, req.apps, successFunc, errorFunc, completeFunc);
        }

        manifestRequest(i, requests.pop());
      });
    }
  },
  /**
    Removes all apps from the container
    @method removeAllApps
  */
  removeAllApps: function() {
    if (!_isInit()) {
      F2.log('F2.init() must be called before F2.removeAllApps()');
      return;
    }

    var self = this;

    jQuery.each(_apps, function(i, a) {
      self.removeApp(a.config.instanceId);
    });
  },
  /**
    Removes an app from the container.
    @method removeApp
    @param {string} instanceId The app's instanceId
  */
  removeApp: function(instanceId) {
    if (!_isInit()) {
      F2.log('F2.init() must be called before F2.removeApp()');
      return;
    }

    if (_apps[instanceId]) {
      appHandlers.__trigger(
        _appHandlerToken,
        constants.AppHandlers.APP_DESTROY_BEFORE,
        _apps[instanceId]
      );

      appHandlers.__trigger(
        _appHandlerToken,
        constants.AppHandlers.APP_DESTROY,
        _apps[instanceId]
      );

      appHandlers.__trigger(
        _appHandlerToken,
        constants.AppHandlers.APP_DESTROY_AFTER,
        _apps[instanceId]
      );

      delete _apps[instanceId];
    }
  }
};

},{"./F2":3,"./app_handlers":4,"./classes":11,"./constants":17,"./events":21,"./rpc":23,"./ui":24,"jquery":undefined}],21:[function(require,module,exports){
var constants = require('./constants');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var F2 = require('./F2');
var rpc = require('./rpc');

/**
  Handles [Context](../../app-development.html#context) passing from containers
  to apps and apps to apps.
  @class F2.Events
*/
module.exports = (function() {
  var _events = new EventEmitter2({
    wildcard: true
  });

  // Unlimited listeners, set to > 0 for debugging
  _events.setMaxListeners(0);

  return {
    /**
      Same as F2.Events.emit except that it will not send the event to all
      sockets.
      @method _socketEmit
      @private
      @param {string} event The event name
      @param {object} [arg]* The arguments to be passed
      @returns {object} EventEmitter2 instance
    */
    _socketEmit: function() {
      return EventEmitter2.prototype.emit.apply(_events, [].slice.call(arguments));
    },
    /**
      Execute each of the listeners that may be listening for the specified
      event name in order with the list of arguments.
      @method emit
      @param {string} event The event name
      @param {object} [arg]* The arguments to be passed
      @returns {object} EventEmitter2 instance
    */
    emit: function() {
      rpc.broadcast(constants.Sockets.EVENT, [].slice.call(arguments));
      return EventEmitter2.prototype.emit.apply(_events, [].slice.call(arguments));
    },
    /**
      Adds a listener that will execute n times for the event before being
      removed. The listener is invoked only the first time the event is fired,
      after which it is removed.
      @method many
      @param {string} event The event name
      @param {int} timesToListen The number of times to execute the event
      before being removed
      @param {function} listener The function to be fired when the event is
      emitted
      @returns {object} EventEmitter2 instance
    */
    many: function(event, timesToListen, listener) {
      return _events.many(event, timesToListen, listener);
    },
    /**
      Remove a listener for the specified event.
      @method off
      @param {string} event The event name
      @param {function} listener The function that will be removed
      @returns {object} EventEmitter2 instance
    */
    off: function(event, listener) {
      return _events.off(event, listener);
    },
    /**
      Adds a listener for the specified event
      @method on
      @param {string} event The event name
      @param {function} listener The function to be fired when the event is
      emitted
      @returns {object} EventEmitter2 instance
    */
    on: function(event, listener) {
      return _events.on(event, listener);
    },
    /**
      Adds a one time listener for the event. The listener is invoked only
      the first time the event is fired, after which it is removed.
      @method once
      @param {string} event The event name
      @param {function} listener The function to be fired when the event is
      emitted
      @returns {object} EventEmitter2 instance
    */
    once: function(event, listener) {
      return _events.once(event, listener);
    }
  };
})();

},{"./F2":3,"./constants":17,"./rpc":23,"eventemitter2":2}],22:[function(require,module,exports){
var appHandlers = require('./app_handlers');
var classes = require('./classes');
var constants = require('./constants');
var container = require('./container');
var events = require('./events');
var f2 = require('./F2');
var rpc = require('./rpc');
var ui = require('./ui');

require('./autoload');

module.exports = window.F2 = {
  appConfigReplacer: f2.appConfigReplacer,
  AppHandlers: appHandlers,
  App: classes.App,
  AppConfig: classes.AppConfig,
  AppContent: classes.AppContent,
  AppManifest: classes.AppManifest,
  Apps: f2.Apps,
  Constants: constants,
  ContainerConfig: classes.ContainerConfig,
  Events: events,
  extend: f2.extend,
  getContainerLocale: container.getContainerLocale,
  getContainerState: container.getContainerState,
  guid: f2.guid,
  inArray: f2.inArray,
  init: container.init,
  isInit: container.isInit,
  isLocalRequest: f2.isLocalRequest,
  isNativeDOMNode: f2.isNativeDOMNode,
  log: f2.log,
  loadPlaceholders: container.loadPlaceholders,
  parse: f2.parse,
  registerApps: container.registerApps,
  removeAllApps: container.removeAllApps,
  removeApp: container.removeApp,
  Rpc: rpc,
  stringify: f2.stringify,
  UI: ui,
  version: f2.version
};

},{"./F2":3,"./app_handlers":4,"./autoload":5,"./classes":11,"./constants":17,"./container":20,"./events":21,"./rpc":23,"./ui":24}],23:[function(require,module,exports){
var constants = require('./constants');
var container = require('./container');
var easyXDM = require('easyxdm');
var events = require('./events');
var F2 = require('./F2');
var jQuery = require('jquery');
var rpc = require('./rpc');

var _callbacks = {};
var _secureAppPagePath = '';
var _apps = {};
var _rEvents = new RegExp('^' + constants.Sockets.EVENT);
var _rRpc = new RegExp('^' + constants.Sockets.RPC);
var _rRpcCallback = new RegExp('^' + constants.Sockets.RPC_CALLBACK);
var _rSocketLoad = new RegExp('^' + constants.Sockets.LOAD);
var _rUiCall = new RegExp('^' + constants.Sockets.UI_RPC);

/**
  Creates a socket connection from the app to the container using
  <a href="http://easyxdm.net" target="_blank">easyXDM</a>.
  @method _createAppToContainerSocket
  @private
*/
function _createAppToContainerSocket() {
  var appConfig;
  var isLoaded = false;
  /**
   It's possible for messages to be received before the socket load event has
   happened. We'll save off these messages and replay them once the socket is
   ready.
  */
  var messagePlayback = [];

  var socket = new easyXDM.Socket({
    onMessage: function(message, origin) {
      // Handle Socket Load
      if (!isLoaded && _rSocketLoad.test(message)) {
        message = message.replace(_rSocketLoad, '');
        var appParts = F2.parse(message);

        // Make sure we have the AppConfig and AppManifest
        if (appParts.length === 2) {
          appConfig = appParts[0];

          // Save socket
          _apps[appConfig.instanceId] = {
            config: appConfig,
            socket: socket
          };

          container.registerApps([appConfig], [appParts[1]]);

          // Socket message playback
          jQuery.each(messagePlayback, function() {
            _onMessage(appConfig, message, origin);
          });

          isLoaded = true;
        }
      } else if (isLoaded) {
        // Pass everyting else to _onMessage
        _onMessage(appConfig, message, origin);
      } else {
        messagePlayback.push(message);
      }
    }
  });
}

/**
  Creates a socket connection from the container to the app using
  <a href="http://easyxdm.net" target="_blank">easyXDM</a>.
  @method _createContainerToAppSocket
  @private
  @param {appConfig} appConfig The F2.AppConfig object
  @param {F2.AppManifest} appManifest The F2.AppManifest object
  @return {object} The new socket
*/
function _createContainerToAppSocket(appConfig, appManifest) {
  var appRoot = jQuery(appConfig.root);

  if (!appRoot) {
    F2.log('Unable to locate app in order to establish secure connection.');
    return;
  }

  var iframeProps = {
    scrolling: 'no',
    style: {
      width: '100%'
    }
  };

  if (appConfig.height) {
    iframeProps.style.height = appConfig.height + 'px';
  }

  var socket = new easyXDM.Socket({
    remote: _secureAppPagePath,
    container: appRoot(0),
    props: iframeProps,
    onMessage: function(message, origin) {
      _onMessage(appConfig, message, origin);
    },
    onReady: function() {
      socket.postMessage(constants.Sockets.LOAD + F2.stringify([appConfig, appManifest], F2.appConfigReplacer));
    }
  });

  return socket;
}

/**
  @method _createRpcCallback
  @private
  @param {string} instanceId The app's Instance ID
  @param {function} callbackId The callback ID
  @return {function} A function to make the RPC call
*/
function _createRpcCallback(instanceId, callbackId) {
  return function() {
    rpc.call(
      instanceId,
      constants.Sockets.RPC_CALLBACK,
      callbackId,
      [].slice.call(arguments).slice(2)
    );
  };
}

/**
  Handles messages that come across the sockets
  @method _onMessage
  @private
  @param {F2.AppConfig} appConfig The F2.AppConfig object
  @param {string} message The socket message
  @param {string} origin The originator
*/
function _onMessage(appConfig, message, origin) {
  var obj;
  var func;

  function parseFunction(parent, functionName) {
    var path = String(functionName).split('.');
    for (var i = 0; i < path.length; i++) {
      if (parent[path[i]] === undefined) {
        parent = undefined;
        break;
      }
      parent = parent[path[i]];
    }
    return parent;
  }

  function parseMessage(regEx, rawMessage, instanceId) {
    var o = F2.parse(rawMessage.replace(regEx, ''));

    // if obj.callbacks
    //   for each callback
    //     for each params
    //       if callback matches param
    //        replace param with _createRpcCallback(app.instanceId, callback)
    if (o.params && o.params.length && o.callbacks && o.callbacks.length) {
      jQuery.each(o.callbacks, function(i, c) {
        jQuery.each(o.params, function(j, p) {
          if (c === p) {
            o.params[j] = _createRpcCallback(instanceId, c);
          }
        });
      });
    }

    return o;
  }

  // Handle UI Call
  if (_rUiCall.test(message)) {
    obj = parseMessage(_rUiCall, message, appConfig.instanceId);
    func = parseFunction(appConfig.ui, obj.functionName);

    if (func !== undefined) {
      func.apply(appConfig.ui, obj.params);
    } else {
      F2.log('Unable to locate UI RPC function: ' + obj.functionName);
    }
  } else if (_rRpc.test(message)) {
    obj = parseMessage(_rRpc, message, appConfig.instanceId);
    func = parseFunction(window, obj.functionName);

    if (func !== undefined) {
      func.apply(func, obj.params);
    } else {
      F2.log('Unable to locate RPC function: ' + obj.functionName);
    }
  } else if (_rRpcCallback.test(message)) {
    obj = parseMessage(_rRpcCallback, message, appConfig.instanceId);

    if (_callbacks[obj.functionName] !== undefined) {
      _callbacks[obj.functionName].apply(_callbacks[obj.functionName], obj.params);
      delete _callbacks[obj.functionName];
    }
  } else if (_rEvents.test(message)) {
    obj = parseMessage(_rEvents, message, appConfig.instanceId);
    events._socketEmit.apply(events, obj);
  }
}

/**
  Registers a callback function
  @method _registerCallback
  @private
  @param {function} callback The callback function
  @return {string} The callback ID
*/
function _registerCallback(callback) {
  var callbackId = F2.guid();
  _callbacks[callbackId] = callback;
  return callbackId;
}

/**
  Handles socket communication between the container and secure apps
  @class F2.Rpc
*/
module.exports = {
  /**
    Broadcast an RPC function to all sockets
    @method broadcast
    @param {string} messageType The message type
    @param {Array} params The parameters to broadcast
  */
  broadcast: function(messageType, params) {
    var message = messageType + F2.stringify(params);

    jQuery.each(_apps, function(i, a) {
      a.socket.postMessage(message);
    });
  },
  /**
    Calls a remote function
    @method call
    @param {string} instanceId The app's Instance ID
    @param {string} messageType The message type
    @param {string} functionName The name of the remote function
    @param {Array} params An array of parameters to pass to the remote
    function. Any functions found within the params will be treated as a
    callback function.
  */
  call: function(instanceId, messageType, functionName, params) {
    // Loop through params and find functions and convert them to callbacks
    var callbacks = [];

    jQuery.each(params, function(i, e) {
      if (typeof e === 'function') {
        var cid = _registerCallback(e);
        params[i] = cid;
        callbacks.push(cid);
      }
    });

    _apps[instanceId].socket.postMessage(
      messageType + F2.stringify({
        functionName: functionName,
        params: params,
        callbacks: callbacks
      })
    );
  },

  /**
    Init function which tells F2.Rpc whether it is running at the container-
    level or the app-level. This method is generally called by
    F2.{{#crossLink "F2/init"}}{{/crossLink}}
    @method init
    @param {string} [secureAppPagePath] The
    {{#crossLink "F2.ContainerConfig"}}{{/crossLink}}.secureAppPagePath
    property
  */
  init: function(secureAppPagePath) {
    _secureAppPagePath = secureAppPagePath;

    if (!_secureAppPagePath) {
      _createAppToContainerSocket();
    }
  },

  /**
    Determines whether the Instance ID is considered to be 'remote'. This is
    determined by checking if 1) the app has an open socket and 2) whether
    F2.Rpc is running inside of an iframe
    @method isRemote
    @param {string} instanceId The Instance ID
    @return {bool} True if there is an open socket
  */
  isRemote: function(instanceId) {
    return (
      _apps[instanceId] !== undefined &&
      _apps[instanceId].config.isSecure &&
      !jQuery(_apps[instanceId].config.root).find('iframe').length
    );
  },

  /**
    Creates a container-to-app or app-to-container socket for communication
    @method register
    @param {F2.AppConfig} [appConfig] The F2.AppConfig object
    @param {F2.AppManifest} [appManifest] The F2.AppManifest object
  */
  register: function(appConfig, appManifest) {
    if (appConfig && appManifest) {
      _apps[appConfig.instanceId] = {
        config: appConfig,
        socket: _createContainerToAppSocket(appConfig, appManifest)
      };
    } else {
      F2.log('Unable to register socket connection. Please check container configuration.');
    }
  }
};

},{"./F2":3,"./constants":17,"./container":20,"./events":21,"./rpc":23,"easyxdm":1,"jquery":undefined}],24:[function(require,module,exports){
require('../vendor/bootstrap-modal');
var classes = require('./classes');
var constants = require('./constants');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var F2 = require('./F2');
var jQuery = require('jquery');
var rpc = require('./rpc');
var ui = require('./ui');

var _containerConfig;

/**
  UI helper methods
  @class F2.UI
  @constructor
  @param {F2.AppConfig} appConfig The F2.AppConfig object
*/
function UIClass(appConfig) {
  var _appConfig = appConfig;
  var $root = jQuery(appConfig.root);

  function _updateHeight(height) {
    height = height || jQuery(_appConfig.root).outerHeight();

    if (rpc.isRemote(_appConfig.instanceId)) {
      rpc.call(
        _appConfig.instanceId,
        constants.Sockets.UI_RPC,
        'updateHeight',
        [
          height
        ]
      );
    } else {
      _appConfig.height = height;
      $root.find('iframe').height(_appConfig.height);
    }
  }

  // http://getbootstrap.com/javascript/#modals
  function _modalHtml(type, message, showCancel) {
    return [
      '<div class="modal">',
        '<div class="modal-dialog">',
          '<div class="modal-content">',
            '<div class="modal-header">',
              '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>',
              '<h4 class="modal-title">', type, '</h4>',
            '</div>',
            '<div class="modal-body"><p>', message, '</p></div>',
            '<div class="modal-footer">',
              ((showCancel) ? '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' : ''),
              '<button type="button" class="btn btn-primary btn-ok">OK</button>',
            '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  return {
    /**
      Removes a overlay from an Element on the page
      @method hideMask
      @param {string|Element} selector The Element or selector to an Element
      that currently contains the loader
    */
    hideMask: function(selector) {
      ui.hideMask(_appConfig.instanceId, selector);
    },
    /**
      Helper methods for creating and using Modals
      @class F2.UI.Modals
      @for F2.UI
    */
    Modals: (function() {
      function _renderAlert(message) {
        return _modalHtml('Alert', message);
      }

      function _renderConfirm(message) {
        return _modalHtml('Confirm', message, true);
      }

      return {
        /**
          Display an alert message on the page
          @method alert
          @param {string} message The message to be displayed
          @param {function} [callback] The callback to be fired when the user
          closes the dialog
          @for F2.UI.Modals
        */
        alert: function(message, callback) {
          if (!F2.isInit()) {
            F2.log('F2.init() must be called before F2.UI.Modals.alert()');
            return;
          }

          if (rpc.isRemote(_appConfig.instanceId)) {
            rpc.call(
              _appConfig.instanceId,
              constants.Sockets.UI_RPC,
              'Modals.alert',
              [].slice.call(arguments)
            );
          } else {
            // Display the alert
            jQuery(_renderAlert(message))
              .on('show.bs.modal', function() {
                var modal = this;
                jQuery(modal).find('.btn-primary').on('click', function() {
                  jQuery(modal).modal('hide').remove();
                  (callback || jQuery.noop)();
                });
              })
              .modal({
                backdrop: true
              });
          }
        },
        /**
          Display a confirm message on the page
          @method confirm
          @param {string} message The message to be displayed
          @param {function} okCallback The function that will be called when
          the OK button is pressed
          @param {function} cancelCallback The function that will be called
          when the Cancel button is pressed
          @for F2.UI.Modals
        */
        confirm: function(message, okCallback, cancelCallback) {
          if (!F2.isInit()) {
            F2.log('F2.init() must be called before F2.UI.Modals.confirm()');
            return;
          }

          if (rpc.isRemote(_appConfig.instanceId)) {
            rpc.call(
              _appConfig.instanceId,
              constants.Sockets.UI_RPC,
              'Modals.confirm',
              [].slice.call(arguments)
            );
          } else {
            // Display the alert
            jQuery(_renderConfirm(message))
              .on('show.bs.modal', function() {
                var modal = this;

                jQuery(modal).find('.btn-ok').on('click', function() {
                  jQuery(modal).modal('hide').remove();
                  (okCallback || jQuery.noop)();
                });

                jQuery(modal).find('.btn-cancel').on('click', function() {
                  jQuery(modal).modal('hide').remove();
                  (cancelCallback || jQuery.noop)();
                });
              })
              .modal({
                backdrop: true
              });
          }
        }
      };
    })(),
    /**
      Sets the title of the app as shown in the browser. Depending on the
      container HTML, this method may do nothing if the container has not been
      configured properly or else the container provider does not allow Title's
      to be set.
      @method setTitle
      @param {string} title The title of the app
      @for F2.UI
    */
    setTitle: function(title) {
      if (rpc.isRemote(_appConfig.instanceId)) {
        rpc.call(
          _appConfig.instanceId,
          constants.Sockets.UI_RPC,
          'setTitle',
          [title]
        );
      } else {
        jQuery(_appConfig.root).find('.' + constants.Css.APP_TITLE).text(title);
      }
    },
    /**
      Display an ovarlay over an Element on the page
      @method showMask
      @param {string|Element} selector The Element or selector to an Element
      over which to display the loader
      @param {bool} showLoader Display a loading icon
    */
    showMask: function(selector, showLoader) {
      F2.UI.showMask(_appConfig.instanceId, selector, showLoader);
    },
    /**
      For secure apps, this method updates the size of the iframe that
      contains the app. **Note: It is recommended that app developers call
      this method anytime Elements are added or removed from the DOM**
      @method updateHeight
      @param {int} height The height of the app
    */
    updateHeight: _updateHeight,
    /**
      Helper methods for creating and using Views
      @class ui.Views
      @for F2.UI
    */
    Views: (function() {
      var _events = new EventEmitter2();
      var eventsPattern = /change/i;

      // Unlimited listeners, set to > 0 for debugging
      _events.setMaxListeners(0);

      function _isValid(eventName) {
        if (!eventsPattern.test(eventName)) {
          F2.log('"' + eventName + '" is not a valid F2.UI.Views event name');
          return false;
        }

        return true;
      }

      return {
        /**
          Change the current view for the app or add an event listener
          @method change
          @param {string|function} [input] If a string is passed in, the view
          will be changed for the app. If a function is passed in, a change
          event listener will be added.
          @for F2.UI.Views
        */
        change: function(input) {
          if (typeof input === 'function') {
            this.on('change', input);
          } else if (typeof input === 'string') {
            if (_appConfig.isSecure && !rpc.isRemote(_appConfig.instanceId)) {
              rpc.call(
                _appConfig.instanceId,
                constants.Sockets.UI_RPC,
                'Views.change',
                [].slice.call(arguments)
              );
            } else if (F2.inArray(input, _appConfig.views)) {
              jQuery('.' + constants.Css.APP_VIEW, $root)
                .addClass('hide')
                .filter('[data-f2-view="' + input + '"]', $root)
                .removeClass('hide');

              _updateHeight();
              _events.emit('change', input);
            }
          }
        },
        /**
          Removes a view event listener
          @method off
          @param {string} event The event name
          @param {function} listener The function that will be removed
          @for F2.UI.Views
        */
        off: function(event, listener) {
          if (_isValid(event)) {
            _events.off(event, listener);
          }
        },
        /**
          Adds a view event listener
          @method on
          @param {string} event The event name
          @param {function} listener The function to be fired when the event is
          emitted
          @for F2.UI.Views
        */
        on: function(event, listener) {
          if (_isValid(event)) {
            _events.on(event, listener);
          }
        }
      };
    })()
  };
}

/**
  Removes a overlay from an Element on the page
  @method hideMask
  @static
  @param {string} instanceId The Instance ID of the app
  @param {string|Element} selector The Element or selector to an Element
  that currently contains the loader
  @for F2.UI
*/
UIClass.hideMask = function(instanceId, selector) {
  if (!F2.isInit()) {
    F2.log('F2.init() must be called before F2.UI.hideMask()');
    return;
  }

  if (rpc.isRemote(instanceId) && !jQuery(selector).is('.' + constants.Css.APP)) {
    rpc.call(
      instanceId,
      constants.Sockets.RPC,
      'F2.UI.hideMask',
      [
        instanceId,
        // Have to pass selector or else there will be stringify errors
        jQuery(selector).selector
      ]
    );
  } else {
    var container = jQuery(selector);
    container.find('> .' + constants.Css.MASK).remove();
    container.removeClass(constants.Css.MASK_CONTAINER);

    // If the element contains this property, reset to static position
    if (container.data(constants.Css.MASK_CONTAINER)) {
      container.css({ 'position': 'static' });
    }
  }
};

/**
  Runs initialization code for the UI class
  @method init
  @static
  @param {F2.ContainerConfig} containerConfig The F2.ContainerConfig object
*/
UIClass.init = function(containerConfig) {
  _containerConfig = containerConfig;
  _containerConfig.UI = jQuery.extend(true, {}, classes.ContainerConfig.UI, _containerConfig.UI || {});
};

/**
  Display an ovarlay over an Element on the page
  @method showMask
  @static
  @param {string} instanceId The Instance ID of the app
  @param {string|Element} selector The Element or selector to an Element over
  which to display the loader
  @param {bool} showLoading Display a loading icon
*/
UIClass.showMask = function(instanceId, selector, showLoading) {
  if (!F2.isInit()) {
    F2.log('F2.init() must be called before F2.UI.showMask()');
    return;
  }

  if (rpc.isRemote(instanceId) && jQuery(selector).is('.' + constants.Css.APP)) {
    rpc.call(
      instanceId,
      constants.Sockets.RPC,
      'F2.UI.showMask',
      [
        instanceId,
        // Have to pass selector or else there will be stringify errors
        jQuery(selector).selector,
        showLoading
      ]
    );
  } else {
    if (showLoading && !_containerConfig.UI.Mask.loadingIcon) {
      F2.log('Unable to display loading icon. Please set F2.ContainerConfig.UI.Mask.loadingIcon	when calling F2.init();');
    }

    var container = jQuery(selector).addClass(constants.Css.MASK_CONTAINER);
    var mask = jQuery('<div>')
      .height('100%')
      .width('100%')
      .addClass(constants.Css.MASK);

    // Set inline styles if useClasses is false
    if (!_containerConfig.UI.Mask.useClasses) {
      mask.css({
        'background-color': _containerConfig.UI.Mask.backgroundColor,
        'background-image': _containerConfig.UI.Mask.loadingIcon ? ('url(' + _containerConfig.UI.Mask.loadingIcon + ')') : '',
        'background-position': '50% 50%',
        'background-repeat': 'no-repeat',
        'display': 'block',
        'left': 0,
        'min-height': 30,
        'padding': 0,
        'position': 'absolute',
        'top': 0,
        'z-index': _containerConfig.UI.Mask.zIndex,
        'filter': 'alpha(opacity=' + (_containerConfig.UI.Mask.opacity * 100) + ')',
        'opacity': _containerConfig.UI.Mask.opacity
      });
    }

    if (container.css('position') === 'static') {
      container.css({ 'position': 'relative' });

      // Setting this property tells hideMask to set the position to static
      container.data(constants.Css.MASK_CONTAINER, true);
    }

    container.append(mask);
  }
};

module.exports = UIClass;

},{"../vendor/bootstrap-modal":25,"./F2":3,"./classes":11,"./constants":17,"./rpc":23,"./ui":24,"eventemitter2":2,"jquery":undefined}],25:[function(require,module,exports){
// TODO: figure out a better way to pass jQuery to this file
var jQuery = require('jquery');

/* ========================================================================
 * Bootstrap: modal.js v3.2.0
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options        = options
    this.$body          = $(document.body)
    this.$element       = $(element)
    this.$backdrop      =
    this.isShown        = null
    this.scrollbarWidth = 0

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.2.0'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.$body.addClass('modal-open')

    this.setScrollbar()
    this.escape()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  Modal.prototype.checkScrollbar = function () {
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', '')
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    if (document.body.clientWidth >= window.innerWidth) return 0
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

},{"jquery":undefined}]},{},[22]);
