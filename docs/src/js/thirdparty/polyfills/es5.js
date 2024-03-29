/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2014 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/v4.0.3/LICENSE
 */
(function (t, e) {
	if (typeof define === 'function' && define.amd) {
		define(e);
	} else if (typeof exports === 'object') {
		module.exports = e();
	} else {
		t.returnExports = e();
	}
})(this, function () {
	var t = Array.prototype;
	var e = Object.prototype;
	var r = Function.prototype;
	var n = String.prototype;
	var i = Number.prototype;
	var a = t.slice;
	var o = t.splice;
	var l = t.push;
	var u = t.unshift;
	var s = r.call;
	var f = e.toString;
	var c = function (t) {
		return e.toString.call(t) === '[object Function]';
	};
	var h = function (t) {
		return e.toString.call(t) === '[object RegExp]';
	};
	var p = function ve(t) {
		return f.call(t) === '[object Array]';
	};
	var v = function ge(t) {
		return f.call(t) === '[object String]';
	};
	var g = function ye(t) {
		var e = f.call(t);
		var r = e === '[object Arguments]';
		if (!r) {
			r =
				!p(t) &&
				t !== null &&
				typeof t === 'object' &&
				typeof t.length === 'number' &&
				t.length >= 0 &&
				c(t.callee);
		}
		return r;
	};
	var y =
		Object.defineProperty &&
		(function () {
			try {
				Object.defineProperty({}, 'x', {});
				return true;
			} catch (t) {
				return false;
			}
		})();
	var d;
	if (y) {
		d = function (t, e, r, n) {
			if (!n && e in t) {
				return;
			}
			Object.defineProperty(t, e, {
				configurable: true,
				enumerable: false,
				writable: true,
				value: r
			});
		};
	} else {
		d = function (t, e, r, n) {
			if (!n && e in t) {
				return;
			}
			t[e] = r;
		};
	}
	var m = function (t, r, n) {
		for (var i in r) {
			if (e.hasOwnProperty.call(r, i)) {
				d(t, i, r[i], n);
			}
		}
	};
	function w(t) {
		t = +t;
		if (t !== t) {
			t = 0;
		} else if (t !== 0 && t !== 1 / 0 && t !== -(1 / 0)) {
			t = (t > 0 || -1) * Math.floor(Math.abs(t));
		}
		return t;
	}
	function b(t) {
		var e = typeof t;
		return (
			t === null ||
			e === 'undefined' ||
			e === 'boolean' ||
			e === 'number' ||
			e === 'string'
		);
	}
	function x(t) {
		var e, r, n;
		if (b(t)) {
			return t;
		}
		r = t.valueOf;
		if (c(r)) {
			e = r.call(t);
			if (b(e)) {
				return e;
			}
		}
		n = t.toString;
		if (c(n)) {
			e = n.call(t);
			if (b(e)) {
				return e;
			}
		}
		throw new TypeError();
	}
	var S = function (t) {
		if (t == null) {
			throw new TypeError("can't convert " + t + ' to object');
		}
		return Object(t);
	};
	var O = function de(t) {
		return t >>> 0;
	};
	function T() {}
	m(r, {
		bind: function me(t) {
			var e = this;
			if (!c(e)) {
				throw new TypeError(
					'Function.prototype.bind called on incompatible ' + e
				);
			}
			var r = a.call(arguments, 1);
			var n = function () {
				if (this instanceof u) {
					var n = e.apply(this, r.concat(a.call(arguments)));
					if (Object(n) === n) {
						return n;
					}
					return this;
				} else {
					return e.apply(t, r.concat(a.call(arguments)));
				}
			};
			var i = Math.max(0, e.length - r.length);
			var o = [];
			for (var l = 0; l < i; l++) {
				o.push('$' + l);
			}
			var u = Function(
				'binder',
				'return function (' +
					o.join(',') +
					'){return binder.apply(this,arguments)}'
			)(n);
			if (e.prototype) {
				T.prototype = e.prototype;
				u.prototype = new T();
				T.prototype = null;
			}
			return u;
		}
	});
	var j = s.bind(e.hasOwnProperty);
	var E;
	var N;
	var I;
	var D;
	var _;
	if ((_ = j(e, '__defineGetter__'))) {
		E = s.bind(e.__defineGetter__);
		N = s.bind(e.__defineSetter__);
		I = s.bind(e.__lookupGetter__);
		D = s.bind(e.__lookupSetter__);
	}
	var M = (function () {
		var t = [1, 2];
		var e = t.splice();
		return t.length === 2 && p(e) && e.length === 0;
	})();
	m(
		t,
		{
			splice: function we(t, e) {
				if (arguments.length === 0) {
					return [];
				} else {
					return o.apply(this, arguments);
				}
			}
		},
		M
	);
	var F = (function () {
		var e = {};
		t.splice.call(e, 0, 0, 1);
		return e.length === 1;
	})();
	m(
		t,
		{
			splice: function be(t, e) {
				if (arguments.length === 0) {
					return [];
				}
				var r = arguments;
				this.length = Math.max(w(this.length), 0);
				if (arguments.length > 0 && typeof e !== 'number') {
					r = a.call(arguments);
					if (r.length < 2) {
						r.push(this.length - t);
					} else {
						r[1] = w(e);
					}
				}
				return o.apply(this, r);
			}
		},
		!F
	);
	var R = [].unshift(0) !== 1;
	m(
		t,
		{
			unshift: function () {
				u.apply(this, arguments);
				return this.length;
			}
		},
		R
	);
	m(Array, { isArray: p });
	var k = Object('a');
	var C = k[0] !== 'a' || !(0 in k);
	var U = function xe(t) {
		var e = true;
		var r = true;
		if (t) {
			t.call('foo', function (t, r, n) {
				if (typeof n !== 'object') {
					e = false;
				}
			});
			t.call(
				[1],
				function () {
					'use strict';
					r = typeof this === 'string';
				},
				'x'
			);
		}
		return !!t && e && r;
	};
	m(
		t,
		{
			forEach: function Se(t) {
				var e = S(this),
					r = C && v(this) ? this.split('') : e,
					n = arguments[1],
					i = -1,
					a = r.length >>> 0;
				if (!c(t)) {
					throw new TypeError();
				}
				while (++i < a) {
					if (i in r) {
						t.call(n, r[i], i, e);
					}
				}
			}
		},
		!U(t.forEach)
	);
	m(
		t,
		{
			map: function Oe(t) {
				var e = S(this),
					r = C && v(this) ? this.split('') : e,
					n = r.length >>> 0,
					i = Array(n),
					a = arguments[1];
				if (!c(t)) {
					throw new TypeError(t + ' is not a function');
				}
				for (var o = 0; o < n; o++) {
					if (o in r) {
						i[o] = t.call(a, r[o], o, e);
					}
				}
				return i;
			}
		},
		!U(t.map)
	);
	m(
		t,
		{
			filter: function Te(t) {
				var e = S(this),
					r = C && v(this) ? this.split('') : e,
					n = r.length >>> 0,
					i = [],
					a,
					o = arguments[1];
				if (!c(t)) {
					throw new TypeError(t + ' is not a function');
				}
				for (var l = 0; l < n; l++) {
					if (l in r) {
						a = r[l];
						if (t.call(o, a, l, e)) {
							i.push(a);
						}
					}
				}
				return i;
			}
		},
		!U(t.filter)
	);
	m(
		t,
		{
			every: function je(t) {
				var e = S(this),
					r = C && v(this) ? this.split('') : e,
					n = r.length >>> 0,
					i = arguments[1];
				if (!c(t)) {
					throw new TypeError(t + ' is not a function');
				}
				for (var a = 0; a < n; a++) {
					if (a in r && !t.call(i, r[a], a, e)) {
						return false;
					}
				}
				return true;
			}
		},
		!U(t.every)
	);
	m(
		t,
		{
			some: function Ee(t) {
				var e = S(this),
					r = C && v(this) ? this.split('') : e,
					n = r.length >>> 0,
					i = arguments[1];
				if (!c(t)) {
					throw new TypeError(t + ' is not a function');
				}
				for (var a = 0; a < n; a++) {
					if (a in r && t.call(i, r[a], a, e)) {
						return true;
					}
				}
				return false;
			}
		},
		!U(t.some)
	);
	var A = false;
	if (t.reduce) {
		A =
			typeof t.reduce.call('es5', function (t, e, r, n) {
				return n;
			}) === 'object';
	}
	m(
		t,
		{
			reduce: function Ne(t) {
				var e = S(this),
					r = C && v(this) ? this.split('') : e,
					n = r.length >>> 0;
				if (!c(t)) {
					throw new TypeError(t + ' is not a function');
				}
				if (!n && arguments.length === 1) {
					throw new TypeError('reduce of empty array with no initial value');
				}
				var i = 0;
				var a;
				if (arguments.length >= 2) {
					a = arguments[1];
				} else {
					do {
						if (i in r) {
							a = r[i++];
							break;
						}
						if (++i >= n) {
							throw new TypeError(
								'reduce of empty array with no initial value'
							);
						}
					} while (true);
				}
				for (; i < n; i++) {
					if (i in r) {
						a = t.call(void 0, a, r[i], i, e);
					}
				}
				return a;
			}
		},
		!A
	);
	var P = false;
	if (t.reduceRight) {
		P =
			typeof t.reduceRight.call('es5', function (t, e, r, n) {
				return n;
			}) === 'object';
	}
	m(
		t,
		{
			reduceRight: function Ie(t) {
				var e = S(this),
					r = C && v(this) ? this.split('') : e,
					n = r.length >>> 0;
				if (!c(t)) {
					throw new TypeError(t + ' is not a function');
				}
				if (!n && arguments.length === 1) {
					throw new TypeError(
						'reduceRight of empty array with no initial value'
					);
				}
				var i,
					a = n - 1;
				if (arguments.length >= 2) {
					i = arguments[1];
				} else {
					do {
						if (a in r) {
							i = r[a--];
							break;
						}
						if (--a < 0) {
							throw new TypeError(
								'reduceRight of empty array with no initial value'
							);
						}
					} while (true);
				}
				if (a < 0) {
					return i;
				}
				do {
					if (a in r) {
						i = t.call(void 0, i, r[a], a, e);
					}
				} while (a--);
				return i;
			}
		},
		!P
	);
	var Z = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
	m(
		t,
		{
			indexOf: function De(t) {
				var e = C && v(this) ? this.split('') : S(this),
					r = e.length >>> 0;
				if (!r) {
					return -1;
				}
				var n = 0;
				if (arguments.length > 1) {
					n = w(arguments[1]);
				}
				n = n >= 0 ? n : Math.max(0, r + n);
				for (; n < r; n++) {
					if (n in e && e[n] === t) {
						return n;
					}
				}
				return -1;
			}
		},
		Z
	);
	var J = Array.prototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;
	m(
		t,
		{
			lastIndexOf: function _e(t) {
				var e = C && v(this) ? this.split('') : S(this),
					r = e.length >>> 0;
				if (!r) {
					return -1;
				}
				var n = r - 1;
				if (arguments.length > 1) {
					n = Math.min(n, w(arguments[1]));
				}
				n = n >= 0 ? n : r - Math.abs(n);
				for (; n >= 0; n--) {
					if (n in e && t === e[n]) {
						return n;
					}
				}
				return -1;
			}
		},
		J
	);
	var z = !{ toString: null }.propertyIsEnumerable('toString'),
		$ = function () {}.propertyIsEnumerable('prototype'),
		G = [
			'toString',
			'toLocaleString',
			'valueOf',
			'hasOwnProperty',
			'isPrototypeOf',
			'propertyIsEnumerable',
			'constructor'
		],
		B = G.length;
	m(Object, {
		keys: function Me(t) {
			var e = c(t),
				r = g(t),
				n = t !== null && typeof t === 'object',
				i = n && v(t);
			if (!n && !e && !r) {
				throw new TypeError('Object.keys called on a non-object');
			}
			var a = [];
			var o = $ && e;
			if (i || r) {
				for (var l = 0; l < t.length; ++l) {
					a.push(String(l));
				}
			} else {
				for (var u in t) {
					if (!(o && u === 'prototype') && j(t, u)) {
						a.push(String(u));
					}
				}
			}
			if (z) {
				var s = t.constructor,
					f = s && s.prototype === t;
				for (var h = 0; h < B; h++) {
					var p = G[h];
					if (!(f && p === 'constructor') && j(t, p)) {
						a.push(p);
					}
				}
			}
			return a;
		}
	});
	var H =
		Object.keys &&
		(function () {
			return Object.keys(arguments).length === 2;
		})(1, 2);
	var L = Object.keys;
	m(
		Object,
		{
			keys: function Fe(e) {
				if (g(e)) {
					return L(t.slice.call(e));
				} else {
					return L(e);
				}
			}
		},
		!H
	);
	var X = -621987552e5;
	var Y = '-000001';
	var q =
		Date.prototype.toISOString && new Date(X).toISOString().indexOf(Y) === -1;
	m(
		Date.prototype,
		{
			toISOString: function Re() {
				var t, e, r, n, i;
				if (!isFinite(this)) {
					throw new RangeError(
						'Date.prototype.toISOString called on non-finite value.'
					);
				}
				n = this.getUTCFullYear();
				i = this.getUTCMonth();
				n += Math.floor(i / 12);
				i = ((i % 12) + 12) % 12;
				t = [
					i + 1,
					this.getUTCDate(),
					this.getUTCHours(),
					this.getUTCMinutes(),
					this.getUTCSeconds()
				];
				n =
					(n < 0 ? '-' : n > 9999 ? '+' : '') +
					('00000' + Math.abs(n)).slice(0 <= n && n <= 9999 ? -4 : -6);
				e = t.length;
				while (e--) {
					r = t[e];
					if (r < 10) {
						t[e] = '0' + r;
					}
				}
				return (
					n +
					'-' +
					t.slice(0, 2).join('-') +
					'T' +
					t.slice(2).join(':') +
					'.' +
					('000' + this.getUTCMilliseconds()).slice(-3) +
					'Z'
				);
			}
		},
		q
	);
	var K = false;
	try {
		K =
			Date.prototype.toJSON &&
			new Date(NaN).toJSON() === null &&
			new Date(X).toJSON().indexOf(Y) !== -1 &&
			Date.prototype.toJSON.call({
				toISOString: function () {
					return true;
				}
			});
	} catch (Q) {}
	if (!K) {
		Date.prototype.toJSON = function ke(t) {
			var e = Object(this),
				r = x(e),
				n;
			if (typeof r === 'number' && !isFinite(r)) {
				return null;
			}
			n = e.toISOString;
			if (typeof n !== 'function') {
				throw new TypeError('toISOString property is not callable');
			}
			return n.call(e);
		};
	}
	var V = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;
	var W =
		!isNaN(Date.parse('2012-04-04T24:00:00.500Z')) ||
		!isNaN(Date.parse('2012-11-31T23:59:59.000Z'));
	var te = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));
	if (!Date.parse || te || W || !V) {
		Date = (function (t) {
			function e(r, n, i, a, o, l, u) {
				var s = arguments.length;
				if (this instanceof t) {
					var f =
						s === 1 && String(r) === r
							? new t(e.parse(r))
							: s >= 7
							? new t(r, n, i, a, o, l, u)
							: s >= 6
							? new t(r, n, i, a, o, l)
							: s >= 5
							? new t(r, n, i, a, o)
							: s >= 4
							? new t(r, n, i, a)
							: s >= 3
							? new t(r, n, i)
							: s >= 2
							? new t(r, n)
							: s >= 1
							? new t(r)
							: new t();
					f.constructor = e;
					return f;
				}
				return t.apply(this, arguments);
			}
			var r = new RegExp(
				'^' +
					'(\\d{4}|[+-]\\d{6})' +
					'(?:-(\\d{2})' +
					'(?:-(\\d{2})' +
					'(?:' +
					'T(\\d{2})' +
					':(\\d{2})' +
					'(?:' +
					':(\\d{2})' +
					'(?:(\\.\\d{1,}))?' +
					')?' +
					'(' +
					'Z|' +
					'(?:' +
					'([-+])' +
					'(\\d{2})' +
					':(\\d{2})' +
					')' +
					')?)?)?)?' +
					'$'
			);
			var n = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
			function i(t, e) {
				var r = e > 1 ? 1 : 0;
				return (
					n[e] +
					Math.floor((t - 1969 + r) / 4) -
					Math.floor((t - 1901 + r) / 100) +
					Math.floor((t - 1601 + r) / 400) +
					365 * (t - 1970)
				);
			}
			function a(e) {
				return Number(new t(1970, 0, 1, 0, 0, 0, e));
			}
			for (var o in t) {
				e[o] = t[o];
			}
			e.now = t.now;
			e.UTC = t.UTC;
			e.prototype = t.prototype;
			e.prototype.constructor = e;
			e.parse = function l(e) {
				var n = r.exec(e);
				if (n) {
					var o = Number(n[1]),
						l = Number(n[2] || 1) - 1,
						u = Number(n[3] || 1) - 1,
						s = Number(n[4] || 0),
						f = Number(n[5] || 0),
						c = Number(n[6] || 0),
						h = Math.floor(Number(n[7] || 0) * 1e3),
						p = Boolean(n[4] && !n[8]),
						v = n[9] === '-' ? 1 : -1,
						g = Number(n[10] || 0),
						y = Number(n[11] || 0),
						d;
					if (
						s < (f > 0 || c > 0 || h > 0 ? 24 : 25) &&
						f < 60 &&
						c < 60 &&
						h < 1e3 &&
						l > -1 &&
						l < 12 &&
						g < 24 &&
						y < 60 &&
						u > -1 &&
						u < i(o, l + 1) - i(o, l)
					) {
						d = ((i(o, l) + u) * 24 + s + g * v) * 60;
						d = ((d + f + y * v) * 60 + c) * 1e3 + h;
						if (p) {
							d = a(d);
						}
						if (-864e13 <= d && d <= 864e13) {
							return d;
						}
					}
					return NaN;
				}
				return t.parse.apply(this, arguments);
			};
			return e;
		})(Date);
	}
	if (!Date.now) {
		Date.now = function Ce() {
			return new Date().getTime();
		};
	}
	var ee =
		i.toFixed &&
		((8e-5).toFixed(3) !== '0.000' ||
			(0.9).toFixed(0) !== '1' ||
			(1.255).toFixed(2) !== '1.25' ||
			(0xde0b6b3a7640080).toFixed(0) !== '1000000000000000128');
	var re = {
		base: 1e7,
		size: 6,
		data: [0, 0, 0, 0, 0, 0],
		multiply: function Ue(t, e) {
			var r = -1;
			while (++r < re.size) {
				e += t * re.data[r];
				re.data[r] = e % re.base;
				e = Math.floor(e / re.base);
			}
		},
		divide: function Ae(t) {
			var e = re.size,
				r = 0;
			while (--e >= 0) {
				r += re.data[e];
				re.data[e] = Math.floor(r / t);
				r = (r % t) * re.base;
			}
		},
		numToString: function Pe() {
			var t = re.size;
			var e = '';
			while (--t >= 0) {
				if (e !== '' || t === 0 || re.data[t] !== 0) {
					var r = String(re.data[t]);
					if (e === '') {
						e = r;
					} else {
						e += '0000000'.slice(0, 7 - r.length) + r;
					}
				}
			}
			return e;
		},
		pow: function Ze(t, e, r) {
			return e === 0
				? r
				: e % 2 === 1
				? Ze(t, e - 1, r * t)
				: Ze(t * t, e / 2, r);
		},
		log: function Je(t) {
			var e = 0;
			while (t >= 4096) {
				e += 12;
				t /= 4096;
			}
			while (t >= 2) {
				e += 1;
				t /= 2;
			}
			return e;
		}
	};
	m(
		i,
		{
			toFixed: function ze(t) {
				var e, r, n, i, a, o, l, u;
				e = Number(t);
				e = e !== e ? 0 : Math.floor(e);
				if (e < 0 || e > 20) {
					throw new RangeError(
						'Number.toFixed called with invalid number of decimals'
					);
				}
				r = Number(this);
				if (r !== r) {
					return 'NaN';
				}
				if (r <= -1e21 || r >= 1e21) {
					return String(r);
				}
				n = '';
				if (r < 0) {
					n = '-';
					r = -r;
				}
				i = '0';
				if (r > 1e-21) {
					a = re.log(r * re.pow(2, 69, 1)) - 69;
					o = a < 0 ? r * re.pow(2, -a, 1) : r / re.pow(2, a, 1);
					o *= 4503599627370496;
					a = 52 - a;
					if (a > 0) {
						re.multiply(0, o);
						l = e;
						while (l >= 7) {
							re.multiply(1e7, 0);
							l -= 7;
						}
						re.multiply(re.pow(10, l, 1), 0);
						l = a - 1;
						while (l >= 23) {
							re.divide(1 << 23);
							l -= 23;
						}
						re.divide(1 << l);
						re.multiply(1, 1);
						re.divide(2);
						i = re.numToString();
					} else {
						re.multiply(0, o);
						re.multiply(1 << -a, 0);
						i = re.numToString() + '0.00000000000000000000'.slice(2, 2 + e);
					}
				}
				if (e > 0) {
					u = i.length;
					if (u <= e) {
						i = n + '0.0000000000000000000'.slice(0, e - u + 2) + i;
					} else {
						i = n + i.slice(0, u - e) + '.' + i.slice(u - e);
					}
				} else {
					i = n + i;
				}
				return i;
			}
		},
		ee
	);
	var ne = n.split;
	if (
		'ab'.split(/(?:ab)*/).length !== 2 ||
		'.'.split(/(.?)(.?)/).length !== 4 ||
		'tesst'.split(/(s)*/)[1] === 't' ||
		'test'.split(/(?:)/, -1).length !== 4 ||
		''.split(/.?/).length ||
		'.'.split(/()()/).length > 1
	) {
		(function () {
			var e = /()??/.exec('')[1] === void 0;
			n.split = function (r, n) {
				var i = this;
				if (r === void 0 && n === 0) {
					return [];
				}
				if (f.call(r) !== '[object RegExp]') {
					return ne.call(this, r, n);
				}
				var a = [],
					o =
						(r.ignoreCase ? 'i' : '') +
						(r.multiline ? 'm' : '') +
						(r.extended ? 'x' : '') +
						(r.sticky ? 'y' : ''),
					l = 0,
					u,
					s,
					c,
					h;
				r = new RegExp(r.source, o + 'g');
				i += '';
				if (!e) {
					u = new RegExp('^' + r.source + '$(?!\\s)', o);
				}
				n = n === void 0 ? -1 >>> 0 : O(n);
				while ((s = r.exec(i))) {
					c = s.index + s[0].length;
					if (c > l) {
						a.push(i.slice(l, s.index));
						if (!e && s.length > 1) {
							s[0].replace(u, function () {
								for (var t = 1; t < arguments.length - 2; t++) {
									if (arguments[t] === void 0) {
										s[t] = void 0;
									}
								}
							});
						}
						if (s.length > 1 && s.index < i.length) {
							t.push.apply(a, s.slice(1));
						}
						h = s[0].length;
						l = c;
						if (a.length >= n) {
							break;
						}
					}
					if (r.lastIndex === s.index) {
						r.lastIndex++;
					}
				}
				if (l === i.length) {
					if (h || !r.test('')) {
						a.push('');
					}
				} else {
					a.push(i.slice(l));
				}
				return a.length > n ? a.slice(0, n) : a;
			};
		})();
	} else if ('0'.split(void 0, 0).length) {
		n.split = function $e(t, e) {
			if (t === void 0 && e === 0) {
				return [];
			}
			return ne.call(this, t, e);
		};
	}
	var ie = n.replace;
	var ae = (function () {
		var t = [];
		'x'.replace(/x(.)?/g, function (e, r) {
			t.push(r);
		});
		return t.length === 1 && typeof t[0] === 'undefined';
	})();
	if (!ae) {
		n.replace = function Ge(t, e) {
			var r = c(e);
			var n = h(t) && /\)[*?]/.test(t.source);
			if (!r || !n) {
				return ie.call(this, t, e);
			} else {
				var i = function (r) {
					var n = arguments.length;
					var i = t.lastIndex;
					t.lastIndex = 0;
					var a = t.exec(r);
					t.lastIndex = i;
					a.push(arguments[n - 2], arguments[n - 1]);
					return e.apply(this, a);
				};
				return ie.call(this, t, i);
			}
		};
	}
	var oe = n.substr;
	var le = ''.substr && '0b'.substr(-1) !== 'b';
	m(
		n,
		{
			substr: function Be(t, e) {
				return oe.call(
					this,
					t < 0 ? ((t = this.length + t) < 0 ? 0 : t) : t,
					e
				);
			}
		},
		le
	);
	var ue =
		' \n\f\r \xa0\u1680\u180e\u2000\u2001\u2002\u2003' +
		'\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028' +
		'\u2029\ufeff';
	var se = '\u200b';
	var fe = '[' + ue + ']';
	var ce = new RegExp('^' + fe + fe + '*');
	var he = new RegExp(fe + fe + '*$');
	var pe = n.trim && (ue.trim() || !se.trim());
	m(
		n,
		{
			trim: function He() {
				if (this === void 0 || this === null) {
					throw new TypeError("can't convert " + this + ' to object');
				}
				return String(this).replace(ce, '').replace(he, '');
			}
		},
		pe
	);
	if (parseInt(ue + '08') !== 8 || parseInt(ue + '0x16') !== 22) {
		parseInt = (function (t) {
			var e = /^0[xX]/;
			return function r(n, i) {
				n = String(n).trim();
				if (!Number(i)) {
					i = e.test(n) ? 16 : 10;
				}
				return t(n, i);
			};
		})(parseInt);
	}
});
//# sourceMappingURL=es5-shim.map

if (typeof Object.create != 'function') {
	Object.create = (function () {
		var Object = function () {};
		return function (prototype) {
			if (arguments.length > 1) {
				throw Error('Second argument not supported');
			}
			if (typeof prototype != 'object') {
				throw TypeError('Argument must be an object');
			}
			Object.prototype = prototype;
			var result = new Object();
			Object.prototype = null;
			return result;
		};
	})();
}
