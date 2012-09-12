/*! JSON v3.2.3 | http://bestiejs.github.com/json3 | Copyright 2012, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Convenience aliases.
  var getClass = {}.toString, isProperty, forEach, undef;

  // Detect the `define` function exposed by asynchronous module loaders and set
  // up the internal `JSON3` namespace. The strict equality check for `define`
  // is necessary for compatibility with the RequireJS optimizer (`r.js`).
  var isLoader = typeof define === "function" && define.amd, JSON3 = typeof exports == "object" && exports;

  // A JSON source string used to test the native `stringify` and `parse`
  // implementations.
  var serialized = '{"A":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';

  // Feature tests to determine whether the native `JSON.stringify` and `parse`
  // implementations are spec-compliant. Based on work by Ken Snyder.
  var stringifySupported, Escapes, toPaddedString, quote, serialize;
  var parseSupported, fromCharCode, Unescapes, abort, lex, get, walk, update, Index, Source;

  // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
  var value = new Date(-3509827334573292), floor, Months, getDay;

  try {
    // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
    // results for certain dates in Opera >= 10.53.
    value = value.getUTCFullYear() == -109252 && value.getUTCMonth() === 0 && value.getUTCDate() == 1 &&
      // Safari < 2.0.2 stores the internal millisecond time value correctly,
      // but clips the values returned by the date methods to the range of
      // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
      value.getUTCHours() == 10 && value.getUTCMinutes() == 37 && value.getUTCSeconds() == 6 && value.getUTCMilliseconds() == 708;
  } catch (exception) {}

  // Define additional utility methods if the `Date` methods are buggy.
  if (!value) {
    floor = Math.floor;
    // A mapping between the months of the year and the number of days between
    // January 1st and the first of the respective month.
    Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    // Internal: Calculates the number of days between the Unix epoch and the
    // first day of the given month.
    getDay = function (year, month) {
      return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
    };
  }

  // Export JSON 3 for asynchronous module loaders, CommonJS environments, web
  // browsers, and JavaScript engines. Credits: Oyvind Sean Kinsey.
  if (isLoader || JSON3) {
    if (isLoader) {
      // Export for asynchronous module loaders. The `JSON3` namespace is
      // redefined because module loaders do not provide the `exports` object.
      define("json", (JSON3 = {}));
    }
    if (typeof JSON == "object" && JSON) {
      // Delegate to the native `stringify` and `parse` implementations in
      // asynchronous module loaders and CommonJS environments.
      JSON3.stringify = JSON.stringify;
      JSON3.parse = JSON.parse;
    }
  } else {
    // Export for browsers and JavaScript engines.
    JSON3 = this.JSON || (this.JSON = {});
  }

  // Test `JSON.stringify`.
  if ((stringifySupported = typeof JSON3.stringify == "function" && !getDay)) {
    // A test function object with a custom `toJSON` method.
    (value = function () {
      return 1;
    }).toJSON = value;
    try {
      stringifySupported =
        // Firefox 3.1b1 and b2 serialize string, number, and boolean
        // primitives as object literals.
        JSON3.stringify(0) === "0" &&
        // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
        // literals.
        JSON3.stringify(new Number()) === "0" &&
        JSON3.stringify(new String()) == '""' &&
        // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
        // does not define a canonical JSON representation (this applies to
        // objects with `toJSON` properties as well, *unless* they are nested
        // within an object or array).
        JSON3.stringify(getClass) === undef &&
        // IE 8 serializes `undefined` as `"undefined"`. Safari 5.1.2 and FF
        // 3.1b3 pass this test.
        JSON3.stringify(undef) === undef &&
        // Safari 5.1.2 and FF 3.1b3 throw `Error`s and `TypeError`s,
        // respectively, if the value is omitted entirely.
        JSON3.stringify() === undef &&
        // FF 3.1b1, 2 throw an error if the given value is not a number,
        // string, array, object, Boolean, or `null` literal. This applies to
        // objects with custom `toJSON` methods as well, unless they are nested
        // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
        // methods entirely.
        JSON3.stringify(value) === "1" &&
        JSON3.stringify([value]) == "[1]" &&
        // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
        // `"[null]"`.
        JSON3.stringify([undef]) == "[null]" &&
        // YUI 3.0.0b1 fails to serialize `null` literals.
        JSON3.stringify(null) == "null" &&
        // FF 3.1b1, 2 halts serialization if an array contains a function:
        // `[1, true, getClass, 1]` serializes as "[1,true,],". These versions
        // of Firefox also allow trailing commas in JSON objects and arrays.
        // FF 3.1b3 elides non-JSON values from objects and arrays, unless they
        // define custom `toJSON` methods.
        JSON3.stringify([undef, getClass, null]) == "[null,null,null]" &&
        // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
        // where character escape codes are expected (e.g., `\b` => `\u0008`).
        JSON3.stringify({ "result": [value, true, false, null, "\0\b\n\f\r\t"] }) == serialized &&
        // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
        JSON3.stringify(null, value) === "1" &&
        JSON3.stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
        // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
        // serialize extended years.
        JSON3.stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
        // The milliseconds are optional in ES 5, but required in 5.1.
        JSON3.stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
        // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
        // four-digit years instead of six-digit years. Credits: @Yaffle.
        JSON3.stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
        // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
        // values less than 1000. Credits: @Yaffle.
        JSON3.stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
    } catch (exception) {
      stringifySupported = false;
    }
  }

  // Test `JSON.parse`.
  if (typeof JSON3.parse == "function") {
    try {
      // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
      // Conforming implementations should also coerce the initial argument to
      // a string prior to parsing.
      if (JSON3.parse("0") === 0 && !JSON3.parse(false)) {
        // Simple parsing test.
        value = JSON3.parse(serialized);
        if ((parseSupported = value.A.length == 5 && value.A[0] == 1)) {
          try {
            // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
            parseSupported = !JSON3.parse('"\t"');
          } catch (exception) {}
          if (parseSupported) {
            try {
              // FF 4.0 and 4.0.1 allow leading `+` signs, and leading and
              // trailing decimal points. FF 4.0, 4.0.1, and IE 9 also allow
              // certain octal literals.
              parseSupported = JSON3.parse("01") != 1;
            } catch (exception) {}
          }
        }
      }
    } catch (exception) {
      parseSupported = false;
    }
  }

  // Clean up the variables used for the feature tests.
  value = serialized = null;

  if (!stringifySupported || !parseSupported) {
    // Internal: Determines if a property is a direct property of the given
    // object. Delegates to the native `Object#hasOwnProperty` method.
    if (!(isProperty = {}.hasOwnProperty)) {
      isProperty = function (property) {
        var members = {}, constructor;
        if ((members.__proto__ = null, members.__proto__ = {
          // The *proto* property cannot be set multiple times in recent
          // versions of Firefox and SeaMonkey.
          "toString": 1
        }, members).toString != getClass) {
          // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
          // supports the mutable *proto* property.
          isProperty = function (property) {
            // Capture and break the object's prototype chain (see section 8.6.2
            // of the ES 5.1 spec). The parenthesized expression prevents an
            // unsafe transformation by the Closure Compiler.
            var original = this.__proto__, result = property in (this.__proto__ = null, this);
            // Restore the original prototype chain.
            this.__proto__ = original;
            return result;
          };
        } else {
          // Capture a reference to the top-level `Object` constructor.
          constructor = members.constructor;
          // Use the `constructor` property to simulate `Object#hasOwnProperty` in
          // other environments.
          isProperty = function (property) {
            var parent = (this.constructor || constructor).prototype;
            return property in this && !(property in parent && this[property] === parent[property]);
          };
        }
        members = null;
        return isProperty.call(this, property);
      };
    }

    // Internal: Normalizes the `for...in` iteration algorithm across
    // environments. Each enumerated key is yielded to a `callback` function.
    forEach = function (object, callback) {
      var size = 0, Properties, members, property, forEach;

      // Tests for bugs in the current environment's `for...in` algorithm. The
      // `valueOf` property inherits the non-enumerable flag from
      // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
      (Properties = function () {
        this.valueOf = 0;
      }).prototype.valueOf = 0;

      // Iterate over a new instance of the `Properties` class.
      members = new Properties();
      for (property in members) {
        // Ignore all properties inherited from `Object.prototype`.
        if (isProperty.call(members, property)) {
          size++;
        }
      }
      Properties = members = null;

      // Normalize the iteration algorithm.
      if (!size) {
        // A list of non-enumerable properties inherited from `Object.prototype`.
        members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
        // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
        // properties.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == "[object Function]", property, length;
          for (property in object) {
            // Gecko <= 1.0 enumerates the `prototype` property of functions under
            // certain conditions; IE does not.
            if (!(isFunction && property == "prototype") && isProperty.call(object, property)) {
              callback(property);
            }
          }
          // Manually invoke the callback for each non-enumerable property.
          for (length = members.length; property = members[--length]; isProperty.call(object, property) && callback(property));
        };
      } else if (size == 2) {
        // Safari <= 2.0.4 enumerates shadowed properties twice.
        forEach = function (object, callback) {
          // Create a set of iterated properties.
          var members = {}, isFunction = getClass.call(object) == "[object Function]", property;
          for (property in object) {
            // Store each property name to prevent double enumeration. The
            // `prototype` property of functions is not enumerated due to cross-
            // environment inconsistencies.
            if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
              callback(property);
            }
          }
        };
      } else {
        // No bugs detected; use the standard `for...in` algorithm.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == "[object Function]", property, isConstructor;
          for (property in object) {
            if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
              callback(property);
            }
          }
          // Manually invoke the callback for the `constructor` property due to
          // cross-environment inconsistencies.
          if (isConstructor || isProperty.call(object, (property = "constructor"))) {
            callback(property);
          }
        };
      }
      return forEach(object, callback);
    };

    // Public: Serializes a JavaScript `value` as a JSON string. The optional
    // `filter` argument may specify either a function that alters how object and
    // array members are serialized, or an array of strings and numbers that
    // indicates which properties should be serialized. The optional `width`
    // argument may be either a string or number that specifies the indentation
    // level of the output.
    if (!stringifySupported) {
      // Internal: A map of control characters and their escaped equivalents.
      Escapes = {
        "\\": "\\\\",
        '"': '\\"',
        "\b": "\\b",
        "\f": "\\f",
        "\n": "\\n",
        "\r": "\\r",
        "\t": "\\t"
      };

      // Internal: Converts `value` into a zero-padded string such that its
      // length is at least equal to `width`. The `width` must be <= 6.
      toPaddedString = function (width, value) {
        // The `|| 0` expression is necessary to work around a bug in
        // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
        return ("000000" + (value || 0)).slice(-width);
      };

      // Internal: Double-quotes a string `value`, replacing all ASCII control
      // characters (characters with code unit values between 0 and 31) with
      // their escaped equivalents. This is an implementation of the
      // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
      quote = function (value) {
        var result = '"', index = 0, symbol;
        for (; symbol = value.charAt(index); index++) {
          // Escape the reverse solidus, double quote, backspace, form feed, line
          // feed, carriage return, and tab characters.
          result += '\\"\b\f\n\r\t'.indexOf(symbol) > -1 ? Escapes[symbol] :
            // If the character is a control character, append its Unicode escape
            // sequence; otherwise, append the character as-is.
            symbol < " " ? "\\u00" + toPaddedString(2, symbol.charCodeAt(0).toString(16)) : symbol;
        }
        return result + '"';
      };

      // Internal: Recursively serializes an object. Implements the
      // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
      serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
        var value = object[property], className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, any;
        if (typeof value == "object" && value) {
          className = getClass.call(value);
          if (className == "[object Date]" && !isProperty.call(value, "toJSON")) {
            if (value > -1 / 0 && value < 1 / 0) {
              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              if (getDay) {
                // Manually compute the year, month, date, hours, minutes,
                // seconds, and milliseconds if the `getUTC*` methods are
                // buggy. Adapted from @Yaffle's `date-shim` project.
                date = floor(value / 864e5);
                for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                date = 1 + date - getDay(year, month);
                // The `time` value specifies the time within the day (see ES
                // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                // to compute `A modulo B`, as the `%` operator does not
                // correspond to the `modulo` operation for negative numbers.
                time = (value % 864e5 + 864e5) % 864e5;
                // The hours, minutes, seconds, and milliseconds are obtained by
                // decomposing the time within the day. See section 15.9.1.10.
                hours = floor(time / 36e5) % 24;
                minutes = floor(time / 6e4) % 60;
                seconds = floor(time / 1e3) % 60;
                milliseconds = time % 1e3;
              } else {
                year = value.getUTCFullYear();
                month = value.getUTCMonth();
                date = value.getUTCDate();
                hours = value.getUTCHours();
                minutes = value.getUTCMinutes();
                seconds = value.getUTCSeconds();
                milliseconds = value.getUTCMilliseconds();
              }
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                // Months, dates, hours, minutes, and seconds should have two
                // digits; milliseconds should have three.
                "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                // Milliseconds are optional in ES 5.0, but required in 5.1.
                "." + toPaddedString(3, milliseconds) + "Z";
            } else {
              value = null;
            }
          } else if (typeof value.toJSON == "function" && ((className != "[object Number]" && className != "[object String]" && className != "[object Array]") || isProperty.call(value, "toJSON"))) {
            // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
            // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
            // ignores all `toJSON` methods on these objects unless they are
            // defined directly on an instance.
            value = value.toJSON(property);
          }
        }
        if (callback) {
          // If a replacement function was provided, call it to obtain the value
          // for serialization.
          value = callback.call(object, property, value);
        }
        if (value === null) {
          return "null";
        }
        className = getClass.call(value);
        if (className == "[object Boolean]") {
          // Booleans are represented literally.
          return "" + value;
        } else if (className == "[object Number]") {
          // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
          // `"null"`.
          return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
        } else if (className == "[object String]") {
          // Strings are double-quoted and escaped.
          return quote(value);
        }
        // Recursively serialize objects and arrays.
        if (typeof value == "object") {
          // Check for cyclic structures. This is a linear search; performance
          // is inversely proportional to the number of unique nested objects.
          for (length = stack.length; length--;) {
            if (stack[length] === value) {
              // Cyclic structures cannot be serialized by `JSON.stringify`.
              throw TypeError();
            }
          }
          // Add the object to the stack of traversed objects.
          stack.push(value);
          results = [];
          // Save the current indentation level and indent one additional level.
          prefix = indentation;
          indentation += whitespace;
          if (className == "[object Array]") {
            // Recursively serialize array elements.
            for (index = 0, length = value.length; index < length; any || (any = true), index++) {
              element = serialize(index, value, callback, properties, whitespace, indentation, stack);
              results.push(element === undef ? "null" : element);
            }
            return any ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
          } else {
            // Recursively serialize object members. Members are selected from
            // either a user-specified list of property names, or the object
            // itself.
            forEach(properties || value, function (property) {
              var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
              if (element !== undef) {
                // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                // is not the empty string, let `member` {quote(property) + ":"}
                // be the concatenation of `member` and the `space` character."
                // The "`space` character" refers to the literal space
                // character, not the `space` {width} argument provided to
                // `JSON.stringify`.
                results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
              }
              any || (any = true);
            });
            return any ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
          }
          // Remove the object from the traversed object stack.
          stack.pop();
        }
      };

      // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
      JSON3.stringify = function (source, filter, width) {
        var whitespace, callback, properties, index, length, value;
        if (typeof filter == "function" || typeof filter == "object" && filter) {
          if (getClass.call(filter) == "[object Function]") {
            callback = filter;
          } else if (getClass.call(filter) == "[object Array]") {
            // Convert the property names array into a makeshift set.
            properties = {};
            for (index = 0, length = filter.length; index < length; value = filter[index++], ((getClass.call(value) == "[object String]" || getClass.call(value) == "[object Number]") && (properties[value] = 1)));
          }
        }
        if (width) {
          if (getClass.call(width) == "[object Number]") {
            // Convert the `width` to an integer and create a string containing
            // `width` number of space characters.
            if ((width -= width % 1) > 0) {
              for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
            }
          } else if (getClass.call(width) == "[object String]") {
            whitespace = width.length <= 10 ? width : width.slice(0, 10);
          }
        }
        // Opera <= 7.54u2 discards the values associated with empty string keys
        // (`""`) only if they are used directly within an object member list
        // (e.g., `!("" in { "": 1})`).
        return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
      };
    }

    // Public: Parses a JSON source string.
    if (!parseSupported) {
      fromCharCode = String.fromCharCode;
      // Internal: A map of escaped control characters and their unescaped
      // equivalents.
      Unescapes = {
        "\\": "\\",
        '"': '"',
        "/": "/",
        "b": "\b",
        "t": "\t",
        "n": "\n",
        "f": "\f",
        "r": "\r"
      };

      // Internal: Resets the parser state and throws a `SyntaxError`.
      abort = function() {
        Index = Source = null;
        throw SyntaxError();
      };

      // Internal: Returns the next token, or `"$"` if the parser has reached
      // the end of the source string. A token may be a string, number, `null`
      // literal, or Boolean literal.
      lex = function () {
        var source = Source, length = source.length, symbol, value, begin, position, sign;
        while (Index < length) {
          symbol = source.charAt(Index);
          if ("\t\r\n ".indexOf(symbol) > -1) {
            // Skip whitespace tokens, including tabs, carriage returns, line
            // feeds, and space characters.
            Index++;
          } else if ("{}[]:,".indexOf(symbol) > -1) {
            // Parse a punctuator token at the current position.
            Index++;
            return symbol;
          } else if (symbol == '"') {
            // Advance to the next character and parse a JSON string at the
            // current position. String tokens are prefixed with the sentinel
            // `@` character to distinguish them from punctuators.
            for (value = "@", Index++; Index < length;) {
              symbol = source.charAt(Index);
              if (symbol < " ") {
                // Unescaped ASCII control characters are not permitted.
                abort();
              } else if (symbol == "\\") {
                // Parse escaped JSON control characters, `"`, `\`, `/`, and
                // Unicode escape sequences.
                symbol = source.charAt(++Index);
                if ('\\"/btnfr'.indexOf(symbol) > -1) {
                  // Revive escaped control characters.
                  value += Unescapes[symbol];
                  Index++;
                } else if (symbol == "u") {
                  // Advance to the first character of the escape sequence.
                  begin = ++Index;
                  // Validate the Unicode escape sequence.
                  for (position = Index + 4; Index < position; Index++) {
                    symbol = source.charAt(Index);
                    // A valid sequence comprises four hexdigits that form a
                    // single hexadecimal value.
                    if (!(symbol >= "0" && symbol <= "9" || symbol >= "a" && symbol <= "f" || symbol >= "A" && symbol <= "F")) {
                      // Invalid Unicode escape sequence.
                      abort();
                    }
                  }
                  // Revive the escaped character.
                  value += fromCharCode("0x" + source.slice(begin, Index));
                } else {
                  // Invalid escape sequence.
                  abort();
                }
              } else {
                if (symbol == '"') {
                  // An unescaped double-quote character marks the end of the
                  // string.
                  break;
                }
                // Append the original character as-is.
                value += symbol;
                Index++;
              }
            }
            if (source.charAt(Index) == '"') {
              Index++;
              // Return the revived string.
              return value;
            }
            // Unterminated string.
            abort();
          } else {
            // Parse numbers and literals.
            begin = Index;
            // Advance the scanner's position past the sign, if one is
            // specified.
            if (symbol == "-") {
              sign = true;
              symbol = source.charAt(++Index);
            }
            // Parse an integer or floating-point value.
            if (symbol >= "0" && symbol <= "9") {
              // Leading zeroes are interpreted as octal literals.
              if (symbol == "0" && (symbol = source.charAt(Index + 1), symbol >= "0" && symbol <= "9")) {
                // Illegal octal literal.
                abort();
              }
              sign = false;
              // Parse the integer component.
              for (; Index < length && (symbol = source.charAt(Index), symbol >= "0" && symbol <= "9"); Index++);
              // Floats cannot contain a leading decimal point; however, this
              // case is already accounted for by the parser.
              if (source.charAt(Index) == ".") {
                position = ++Index;
                // Parse the decimal component.
                for (; position < length && (symbol = source.charAt(position), symbol >= "0" && symbol <= "9"); position++);
                if (position == Index) {
                  // Illegal trailing decimal.
                  abort();
                }
                Index = position;
              }
              // Parse exponents.
              symbol = source.charAt(Index);
              if (symbol == "e" || symbol == "E") {
                // Skip past the sign following the exponent, if one is
                // specified.
                symbol = source.charAt(++Index);
                if (symbol == "+" || symbol == "-") {
                  Index++;
                }
                // Parse the exponential component.
                for (position = Index; position < length && (symbol = source.charAt(position), symbol >= "0" && symbol <= "9"); position++);
                if (position == Index) {
                  // Illegal empty exponent.
                  abort();
                }
                Index = position;
              }
              // Coerce the parsed value to a JavaScript number.
              return +source.slice(begin, Index);
            }
            // A negative sign may only precede numbers.
            if (sign) {
              abort();
            }
            // `true`, `false`, and `null` literals.
            if (source.slice(Index, Index + 4) == "true") {
              Index += 4;
              return true;
            } else if (source.slice(Index, Index + 5) == "false") {
              Index += 5;
              return false;
            } else if (source.slice(Index, Index + 4) == "null") {
              Index += 4;
              return null;
            }
            // Unrecognized token.
            abort();
          }
        }
        // Return the sentinel `$` character if the parser has reached the end
        // of the source string.
        return "$";
      };

      // Internal: Parses a JSON `value` token.
      get = function (value) {
        var results, any, key;
        if (value == "$") {
          // Unexpected end of input.
          abort();
        }
        if (typeof value == "string") {
          if (value.charAt(0) == "@") {
            // Remove the sentinel `@` character.
            return value.slice(1);
          }
          // Parse object and array literals.
          if (value == "[") {
            // Parses a JSON array, returning a new JavaScript array.
            results = [];
            for (;; any || (any = true)) {
              value = lex();
              // A closing square bracket marks the end of the array literal.
              if (value == "]") {
                break;
              }
              // If the array literal contains elements, the current token
              // should be a comma separating the previous element from the
              // next.
              if (any) {
                if (value == ",") {
                  value = lex();
                  if (value == "]") {
                    // Unexpected trailing `,` in array literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each array element.
                  abort();
                }
              }
              // Elisions and leading commas are not permitted.
              if (value == ",") {
                abort();
              }
              results.push(get(value));
            }
            return results;
          } else if (value == "{") {
            // Parses a JSON object, returning a new JavaScript object.
            results = {};
            for (;; any || (any = true)) {
              value = lex();
              // A closing curly brace marks the end of the object literal.
              if (value == "}") {
                break;
              }
              // If the object literal contains members, the current token
              // should be a comma separator.
              if (any) {
                if (value == ",") {
                  value = lex();
                  if (value == "}") {
                    // Unexpected trailing `,` in object literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each object member.
                  abort();
                }
              }
              // Leading commas are not permitted, object property names must be
              // double-quoted strings, and a `:` must separate each property
              // name and value.
              if (value == "," || typeof value != "string" || value.charAt(0) != "@" || lex() != ":") {
                abort();
              }
              results[value.slice(1)] = get(lex());
            }
            return results;
          }
          // Unexpected token encountered.
          abort();
        }
        return value;
      };

      // Internal: Updates a traversed object member.
      update = function(source, property, callback) {
        var element = walk(source, property, callback);
        if (element === undef) {
          delete source[property];
        } else {
          source[property] = element;
        }
      };

      // Internal: Recursively traverses a parsed JSON object, invoking the
      // `callback` function for each value. This is an implementation of the
      // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
      walk = function (source, property, callback) {
        var value = source[property], length;
        if (typeof value == "object" && value) {
          if (getClass.call(value) == "[object Array]") {
            for (length = value.length; length--;) {
              update(value, length, callback);
            }
          } else {
            // `forEach` can't be used to traverse an array in Opera <= 8.54,
            // as `Object#hasOwnProperty` returns `false` for array indices
            // (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            forEach(value, function (property) {
              update(value, property, callback);
            });
          }
        }
        return callback.call(source, property, value);
      };

      // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
      JSON3.parse = function (source, callback) {
        Index = 0;
        Source = source;
        var result = get(lex());
        // If a JSON string contains multiple tokens, it is invalid.
        if (lex() != "$") {
          abort();
        }
        // Reset the parser state.
        Index = Source = null;
        return callback && getClass.call(callback) == "[object Function]" ? walk((value = {}, value[""] = result, value), "", callback) : result;
      };
    }
  }
}).call(this);
/*!
 * Copyright (c) 2011 hij1nx http://www.twitter.com/hij1nx
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
;!function(exports, undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = new Object;
  }

  function configure(conf) {
    if (conf) {
      conf.delimiter && (this.delimiter = conf.delimiter);
      conf.wildcard && (this.wildcard = conf.wildcard);
      if (this.wildcard) {
        this.listenerTree = new Object;
      }
    }
  }

  function EventEmitter(conf) {
    this._events = new Object;
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
        tree[name] = new Object;
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
  };

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
    };

    listener._origin = fn;

    this.on(event, listener);

    return self;
  };

  EventEmitter.prototype.emit = function() {
    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener') {
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
          return this;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1)
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
    define(function() {
      return EventEmitter;
    });
  } else {
    exports.EventEmitter2 = EventEmitter; 
  }

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);

/*!
 * easyXDM
 * http://easyxdm.net/
 * Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
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
(function(N,d,p,K,k,H){var b=this;var n=Math.floor(Math.random()*10000);var q=Function.prototype;var Q=/^((http.?:)\/\/([^:\/\s]+)(:\d+)*)/;var R=/[\-\w]+\/\.\.\//;var F=/([^:])\/\//g;var I="";var o={};var M=N.easyXDM;var U="easyXDM_";var E;var y=false;var i;var h;function C(X,Z){var Y=typeof X[Z];return Y=="function"||(!!(Y=="object"&&X[Z]))||Y=="unknown"}function u(X,Y){return !!(typeof(X[Y])=="object"&&X[Y])}function r(X){return Object.prototype.toString.call(X)==="[object Array]"}function c(){try{var X=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");i=Array.prototype.slice.call(X.GetVariable("$version").match(/(\d+),(\d+),(\d+),(\d+)/),1);h=parseInt(i[0],10)>9&&parseInt(i[1],10)>0;X=null;return true}catch(Y){return false}}var v,x;if(C(N,"addEventListener")){v=function(Z,X,Y){Z.addEventListener(X,Y,false)};x=function(Z,X,Y){Z.removeEventListener(X,Y,false)}}else{if(C(N,"attachEvent")){v=function(X,Z,Y){X.attachEvent("on"+Z,Y)};x=function(X,Z,Y){X.detachEvent("on"+Z,Y)}}else{throw new Error("Browser not supported")}}var W=false,J=[],L;if("readyState" in d){L=d.readyState;W=L=="complete"||(~navigator.userAgent.indexOf("AppleWebKit/")&&(L=="loaded"||L=="interactive"))}else{W=!!d.body}function s(){if(W){return}W=true;for(var X=0;X<J.length;X++){J[X]()}J.length=0}if(!W){if(C(N,"addEventListener")){v(d,"DOMContentLoaded",s)}else{v(d,"readystatechange",function(){if(d.readyState=="complete"){s()}});if(d.documentElement.doScroll&&N===top){var g=function(){if(W){return}try{d.documentElement.doScroll("left")}catch(X){K(g,1);return}s()};g()}}v(N,"load",s)}function G(Y,X){if(W){Y.call(X);return}J.push(function(){Y.call(X)})}function m(){var Z=parent;if(I!==""){for(var X=0,Y=I.split(".");X<Y.length;X++){Z=Z[Y[X]]}}return Z.easyXDM}function e(X){N.easyXDM=M;I=X;if(I){U="easyXDM_"+I.replace(".","_")+"_"}return o}function z(X){return X.match(Q)[3]}function f(X){return X.match(Q)[4]||""}function j(Z){var X=Z.toLowerCase().match(Q);var aa=X[2],ab=X[3],Y=X[4]||"";if((aa=="http:"&&Y==":80")||(aa=="https:"&&Y==":443")){Y=""}return aa+"//"+ab+Y}function B(X){X=X.replace(F,"$1/");if(!X.match(/^(http||https):\/\//)){var Y=(X.substring(0,1)==="/")?"":p.pathname;if(Y.substring(Y.length-1)!=="/"){Y=Y.substring(0,Y.lastIndexOf("/")+1)}X=p.protocol+"//"+p.host+Y+X}while(R.test(X)){X=X.replace(R,"")}return X}function P(X,aa){var ac="",Z=X.indexOf("#");if(Z!==-1){ac=X.substring(Z);X=X.substring(0,Z)}var ab=[];for(var Y in aa){if(aa.hasOwnProperty(Y)){ab.push(Y+"="+H(aa[Y]))}}return X+(y?"#":(X.indexOf("?")==-1?"?":"&"))+ab.join("&")+ac}var S=(function(X){X=X.substring(1).split("&");var Z={},aa,Y=X.length;while(Y--){aa=X[Y].split("=");Z[aa[0]]=k(aa[1])}return Z}(/xdm_e=/.test(p.search)?p.search:p.hash));function t(X){return typeof X==="undefined"}var O=function(){var Y={};var Z={a:[1,2,3]},X='{"a":[1,2,3]}';if(typeof JSON!="undefined"&&typeof JSON.stringify==="function"&&JSON.stringify(Z).replace((/\s/g),"")===X){return JSON}if(Object.toJSON){if(Object.toJSON(Z).replace((/\s/g),"")===X){Y.stringify=Object.toJSON}}if(typeof String.prototype.evalJSON==="function"){Z=X.evalJSON();if(Z.a&&Z.a.length===3&&Z.a[2]===3){Y.parse=function(aa){return aa.evalJSON()}}}if(Y.stringify&&Y.parse){O=function(){return Y};return Y}return null};function T(X,Y,Z){var ab;for(var aa in Y){if(Y.hasOwnProperty(aa)){if(aa in X){ab=Y[aa];if(typeof ab==="object"){T(X[aa],ab,Z)}else{if(!Z){X[aa]=Y[aa]}}}else{X[aa]=Y[aa]}}}return X}function a(){var Y=d.body.appendChild(d.createElement("form")),X=Y.appendChild(d.createElement("input"));X.name=U+"TEST"+n;E=X!==Y.elements[X.name];d.body.removeChild(Y)}function A(X){if(t(E)){a()}var Z;if(E){Z=d.createElement('<iframe name="'+X.props.name+'"/>')}else{Z=d.createElement("IFRAME");Z.name=X.props.name}Z.id=Z.name=X.props.name;delete X.props.name;if(X.onLoad){v(Z,"load",X.onLoad)}if(typeof X.container=="string"){X.container=d.getElementById(X.container)}if(!X.container){T(Z.style,{position:"absolute",top:"-2000px"});X.container=d.body}var Y=X.props.src;delete X.props.src;T(Z,X.props);Z.border=Z.frameBorder=0;Z.allowTransparency=true;X.container.appendChild(Z);Z.src=Y;X.props.src=Y;return Z}function V(aa,Z){if(typeof aa=="string"){aa=[aa]}var Y,X=aa.length;while(X--){Y=aa[X];Y=new RegExp(Y.substr(0,1)=="^"?Y:("^"+Y.replace(/(\*)/g,".$1").replace(/\?/g,".")+"$"));if(Y.test(Z)){return true}}return false}function l(Z){var ae=Z.protocol,Y;Z.isHost=Z.isHost||t(S.xdm_p);y=Z.hash||false;if(!Z.props){Z.props={}}if(!Z.isHost){Z.channel=S.xdm_c;Z.secret=S.xdm_s;Z.remote=S.xdm_e;ae=S.xdm_p;if(Z.acl&&!V(Z.acl,Z.remote)){throw new Error("Access denied for "+Z.remote)}}else{Z.remote=B(Z.remote);Z.channel=Z.channel||"default"+n++;Z.secret=Math.random().toString(16).substring(2);if(t(ae)){if(j(p.href)==j(Z.remote)){ae="4"}else{if(C(N,"postMessage")||C(d,"postMessage")){ae="1"}else{if(Z.swf&&C(N,"ActiveXObject")&&c()){ae="6"}else{if(navigator.product==="Gecko"&&"frameElement" in N&&navigator.userAgent.indexOf("WebKit")==-1){ae="5"}else{if(Z.remoteHelper){Z.remoteHelper=B(Z.remoteHelper);ae="2"}else{ae="0"}}}}}}}Z.protocol=ae;switch(ae){case"0":T(Z,{interval:100,delay:2000,useResize:true,useParent:false,usePolling:false},true);if(Z.isHost){if(!Z.local){var ac=p.protocol+"//"+p.host,X=d.body.getElementsByTagName("img"),ad;var aa=X.length;while(aa--){ad=X[aa];if(ad.src.substring(0,ac.length)===ac){Z.local=ad.src;break}}if(!Z.local){Z.local=N}}var ab={xdm_c:Z.channel,xdm_p:0};if(Z.local===N){Z.usePolling=true;Z.useParent=true;Z.local=p.protocol+"//"+p.host+p.pathname+p.search;ab.xdm_e=Z.local;ab.xdm_pa=1}else{ab.xdm_e=B(Z.local)}if(Z.container){Z.useResize=false;ab.xdm_po=1}Z.remote=P(Z.remote,ab)}else{T(Z,{channel:S.xdm_c,remote:S.xdm_e,useParent:!t(S.xdm_pa),usePolling:!t(S.xdm_po),useResize:Z.useParent?false:Z.useResize})}Y=[new o.stack.HashTransport(Z),new o.stack.ReliableBehavior({}),new o.stack.QueueBehavior({encode:true,maxLength:4000-Z.remote.length}),new o.stack.VerifyBehavior({initiate:Z.isHost})];break;case"1":Y=[new o.stack.PostMessageTransport(Z)];break;case"2":Y=[new o.stack.NameTransport(Z),new o.stack.QueueBehavior(),new o.stack.VerifyBehavior({initiate:Z.isHost})];break;case"3":Y=[new o.stack.NixTransport(Z)];break;case"4":Y=[new o.stack.SameOriginTransport(Z)];break;case"5":Y=[new o.stack.FrameElementTransport(Z)];break;case"6":if(!i){c()}Y=[new o.stack.FlashTransport(Z)];break}Y.push(new o.stack.QueueBehavior({lazy:Z.lazy,remove:true}));return Y}function D(aa){var ab,Z={incoming:function(ad,ac){this.up.incoming(ad,ac)},outgoing:function(ac,ad){this.down.outgoing(ac,ad)},callback:function(ac){this.up.callback(ac)},init:function(){this.down.init()},destroy:function(){this.down.destroy()}};for(var Y=0,X=aa.length;Y<X;Y++){ab=aa[Y];T(ab,Z,true);if(Y!==0){ab.down=aa[Y-1]}if(Y!==X-1){ab.up=aa[Y+1]}}return ab}function w(X){X.up.down=X.down;X.down.up=X.up;X.up=X.down=null}T(o,{version:"2.4.15.118",query:S,stack:{},apply:T,getJSONObject:O,whenReady:G,noConflict:e});o.DomHelper={on:v,un:x,requiresJSON:function(X){if(!u(N,"JSON")){d.write('<script type="text/javascript" src="'+X+'"><\/script>')}}};(function(){var X={};o.Fn={set:function(Y,Z){X[Y]=Z},get:function(Z,Y){var aa=X[Z];if(Y){delete X[Z]}return aa}}}());o.Socket=function(Y){var X=D(l(Y).concat([{incoming:function(ab,aa){Y.onMessage(ab,aa)},callback:function(aa){if(Y.onReady){Y.onReady(aa)}}}])),Z=j(Y.remote);this.origin=j(Y.remote);this.destroy=function(){X.destroy()};this.postMessage=function(aa){X.outgoing(aa,Z)};X.init()};o.Rpc=function(Z,Y){if(Y.local){for(var ab in Y.local){if(Y.local.hasOwnProperty(ab)){var aa=Y.local[ab];if(typeof aa==="function"){Y.local[ab]={method:aa}}}}}var X=D(l(Z).concat([new o.stack.RpcBehavior(this,Y),{callback:function(ac){if(Z.onReady){Z.onReady(ac)}}}]));this.origin=j(Z.remote);this.destroy=function(){X.destroy()};X.init()};o.stack.SameOriginTransport=function(Y){var Z,ab,aa,X;return(Z={outgoing:function(ad,ae,ac){aa(ad);if(ac){ac()}},destroy:function(){if(ab){ab.parentNode.removeChild(ab);ab=null}},onDOMReady:function(){X=j(Y.remote);if(Y.isHost){T(Y.props,{src:P(Y.remote,{xdm_e:p.protocol+"//"+p.host+p.pathname,xdm_c:Y.channel,xdm_p:4}),name:U+Y.channel+"_provider"});ab=A(Y);o.Fn.set(Y.channel,function(ac){aa=ac;K(function(){Z.up.callback(true)},0);return function(ad){Z.up.incoming(ad,X)}})}else{aa=m().Fn.get(Y.channel,true)(function(ac){Z.up.incoming(ac,X)});K(function(){Z.up.callback(true)},0)}},init:function(){G(Z.onDOMReady,Z)}})};o.stack.FlashTransport=function(aa){var ac,X,ab,ad,Y,ae;function af(ah,ag){K(function(){ac.up.incoming(ah,ad)},0)}function Z(ah){var ag=aa.swf+"?host="+aa.isHost;var aj="easyXDM_swf_"+Math.floor(Math.random()*10000);o.Fn.set("flash_loaded"+ah.replace(/[\-.]/g,"_"),function(){o.stack.FlashTransport[ah].swf=Y=ae.firstChild;var ak=o.stack.FlashTransport[ah].queue;for(var al=0;al<ak.length;al++){ak[al]()}ak.length=0});if(aa.swfContainer){ae=(typeof aa.swfContainer=="string")?d.getElementById(aa.swfContainer):aa.swfContainer}else{ae=d.createElement("div");T(ae.style,h&&aa.swfNoThrottle?{height:"20px",width:"20px",position:"fixed",right:0,top:0}:{height:"1px",width:"1px",position:"absolute",overflow:"hidden",right:0,top:0});d.body.appendChild(ae)}var ai="callback=flash_loaded"+ah.replace(/[\-.]/g,"_")+"&proto="+b.location.protocol+"&domain="+z(b.location.href)+"&port="+f(b.location.href)+"&ns="+I;ae.innerHTML="<object height='20' width='20' type='application/x-shockwave-flash' id='"+aj+"' data='"+ag+"'><param name='allowScriptAccess' value='always'></param><param name='wmode' value='transparent'><param name='movie' value='"+ag+"'></param><param name='flashvars' value='"+ai+"'></param><embed type='application/x-shockwave-flash' FlashVars='"+ai+"' allowScriptAccess='always' wmode='transparent' src='"+ag+"' height='1' width='1'></embed></object>"}return(ac={outgoing:function(ah,ai,ag){Y.postMessage(aa.channel,ah.toString());if(ag){ag()}},destroy:function(){try{Y.destroyChannel(aa.channel)}catch(ag){}Y=null;if(X){X.parentNode.removeChild(X);X=null}},onDOMReady:function(){ad=aa.remote;o.Fn.set("flash_"+aa.channel+"_init",function(){K(function(){ac.up.callback(true)})});o.Fn.set("flash_"+aa.channel+"_onMessage",af);aa.swf=B(aa.swf);var ah=z(aa.swf);var ag=function(){o.stack.FlashTransport[ah].init=true;Y=o.stack.FlashTransport[ah].swf;Y.createChannel(aa.channel,aa.secret,j(aa.remote),aa.isHost);if(aa.isHost){if(h&&aa.swfNoThrottle){T(aa.props,{position:"fixed",right:0,top:0,height:"20px",width:"20px"})}T(aa.props,{src:P(aa.remote,{xdm_e:j(p.href),xdm_c:aa.channel,xdm_p:6,xdm_s:aa.secret}),name:U+aa.channel+"_provider"});X=A(aa)}};if(o.stack.FlashTransport[ah]&&o.stack.FlashTransport[ah].init){ag()}else{if(!o.stack.FlashTransport[ah]){o.stack.FlashTransport[ah]={queue:[ag]};Z(ah)}else{o.stack.FlashTransport[ah].queue.push(ag)}}},init:function(){G(ac.onDOMReady,ac)}})};o.stack.PostMessageTransport=function(aa){var ac,ad,Y,Z;function X(ae){if(ae.origin){return j(ae.origin)}if(ae.uri){return j(ae.uri)}if(ae.domain){return p.protocol+"//"+ae.domain}throw"Unable to retrieve the origin of the event"}function ab(af){var ae=X(af);if(ae==Z&&af.data.substring(0,aa.channel.length+1)==aa.channel+" "){ac.up.incoming(af.data.substring(aa.channel.length+1),ae)}}return(ac={outgoing:function(af,ag,ae){Y.postMessage(aa.channel+" "+af,ag||Z);if(ae){ae()}},destroy:function(){x(N,"message",ab);if(ad){Y=null;ad.parentNode.removeChild(ad);ad=null}},onDOMReady:function(){Z=j(aa.remote);if(aa.isHost){var ae=function(af){if(af.data==aa.channel+"-ready"){Y=("postMessage" in ad.contentWindow)?ad.contentWindow:ad.contentWindow.document;x(N,"message",ae);v(N,"message",ab);K(function(){ac.up.callback(true)},0)}};v(N,"message",ae);T(aa.props,{src:P(aa.remote,{xdm_e:j(p.href),xdm_c:aa.channel,xdm_p:1}),name:U+aa.channel+"_provider"});ad=A(aa)}else{v(N,"message",ab);Y=("postMessage" in N.parent)?N.parent:N.parent.document;Y.postMessage(aa.channel+"-ready",Z);K(function(){ac.up.callback(true)},0)}},init:function(){G(ac.onDOMReady,ac)}})};o.stack.FrameElementTransport=function(Y){var Z,ab,aa,X;return(Z={outgoing:function(ad,ae,ac){aa.call(this,ad);if(ac){ac()}},destroy:function(){if(ab){ab.parentNode.removeChild(ab);ab=null}},onDOMReady:function(){X=j(Y.remote);if(Y.isHost){T(Y.props,{src:P(Y.remote,{xdm_e:j(p.href),xdm_c:Y.channel,xdm_p:5}),name:U+Y.channel+"_provider"});ab=A(Y);ab.fn=function(ac){delete ab.fn;aa=ac;K(function(){Z.up.callback(true)},0);return function(ad){Z.up.incoming(ad,X)}}}else{if(d.referrer&&j(d.referrer)!=S.xdm_e){N.top.location=S.xdm_e}aa=N.frameElement.fn(function(ac){Z.up.incoming(ac,X)});Z.up.callback(true)}},init:function(){G(Z.onDOMReady,Z)}})};o.stack.NameTransport=function(ab){var ac;var ae,ai,aa,ag,ah,Y,X;function af(al){var ak=ab.remoteHelper+(ae?"#_3":"#_2")+ab.channel;ai.contentWindow.sendMessage(al,ak)}function ad(){if(ae){if(++ag===2||!ae){ac.up.callback(true)}}else{af("ready");ac.up.callback(true)}}function aj(ak){ac.up.incoming(ak,Y)}function Z(){if(ah){K(function(){ah(true)},0)}}return(ac={outgoing:function(al,am,ak){ah=ak;af(al)},destroy:function(){ai.parentNode.removeChild(ai);ai=null;if(ae){aa.parentNode.removeChild(aa);aa=null}},onDOMReady:function(){ae=ab.isHost;ag=0;Y=j(ab.remote);ab.local=B(ab.local);if(ae){o.Fn.set(ab.channel,function(al){if(ae&&al==="ready"){o.Fn.set(ab.channel,aj);ad()}});X=P(ab.remote,{xdm_e:ab.local,xdm_c:ab.channel,xdm_p:2});T(ab.props,{src:X+"#"+ab.channel,name:U+ab.channel+"_provider"});aa=A(ab)}else{ab.remoteHelper=ab.remote;o.Fn.set(ab.channel,aj)}ai=A({props:{src:ab.local+"#_4"+ab.channel},onLoad:function ak(){var al=ai||this;x(al,"load",ak);o.Fn.set(ab.channel+"_load",Z);(function am(){if(typeof al.contentWindow.sendMessage=="function"){ad()}else{K(am,50)}}())}})},init:function(){G(ac.onDOMReady,ac)}})};o.stack.HashTransport=function(Z){var ac;var ah=this,af,aa,X,ad,am,ab,al;var ag,Y;function ak(ao){if(!al){return}var an=Z.remote+"#"+(am++)+"_"+ao;((af||!ag)?al.contentWindow:al).location=an}function ae(an){ad=an;ac.up.incoming(ad.substring(ad.indexOf("_")+1),Y)}function aj(){if(!ab){return}var an=ab.location.href,ap="",ao=an.indexOf("#");if(ao!=-1){ap=an.substring(ao)}if(ap&&ap!=ad){ae(ap)}}function ai(){aa=setInterval(aj,X)}return(ac={outgoing:function(an,ao){ak(an)},destroy:function(){N.clearInterval(aa);if(af||!ag){al.parentNode.removeChild(al)}al=null},onDOMReady:function(){af=Z.isHost;X=Z.interval;ad="#"+Z.channel;am=0;ag=Z.useParent;Y=j(Z.remote);if(af){Z.props={src:Z.remote,name:U+Z.channel+"_provider"};if(ag){Z.onLoad=function(){ab=N;ai();ac.up.callback(true)}}else{var ap=0,an=Z.delay/50;(function ao(){if(++ap>an){throw new Error("Unable to reference listenerwindow")}try{ab=al.contentWindow.frames[U+Z.channel+"_consumer"]}catch(aq){}if(ab){ai();ac.up.callback(true)}else{K(ao,50)}}())}al=A(Z)}else{ab=N;ai();if(ag){al=parent;ac.up.callback(true)}else{T(Z,{props:{src:Z.remote+"#"+Z.channel+new Date(),name:U+Z.channel+"_consumer"},onLoad:function(){ac.up.callback(true)}});al=A(Z)}}},init:function(){G(ac.onDOMReady,ac)}})};o.stack.ReliableBehavior=function(Y){var aa,ac;var ab=0,X=0,Z="";return(aa={incoming:function(af,ad){var ae=af.indexOf("_"),ag=af.substring(0,ae).split(",");af=af.substring(ae+1);if(ag[0]==ab){Z="";if(ac){ac(true)}}if(af.length>0){aa.down.outgoing(ag[1]+","+ab+"_"+Z,ad);if(X!=ag[1]){X=ag[1];aa.up.incoming(af,ad)}}},outgoing:function(af,ad,ae){Z=af;ac=ae;aa.down.outgoing(X+","+(++ab)+"_"+af,ad)}})};o.stack.QueueBehavior=function(Z){var ac,ad=[],ag=true,aa="",af,X=0,Y=false,ab=false;function ae(){if(Z.remove&&ad.length===0){w(ac);return}if(ag||ad.length===0||af){return}ag=true;var ah=ad.shift();ac.down.outgoing(ah.data,ah.origin,function(ai){ag=false;if(ah.callback){K(function(){ah.callback(ai)},0)}ae()})}return(ac={init:function(){if(t(Z)){Z={}}if(Z.maxLength){X=Z.maxLength;ab=true}if(Z.lazy){Y=true}else{ac.down.init()}},callback:function(ai){ag=false;var ah=ac.up;ae();ah.callback(ai)},incoming:function(ak,ai){if(ab){var aj=ak.indexOf("_"),ah=parseInt(ak.substring(0,aj),10);aa+=ak.substring(aj+1);if(ah===0){if(Z.encode){aa=k(aa)}ac.up.incoming(aa,ai);aa=""}}else{ac.up.incoming(ak,ai)}},outgoing:function(al,ai,ak){if(Z.encode){al=H(al)}var ah=[],aj;if(ab){while(al.length!==0){aj=al.substring(0,X);al=al.substring(aj.length);ah.push(aj)}while((aj=ah.shift())){ad.push({data:ah.length+"_"+aj,origin:ai,callback:ah.length===0?ak:null})}}else{ad.push({data:al,origin:ai,callback:ak})}if(Y){ac.down.init()}else{ae()}},destroy:function(){af=true;ac.down.destroy()}})};o.stack.VerifyBehavior=function(ab){var ac,aa,Y,Z=false;function X(){aa=Math.random().toString(16).substring(2);ac.down.outgoing(aa)}return(ac={incoming:function(af,ad){var ae=af.indexOf("_");if(ae===-1){if(af===aa){ac.up.callback(true)}else{if(!Y){Y=af;if(!ab.initiate){X()}ac.down.outgoing(af)}}}else{if(af.substring(0,ae)===Y){ac.up.incoming(af.substring(ae+1),ad)}}},outgoing:function(af,ad,ae){ac.down.outgoing(aa+"_"+af,ad,ae)},callback:function(ad){if(ab.initiate){X()}}})};o.stack.RpcBehavior=function(ad,Y){var aa,af=Y.serializer||O();var ae=0,ac={};function X(ag){ag.jsonrpc="2.0";aa.down.outgoing(af.stringify(ag))}function ab(ag,ai){var ah=Array.prototype.slice;return function(){var aj=arguments.length,al,ak={method:ai};if(aj>0&&typeof arguments[aj-1]==="function"){if(aj>1&&typeof arguments[aj-2]==="function"){al={success:arguments[aj-2],error:arguments[aj-1]};ak.params=ah.call(arguments,0,aj-2)}else{al={success:arguments[aj-1]};ak.params=ah.call(arguments,0,aj-1)}ac[""+(++ae)]=al;ak.id=ae}else{ak.params=ah.call(arguments,0)}if(ag.namedParams&&ak.params.length===1){ak.params=ak.params[0]}X(ak)}}function Z(an,am,ai,al){if(!ai){if(am){X({id:am,error:{code:-32601,message:"Procedure not found."}})}return}var ak,ah;if(am){ak=function(ao){ak=q;X({id:am,result:ao})};ah=function(ao,ap){ah=q;var aq={id:am,error:{code:-32099,message:ao}};if(ap){aq.error.data=ap}X(aq)}}else{ak=ah=q}if(!r(al)){al=[al]}try{var ag=ai.method.apply(ai.scope,al.concat([ak,ah]));if(!t(ag)){ak(ag)}}catch(aj){ah(aj.message)}}return(aa={incoming:function(ah,ag){var ai=af.parse(ah);if(ai.method){if(Y.handle){Y.handle(ai,X)}else{Z(ai.method,ai.id,Y.local[ai.method],ai.params)}}else{var aj=ac[ai.id];if(ai.error){if(aj.error){aj.error(ai.error)}}else{if(aj.success){aj.success(ai.result)}}delete ac[ai.id]}},init:function(){if(Y.remote){for(var ag in Y.remote){if(Y.remote.hasOwnProperty(ag)){ad[ag]=ab(Y.remote[ag],ag)}}}aa.down.init()},destroy:function(){for(var ag in Y.remote){if(Y.remote.hasOwnProperty(ag)&&ad.hasOwnProperty(ag)){delete ad[ag]}}aa.down.destroy()}})};b.easyXDM=o})(window,document,location,window.setTimeout,decodeURIComponent,encodeURIComponent);
/*!
 * F2 v0.12.2
 * Copyright (c) 2012 Markit Group Limited http://www.openf2.com
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
if (!window.F2) {
	/**
	 * Open F2
	 * @module f2
	 * @main f2
	 */
	F2 = {
		/**
		 * Function to pass into F2.stringify which will prevent circular reference
		 * errors when serializing objects
		 * @method appConfigReplacer
		 */
		appConfigReplacer:function(key, value) {
			if (key == 'root' || key == 'ui') {
				return undefined;
			} else {
				return value;
			}
		},
		/**
		 * The Apps class is a namespace for App developers to place the javascript
		 * class that is used to initialize their App. The javascript classes should
		 * be namepaced with the {{#crossLink "F2.AppConfig"}}{{/crossLink}}.appId. It is recommended
		 * that the code be placed in a closure to help keep the global namespace
		 * clean.
		 *
		 * If the class has an 'init' function, that function will be called 
		 * automatically.
		 * @property Apps
		 * @type object
		 * @example
		 *     F2.Apps["712521f7737666e1489f681817376592"] = (function() {
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
		 *     F2.Apps["712521f7737666e1489f681817376592"] = function(appConfig, appContent, root) {
		 *        return {
		 *            init:function() {
		 *                // perform init actions
		 *            }
		 *        };
		 *     };
		 * @for F2
		 */
		Apps:{},
		/**
		 * Creates a namespace on F2 and copies the contents of an object into
		 * that namespace optionally overwriting existing properties.
		 * @method extend
		 * @param {string} ns The namespace to create. Pass a falsy value to 
		 * add properties to the F2 namespace directly.
		 * @param {object} obj The object to copy into the namespace.
		 * @param {bool} overwrite True if object properties should be overwritten
		 * @returns {object} The created object
		 */
		extend:function (ns, obj, overwrite) {
			var isFunc = typeof obj === 'function';
			var parts = ns ? ns.split('.') : [];
			var parent = window.F2;
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
		guid:function() {
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
		 */
		inArray:function(value, array) {
			return $.inArray(value, array) > -1;
		},
		/**
		 * Wrapper logging function.
		 * @method log
		 * @param {object} obj An object to be logged
		 * @param {object} [obj2]* An object to be logged
		 */
		log:function() {
			if (window.console && window.console.log) {
				console.log([].slice.call(arguments));
			}
		},
		/**
		 * Wrapper to convert a JSON string to an object
		 * @method parse
		 * @param {string} str The JSON string to convert
		 * @returns {object} The parsed object
		 */
		parse:function(str) {
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
		 * @param {function|Array} replacer an optional parameter that determines
		 * how object values are stringified for objects. It can be a function or an 
		 * array of strings.
		 * @param {int|string} space an optional parameter that specifies the
		 * indentation of nested structures. If it is omitted, the text will be
		 * packed without extra whitespace. If it is a number, it will specify the
		 * number of spaces to indent at each level. If it is a string (such as '\t'
		 * or '&nbsp;'), it contains the characters used to indent at each level.
		 * @returns {string} The JSON string
		 */
		stringify:function(value, replacer, space) {
			return JSON.stringify(value, replacer, space);
		}
	};
}
/**
 * Class stubs for documentation purposes
 * @main F2
 */
F2.extend("", {
	/**
	 * The App Class is an optional class that can be namespaced onto the 
	 * {{#crossLink "F2\Apps"}}{{/crossLink}} property.  The 
	 * [F2 Docs](../../developing-f2-apps.html#app-class)
	 * has more information on the usage of the App Class.
	 * @class F2.App
	 * @constructor
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object for the App
	 * @param {F2.AppManifest.AppContent} appContent The F2.AppManifest.AppContent
	 * object
	 * @param {Element} root The root DOM Element for the App
	 */
	App:function(appConfig, appContent, root) {
		return {
			/**
			 * An optional init function that will automatically be called when
			 * F2.{{#crossLink "F2\registerApps"}}{{/crossLink}} is called.
			 * @method init
			 * @optional
			 */
			init:function() {}
		};
	},
	/**
	 * The AppConfig object represents an App's meta data
	 * @class F2.AppConfig
	 */
	AppConfig:{
		/**
		 * The unique ID of the App
		 * @property appId
		 * @type string
		 * @required
		 */
		appId:"",
		/**
		 * An object that represents the context of an App
		 * @property context
		 * @type object
		 */
		context:"",
		/**
		 * True if the App should be requested in a single request with other Apps.
		 * The App must have isSecure = false.
		 * @property enableBatchRequests
		 * @type bool
		 * @default false
		 */
		enableBatchRequests:false,
		/**
		 * The height of the App. The initial height will be pulled from
		 * the {{#crossLink "F2.AppConfig"}}{{/crossLink}} object, but later modified by
		 * firing an
		 * {{#crossLink "F2.Constants.Events"}}{{/crossLink}}.APP_HEIGHT_CHANGE
		 * event.
		 * @property height
		 * @type int
		 */
		height:0,
		/**
		 * The unique runtime ID of the App.
		 *
		 * **This property populated during the
		 * F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process**
		 * @property instanceId
		 * @type string
		 */
		instanceId:"",
		/**
		 * True if the App will be loaded in an iframe. This property
		 * will be true if the {{#crossLink "F2.AppConfig"}}{{/crossLink}} object sets
		 * isSecure = true. It will also be true if the Container has decided to run
		 * Apps in iframes.
		 * @property isSecure
		 * @type bool
		 * @default false
		 */
		isSecure:false,
		/**
		 * The url to retrieve the {{#crossLink "F2.AppManifest"}}{{/crossLink}} object.
		 * @property manifestUrl
		 * @type string
		 * @required
		 */
		manifestUrl:"",
		/**
		 * The recommended maximum width in pixels that this app should be run.
		 * It is up to the Container to implement the logic to prevent an App
		 * from being run when the maxWidth requirements are not met.
		 * @property maxWidth
		 * @type int
		 */
		maxWidth:0,
		/**
		 * The recommended minimum grid size that this app should be run. This
		 * value corresponds to the 12-grid system that is used by the Container.
		 * This property should be set by Apps that require a certain number of 
		 * columns in their layout.
		 * @property minGridSize
		 * @type int
		 * @default 4
		 */
		minGridSize:4,
		/**
		 * The recommended minimum width in pixels that this app should be 
		 * run. It is up to the Container to implement the logic to prevent
		 * an App from being run when the minWidth requirements are not met.
		 * @property minWidth
		 * @type int
		 * @default 300
		 */
		minWidth:300,
		/**
		 * The name of the App
		 * @property name
		 * @type string
		 * @required
		 */
		name:"",
		/**
		 * The root DOM element that contains the App
		 *
		 * **This property populated during the
		 * F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process**
		 * @property root
		 * @type Element
		 */
		root:undefined,
		/**
		 * The instance of F2.UI providing easy access to F2.UI methods
		 *
		 * **This property populated during the
		 * F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process**
		 * @property ui
		 * @type F2.UI
		 */
		ui:undefined,
		/**
		 * The views that this App supports. Available views
		 * are defined in {{#crossLink "F2.Constants.Views"}}{{/crossLink}}. The
		 * presence of a view can be checked via
		 * F2.{{#crossLink "F2/inArray"}}{{/crossLink}}:
		 * 
		 *     F2.inArray(F2.Constants.Views.SETTINGS, app.views)
		 *
		 * @property views
		 * @type Array
		 */
		views:[]
	},
	/**
	 * The assets needed to render an App on the page
	 * @class F2.AppManifest
	 */
	AppManifest:{
		/**
		 * The array of {{#crossLink "F2.AppManifest.AppContent"}}{{/crossLink}}
		 * objects
		 * @property apps
		 * @type Array
		 * @required
		 */
		apps:[],
		/**
		 * Any inline javascript tha should initially be run
		 * @property inlineScripts
		 * @type Array
		 * @optional
		 */
		inlineScripts:[],
		/**
		 * Urls to javascript files required by the App
		 * @property scripts
		 * @type Array
		 * @optional
		 */
		scripts:[],
		/**
		 * Urls to CSS files required by the App
		 * @property styles
		 * @type Array
		 * @optional
		 */
		styles:[]
	},
	/**
	 * The AppContent object
	 * @class F2.AppManifest.AppContent
	 **/
	AppContent:{
		/**
		 * Arbitrary data to be passed along with the App
		 * @property data
		 * @type object
		 * @optional
		 */
		data:{},
		/**
		 * The string of HTML representing the App
		 * @property html
		 * @type string
		 * @required
		 */
		html:"",
		/**
		 * A status message
		 * @property status
		 * @type string
		 * @optional
		 */
		status:""
	},
	/**
	 * An object containing configuration information for the Container
	 * @class F2.ContainerConfig
	 */
	ContainerConfig:{		
		/**
		 * Allows the Container to override how an App's html is 
		 * inserted into the page. The function should accept an
		 * {{#crossLink "F2.AppConfig"}}{{/crossLink}} object and also a string of html
		 * @method afterAppRender
		 * @param {F2.AppConfig} appConfig The F2.AppConfig object
		 * @param {string} html The string of html representing the App 
		 * @return {Element} The DOM Element surrounding the App
		 */
		afterAppRender:function(appConfig, html) {},
		/**
		 * Allows the Container to wrap an App in extra html. The
		 * function should accept an {{#crossLink "F2.AppConfig"}}{{/crossLink}} object
		 * and also a string of html. The extra html can provide links to edit app
		 * settings and remove an app from the Container. See
		 * {{#crossLink "F2.Constants.Css"}}{{/crossLink}} for CSS classes that
		 * should be applied to elements.
		 * @method appRender
		 * @param {F2.AppConfig} appConfig The F2.AppConfig object
		 * @param {string} html The string of html representing the App
		 */
		appRender:function(appConfig, html) {},
		/**
		 * Allows the Container to render html for an App before the AppManifest for
		 * an App has loaded. This can be useful if the design calls for loading
		 * icons to appear for each App before each App is loaded and rendered to
		 * the page.
		 * @method beforeAppRender
		 * @param {F2.AppConfig} appConfig The F2.AppConfig object
		 * @return {Element} The DOM Element surrounding the App
		 */
		beforeAppRender:function(appConfig) {},
		/**
		 * Tells the Container that it is currently running within
		 * a secure app page
		 * @property isSecureAppPage
		 * @type bool
		 */
		isSecureAppPage:false,
		/**
		 * An object containing configuration defaults for F2.UI
		 * @class F2.ContainerConfig.UI
		 */
		UI:{
			/**
			 * An object containing configuration defaults for the 
			 * {{#crossLink "F2.UI\showMask"}}{{/crossLink}} and
			 * {{#crossLink "F2.UI\hideMask"}}{{/crossLink}} methods.
			 * @class F2.ContainerConfig.UI.Mask
			 */
			Mask:{
				/**
				 * The backround color of the overlay
				 * @property backgroundColor
				 * @type string
				 * @default #FFFFFF
				 */
				backgroundColor:'#FFFFFF',
				/**
				 * The path to the loading icon
				 * @property loadingIcon
				 * @type string
				 */
				loadingIcon:'',
				/**
				 * The opacity of the background overlay
				 * @property opacity
				 * @type int
				 * @default .6
				 */
				opacity:.6,
				/**
				 * Do not use inline styles for mask functinality. Instead classes will be
				 * applied to the elements and it is up to the Container provider to
				 * implement the class definitions.
				 * @property useClasses
				 * @type bool
				 * @default false
				 */
				useClasses:false,
				/**
				 * The z-index to use for the overlay
				 * @property zIndex
				 * @type int
				 * @default 2
				 */
				zIndex:2
			}
		},
		/**
		 * Allows the Container to specify which page is used when
		 * loading a secure app. The page must reside on a different domain than the
		 * Container
		 * @property secureAppPagePath
		 * @type string
		 */
		secureAppPagePath:"",
		/**
		 * Specifies what views a Container will provide buttons
		 * or liks to. Generally, the views will be switched via buttons or links in
		 * the App's header.
		 * @property supportedViews
		 * @type Array
		 * @required
		 */
		supportedViews:[]
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
	Css:(function() {

		/** @private */
		var _PREFIX = 'f2-';

		return {
			/**
			 * The APP class should be applied to the DOM Element that surrounds the
			 * entire App, including any extra html that surrounds the APP\_CONTAINER
			 * that is inserted by the Container. See appWrapper property in the
			 * {{#crossLink "F2.ContainerConfig"}}{{/crossLink}} object.
			 * @property APP
			 * @type string
			 * @static
			 * @final
			 */
			APP:_PREFIX + 'app',
			/**
			 * The APP\_CONTAINER class should be applied to the outermost DOM Element
			 * of the App.
			 * @property APP_CONTAINER
			 * @type string
			 * @static
			 * @final
			 */
			APP_CONTAINER:_PREFIX + 'app-container',
			/**
			 * The APP\_TITLE class should be applied to the DOM Element that contains
			 * the title for an App.  If this class is not present, then
			 * {{#crossLink "F2.AppConfig/setTitle"}}{{/crossLink}} will not function.
			 * @property APP_TITLE
			 * @type string
			 * @static
			 * @final
			 */
			APP_TITLE:_PREFIX + 'app-title',
			/**
			 * The APP\_VIEW class should be applied to the DOM Element that contains
			 * a view for an App. The DOM Element should also have a
			 * {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.DATA_ATTRIBUTE
			 * attribute that specifies which
			 * {{#crossLink "F2.Constants.Views"}}{{/crossLink}} it is. 
			 * @property APP_VIEW
			 * @type string
			 * @static
			 * @final
			 */
			APP_VIEW:_PREFIX + 'app-view',
			/**
			 * APP\_VIEW\_TRIGGER class should be applied to the DOM Elements that
			 * trigger an
			 * {{#crossLink "F2.Constants.Events"}}{{/crossLink}}.APP_VIEW_CHANGE
			 * event. The DOM Element should also have a
			 * {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.DATA_ATTRIBUTE
			 * attribute that specifies which
			 * {{#crossLink "F2.Constants.Views"}}{{/crossLink}} it will trigger.
			 * @property APP_VIEW_TRIGGER
			 * @type string
			 * @static
			 * @final
			 */
			APP_VIEW_TRIGGER:_PREFIX + 'app-view-trigger',
			/**
			 * The MASK class is applied to the overlay element that is created
			 * when the {{#crossLink "F2.UI\showMask"}}{{/crossLink}} method is fired.
			 * @property MASK
			 * @type string
			 * @static
			 * @final
			 */
			MASK:_PREFIX + 'mask',
			/**
			 * The MASK_CONTAINER class is applied to the Element that is passed into
			 * the {{#crossLink "F2.UI\showMask"}}{{/crossLink}} method.
			 * @property MASK_CONTAINER
			 * @type string
			 * @static
			 * @final
			 */
			MASK_CONTAINER:_PREFIX + 'mask-container'
		};
	})(),
	
	/**
	 * Events constants
	 * @class F2.Constants.Events
	 */
	Events:(function() {
		/** @private */
		var _APP_EVENT_PREFIX = 'App.';
		/** @private */
		var _CONTAINER_EVENT_PREFIX = 'Container.';

		return {
			/**
			 * The APP\_WIDTH\_CHANGE event will be fired by the Container when the
			 * width of an App is changed. The App's instanceId should be concatenated
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
			APP_WIDTH_CHANGE:_APP_EVENT_PREFIX + 'widthChange.',
			/**
			 * The APP\_SYMBOL\_CHANGE event is fired when the symbol is changed in an
			 * App. It is up to the App developer to fire this event.
			 * Returns an object with the symbol and company name:
			 *
			 *     { symbol: 'MSFT', name: 'Microsoft Corp (NASDAQ)' }
			 *
			 * @property APP_SYMBOL_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			APP_SYMBOL_CHANGE:_APP_EVENT_PREFIX + 'symbolChange',
			/**
			 * The APP\_VIEW\_CHANGE event will be fired by the Container when a user
			 * clicks to switch the view for an App. The App's instanceId should be
			 * concatenated to this constant.
			 * @property APP_VIEW_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			APP_VIEW_CHANGE:_APP_EVENT_PREFIX + 'viewChange.',
			/**
			 * The CONTAINER\_SYMBOL\_CHANGE event is fired when the symbol is changed
			 * at the Container level. This event should only be fired by the
			 * Container or Container Provider.
			 * Returns an object with the symbol and company name:
			 *
			 *     { symbol: 'MSFT', name: 'Microsoft Corp (NASDAQ)' }
			 *
			 * @property CONTAINER_SYMBOL_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			CONTAINER_SYMBOL_CHANGE:_CONTAINER_EVENT_PREFIX + 'symbolChange',
			/**
			 * The CONTAINER\_WIDTH\_CHANGE event will be fired by the Container when
			 * the width of the Container has changed.
			 * @property CONTAINER_WIDTH_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			CONTAINER_WIDTH_CHANGE:_CONTAINER_EVENT_PREFIX + 'widthChange'
		};
	})(),

	JSONP_CALLBACK:'F2_jsonpCallback_',

	/**
	 * Constants for use with cross-domain sockets
	 * @class F2.Constants.Sockets
	 * @protected
	 */
	Sockets:{
		/**
		 * The EVENT message is sent whenever
		 * {{#crossLink "F2.Events\emit"}}{{/crossLink}} is fired
		 * @property EVENT
		 * @type string
		 * @static
		 * @final
		 */
		EVENT:'__event__',
		/**
		 * The LOAD message is sent when an iframe socket initially loads.
		 * Returns a JSON string that represents:
		 *
		 *     [ App, AppManifest]
		 * 
		 * @property LOAD
		 * @type string
		 * @static
		 * @final
		 */
		LOAD:'__socketLoad__',
		/**
		 * The RPC message is sent when a method is passed up from within a secure
		 * app page.
		 * @property RPC
		 * @type string
		 * @static
		 * @final
		 */
		RPC:'__rpc__',
		/**
		 * The RPC\_CALLBACK message is sent when a call back from an RPC method is
		 * fired.
		 * @property RPC_CALLBACK
		 * @type string
		 * @static
		 * @final
		 */
		RPC_CALLBACK:'__rpcCallback__',
		/**
		 * The UI\_RPC message is sent when a UI method called.
		 * @property UI_RPC
		 * @type string
		 * @static
		 * @final
		 */
		UI_RPC:'__uiRpc__'
	},

	/**
	 * The available view types to Apps. The view should be specified by applying
	 * the {{#crossLink "F2.Constants.Css"}}{{/crossLink}}.APP_VIEW class to the
	 * containing DOM Element. A DATA_ATTRIBUTE attribute should be added to the
	 * Element as well which defines what view type is represented.
	 * The `hide` class can be applied to views that should be hidden by default.
	 * @class F2.Constants.Views
	 */
	Views:{
		/**
		 * 
		 * @property DATA_ATTRIBUTE
		 * @type string
		 * @static
		 * @final
		 */
		DATA_ATTRIBUTE:'data-f2-view',
		/**
		 * The ABOUT view gives details about the App.
		 * @property ABOUT
		 * @type string
		 * @static
		 * @final
		 */
		ABOUT:'about',
		/**
		 * The HELP view provides users with help information for using an App.
		 * @property HELP
		 * @type string
		 * @static
		 * @final
		 */
		HELP:'help',
		/**
		 * The HOME view is the main view for an App. This view should always
		 * be provided by an App.
		 * @property HOME
		 * @type string
		 * @static
		 * @final
		 */
		HOME:'home',
		/**
		 * The REMOVE view is a special view that handles the removal of an App
		 * from the Container.
		 * @property REMOVE
		 * @type string
		 * @static
		 * @final
		 */
		REMOVE:'remove',
		/**
		 * The SETTINGS view provides users the ability to modify advanced settings
		 * for an App.
		 * @property SETTINGS
		 * @type string
		 * @static
		 * @final
		 */
		SETTINGS:'settings'
	}
});
/**
 * Description of Events goes here
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
		 * Same as F2.Events.emit except that it will not send the event
		 * to all sockets.
		 * @method _socketEmit
		 * @private
		 * @param {string} event The event name
		 * @param {object} [arg]* The arguments to be passed
		 */
		_socketEmit:function() {
			return EventEmitter2.prototype.emit.apply(_events, [].slice.call(arguments));
		},
		/**
		 * Execute each of the listeners tha may be listening for the specified
		 * event name in order with the list of arguments
		 * @method emit
		 * @param {string} event The event name
		 * @param {object} [arg]* The arguments to be passed
		 */
		emit:function() {
			F2.Rpc.broadcast(F2.Constants.Sockets.EVENT, [].slice.call(arguments));
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
		many:function(event, timesToListen, listener) {
			return _events.many(event, timesToListen, listener);
		},
		/**
		 * Remove a listener for the specified event.
		 * @method off
		 * @param {string} event The event name
		 * @param {function} listener The function that will be removed
		 */
		off:function(event, listener) {
			return _events.off(event, listener);
		},
		/**
		 * Adds a listener for the specified event
		 * @method on
		 * @param {string} event The event name
		 * @param {function} listener The function to be fired when the event is
		 * emitted
		 */
		on:function(event, listener){
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
		once:function(event, listener) {
			return _events.once(event, listener);
		}
	};
})());
/**
 * Handles socket communication between the Container and secure Apps
 * @class F2.Rpc
 */
F2.extend('Rpc', (function(){
	var _callbacks = {};
	var _secureAppPagePath = '';
	var _apps = {};
	var _rEvents = new RegExp('^' + F2.Constants.Sockets.EVENT);
	var _rRpc = new RegExp('^' + F2.Constants.Sockets.RPC);
	var _rRpcCallback = new RegExp('^' + F2.Constants.Sockets.RPC_CALLBACK);
	var _rSocketLoad = new RegExp('^' + F2.Constants.Sockets.LOAD);
	var _rUiCall = new RegExp('^' + F2.Constants.Sockets.UI_RPC);

	/**
	 * Creates a socket connection from the App to the Container using 
	 * <a href="http://easyxdm.net" target="_blank">easyXDM</a>.
	 * @method _createAppToContainerSocket
	 * @private
	 */
	var _createAppToContainerSocket = function() {

		var appConfig; // socket closure
		var isLoaded = false;
		// its possible for messages to be received before the socket load event has
		// happened.  We'll save off these messages and replay them once the socket
		// is ready
		var messagePlayback = [];

		var socket = new easyXDM.Socket({
			onMessage: function(message, origin){

				// handle Socket Load
				if (!isLoaded && _rSocketLoad.test(message)) {
					message = message.replace(_rSocketLoad, '');
					var appParts = F2.parse(message);

					// make sure we have the AppConfig and AppManifest
					if (appParts.length == 2) {
						appConfig = appParts[0];

						// save socket
						_apps[appConfig.instanceId] = {
							config:appConfig,
							socket:socket
						};	

						// register app
						F2.registerApps([appConfig], [appParts[1]]);

						// socket message playback
						$.each(messagePlayback, function(i, e) {
							_onMessage(appConfig, message, origin);
						});
						
						isLoaded = true;
					}
				} else if (isLoaded) {
					// pass everyting else to _onMessage
					_onMessage(appConfig, message, origin);
				} else {
					//F2.log('socket not ready, queuing message', message);
					messagePlayback.push(message);
				}
			}
		});
	};

	/**
	 * Creates a socket connection from the Container to the App using 
	 * <a href="http://easyxdm.net" target="_blank">easyXDM</a>.
	 * @method _createContainerToAppSocket
	 * @private
	 * @param {appConfig} appConfig The F2.AppConfig object
	 * @param {F2.AppManifest} appManifest The F2.AppManifest object
	 */
	var _createContainerToAppSocket = function(appConfig, appManifest) {

		var container = $(appConfig.root);
		container = container.is('.' + F2.Constants.Css.APP_CONTAINER)
			? container
			: container.find('.' + F2.Constants.Css.APP_CONTAINER);

		if (!container.length) {
			F2.log('Unable to locate app in order to establish secure connection.');
			return;
		}

		var iframeProps = {
			scrolling:'no',
			style:{
				width:'100%'
			}
		};

		if (appConfig.height) {
			iframeProps.style.height = appConfig.height + 'px';
		}

		var socket = new easyXDM.Socket({
			remote: _secureAppPagePath,
			container: container.get(0),
			props:iframeProps,
			onMessage: function(message, origin) {
				// pass everything to _onMessage
				_onMessage(appConfig, message, origin);
			},
			onReady: function() {
				socket.postMessage(F2.Constants.Sockets.LOAD + F2.stringify([appConfig, appManifest], F2.appConfigReplacer));
			}
		});

		return socket;
	};

	/**
	 * @method _createRpcCallback
	 * @private
	 * @param {string} instanceId The App's Instance ID
	 * @param {function} callbackId The callback ID
	 * @return {function} A function to make the RPC call
	 */
	var _createRpcCallback = function(instanceId, callbackId) {
		return function() {
			F2.Rpc.call(
				instanceId,
				F2.Constants.Sockets.RPC_CALLBACK,
				callbackId,
				[].slice.call(arguments).slice(2)
			);
		};
	};

	/**
	 * Handles messages that come across the sockets
	 * @method _onMessage
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @param {string} message The socket message
	 * @param {string} origin The originator
	 */
	var _onMessage = function(appConfig, message, origin) {

		var obj;

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
		};

		function parseMessage(regEx, message, instanceId) {
			var o = F2.parse(message.replace(regEx, ''));

			// if obj.callbacks
			//   for each callback
			//     for each params
			//       if callback matches param
			//        replace param with _createRpcCallback(app.instanceId, callback)
			if (o.params && o.params.length && o.callbacks && o.callbacks.length) {
				$.each(o.callbacks, function(i, c) {
					$.each(o.params, function(i, p) {
						if (c == p) {
							o.params[i] = _createRpcCallback(instanceId, c);
						}
					});
				});
			}

			return o;
		};

		// handle UI Call
		if (_rUiCall.test(message)) {
			obj = parseMessage(_rUiCall, message, appConfig.instanceId);
			var func = parseFunction(appConfig.ui, obj.functionName);
			// if we found the function, call it
			if (func !== undefined) {
				func.apply(appConfig.ui, obj.params);
			} else {
				F2.log('Unable to locate UI RPC function: ' + obj.functionName);
			}

		// handle RPC
		} else if (_rRpc.test(message)) {
			obj = parseMessage(_rRpc, message, appConfig.instanceId);
			var func = parseFunction(window, obj.functionName);
			if (func !== undefined) {
				func.apply(func, obj.params);
			} else {
				F2.log('Unable to locate RPC function: ' + obj.functionName);
			}

		// handle RPC Callback
		} else if (_rRpcCallback.test(message)) {
			obj = parseMessage(_rRpcCallback, message, appConfig.instanceId);
			if (_callbacks[obj.functionName] !== undefined) {
				_callbacks[obj.functionName].apply(_callbacks[obj.functionName], obj.params);
				delete _callbacks[obj.functionName];
			}

		// handle Events
		} else if (_rEvents.test(message)) {
			obj = parseMessage(_rEvents, message, appConfig.instanceId);
			F2.Events._socketEmit.apply(F2.Events, obj);
		}
	};

	/**
	 * Registers a callback function
	 * @method _registerCallback
	 * @private
	 * @param {function} callback The callback function
	 * @return {string} The callback ID
	 */
	var _registerCallback = function(callback) {
		var callbackId = F2.guid();
		_callbacks[callbackId] = callback;
		return callbackId;
	};

	return {
		/**
		 * Broadcast an RPC function to all sockets
		 * @method broadcast
		 * @param {string} messageType The message type
		 * @param {Array} params The parameters to broadcast
		 */
		broadcast:function(messageType, params) {
			// check valid messageType
			var message = messageType + F2.stringify(params);
			$.each(_apps, function(i, a) {
				a.socket.postMessage(message);
			});
		},
		/**
		 * Calls a remote function
		 * @method call
		 * @param {string} instanceId The App's Instance ID
		 * @param {string} messageType The message type
		 * @param {string} functionName The name of the remote function
		 * @param {Array} params An array of parameters to pass to the remote
		 * function. Any functions found within the params will be treated as a
		 * callback function.
		 */
		call:function(instanceId, messageType, functionName, params) {
			// loop through params and find functions and convert them to callbacks
			var callbacks = [];
			$.each(params, function(i, e) {
				if (typeof e === "function") {
					var cid = _registerCallback(e);
					params[i] = cid;
					callbacks.push(cid);
				}
			});
			// check valid messageType
			_apps[instanceId].socket.postMessage(
				messageType + F2.stringify({
					functionName:functionName,
					params:params,
					callbacks:callbacks
				})
			);
		},

		/**
		 * Init function which tells F2.Rpc whether it is running at the Container-
		 * level or the App-level. This method is generally called by
		 * F2.{{#crossLink "F2/init"}}{{/crossLink}}
		 * @method init
		 * @param {string} [secureAppPagePath] The
		 * {{#crossLink "F2.ContainerConfig"}}{{/crossLink}}.secureAppPagePath
		 * property
		 */
		init:function(secureAppPagePath) {
			_secureAppPagePath = secureAppPagePath;
			if (!_secureAppPagePath) {
				_createAppToContainerSocket();
			}
		},

		/**
		 * Determines whether the Instance ID is considered to be 'remote'. This is
		 * determined by checking if 1) the App has an open socket and 2) whether
		 * F2.Rpc is running inside of an iframe
		 * @method isRemote
		 * @param {string} instanceId The Instance ID
		 * @return {bool} True if there is an open socket
		 */
		isRemote:function(instanceId) {
			return (
				// we have an App
				_apps[instanceId] !== undefined &&
				// the App is secure
				_apps[instanceId].config.isSecure &&
				// we can't access the iframe
				$(_apps[instanceId].config.root).find('iframe').length == 0
			);
		},

		/**
		 * Creates a Container-to-App or App-to-Container socket for communication
		 * @method register
		 * @param {F2.AppConfig} [appConfig] The F2.AppConfig object
		 * @param {F2.AppManifest} [appManifest] The F2.AppManifest object
		 */
		register:function(appConfig, appManifest) {
			if (!!appConfig && !!appManifest) {
				_apps[appConfig.instanceId] = {
					config:appConfig,
					socket:_createContainerToAppSocket(appConfig, appManifest)
				};
			} else {
				F2.log("Unable to register socket connection. Please check container configuration.");
			}
		}
	};
})());
F2.extend('UI', (function(){

	var _containerConfig;

	/**
	 * UI helper methods
	 * @class F2.UI
	 * @constructor
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 */
	var UI_Class = function(appConfig) {

		var _appConfig = appConfig;
		var $root = $(appConfig.root);

		var _updateHeight = function(height) {
			height = height || $(_appConfig.root).outerHeight();

			if (F2.Rpc.isRemote(_appConfig.instanceId)) {
				F2.Rpc.call(
					_appConfig.instanceId,
					F2.Constants.Sockets.UI_RPC,
					'updateHeight',
					[
						height
					]
				);
			} else {
				_appConfig.height = height;
				$root.find('iframe').height(_appConfig.height);
			}
		};

		return {
			/**
			 * Removes a overlay from an Element on the page
			 * @method hideMask
			 * @param {string|Element} selector The Element or selector to an Element
			 * that currently contains the loader
			 */
			hideMask:function(selector) {
				F2.UI.hideMask(_appConfig.instanceId, selector);
			},
			/**
			 * Helper methods for creating and using Modals
			 * @class F2.UI.Modals
			 * @for F2.UI
			 */
			Modals:(function(){

				var _renderAlert = function(message) {
					return [
						'<div class="modal">',
							'<header class="modal-header">',
								'<h3>Alert!</h3>',
							'</header>',
							'<div class="modal-body">',
								'<p>',
									message,
								'</p>',
							'</div>',
							'<div class="modal-footer">',
								'<button class="btn btn-primary btn-ok">OK</button>',
							'</div>',
						'</div>'
					].join('');
				};

				var _renderConfirm = function(message) {
					return [
						'<div class="modal">',
							'<header class="modal-header">',
								'<h3>Confirm</h3>',
							'</header>',
							'<div class="modal-body">',
								'<p>',
									message,
								'</p>',
							'</div>',
							'<div class="modal-footer">',
								'<button type="button" class="btn btn-primary btn-ok">OK</button>',
								'<button type="button" class="btn btn-cancel">Cancel</button">',
							'</div>',
						'</div>'
					].join('');
				};

				return {
					/**
					 * Display an alert message on the page
					 * @method alert
					 * @param {string} message The message to be displayed
					 * @param {function} [callback] The callback to be fired when the user
					 * closes the dialog
					 * @for F2.UI.Modals
					 */
					alert: function(message, callback) {

						if (!F2.isInit()) {
							F2.log('F2.init() must be called before F2.UI.Modals.alert()');
							return;
						}

						if (F2.Rpc.isRemote(_appConfig.instanceId)) {
							F2.Rpc.call(
								_appConfig.instanceId,
								F2.Constants.Sockets.UI_RPC,
								'Modals.alert',
								[].slice.call(arguments)
							);
						} else {
							// display the alert
							$(_renderAlert(message))
								.on('show', function() {
									var modal = this;
									$(modal).find('.btn-primary').on('click', function() {
										$(modal).modal('hide').remove();
										(callback || $.noop)();
									});
								})
								.modal({backdrop:true});
						}
					},
					/**
					 * Display a confirm message on the page
					 * @method confirm
					 * @param {string} message The message to be displayed
					 * @param {function} okCallback The function that will be called when the OK
					 * button is pressed
					 * @param {function} cancelCallback The function that will be called when
					 * the Cancel button is pressed
					 * @for F2.UI.Modals
					 */
					confirm:function(message, okCallback, cancelCallback) {

						if (!F2.isInit()) {
							F2.log('F2.init() must be called before F2.UI.Modals.confirm()');
							return;
						}

						if (F2.Rpc.isRemote(_appConfig.instanceId)) {
							F2.Rpc.call(
								_appConfig.instanceId,
								F2.Constants.Sockets.UI_RPC,
								'Modals.confirm',
								[].slice.call(arguments)
							);
						} else {
							// display the alert
							$(_renderConfirm(message))
								.on('show', function() {
									var modal = this;

									$(modal).find('.btn-ok').on('click', function() {
										$(modal).modal('hide').remove();
										(okCallback || $.noop)();
									});

									$(modal).find('.btn-cancel').on('click', function() {
										$(modal).modal('hide').remove();
										(cancelCallback || $.noop)();
									});
								})
								.modal({backdrop:true});
						}
					}
				};
			})(),
			/**
			 * Sets the title of the App as shown in the browser. Depending on the
			 * Container HTML, this method may do nothing if the Container has not been
			 * configured properly or else the Container Provider does not allow Title's
			 * to be set.
			 * @method setTitle
			 * @params {string} title The title of the App
			 * @for F2.UI
			 */
			setTitle:function(title) {

				if (F2.Rpc.isRemote(_appConfig.instanceId)) {
					F2.Rpc.call(
						_appConfig.instanceId,
						F2.Constants.Sockets.UI_RPC,
						'setTitle',
						[
							title
						]
					);
				} else {
					$(_appConfig.root).find('.' + F2.Constants.Css.APP_TITLE).text(title);
				}
			},
			/**
			 * Display an ovarlay over an Element on the page
			 * @method showMask
			 * @param {string|Element} selector The Element or selector to an Element
			 * over which to display the loader
			 * @param {bool} showLoading Display a loading icon
			 */
			showMask:function(selector, showLoader) {
				F2.UI.showMask(_appConfig.instanceId, selector, showLoader);
			},
			/**
			 * For secure apps, this method updates the size of the iframe that
			 * contains the App. **Note: It is recommended that App developers call
			 * this method anytime Elements are added or removed from the DOM**
			 * @method updateHeight
			 * @params {int} height The height of the App
			 */
			updateHeight:_updateHeight,
			/**
			 * Helper methods for creating and using Views
			 * @class F2.UI.Views
			 * @for F2.UI
			 */
			Views:(function(){

				var _events = new EventEmitter2();
				var _rValidEvents = /change/i;

				// unlimited listeners, set to > 0 for debugging
				_events.setMaxListeners(0);

				var _isValid = function(eventName) {
					if (_rValidEvents.test(eventName)) {
						return true;
					} else {
						F2.log('"' + eventName + '" is not a valid F2.UI.Views event name');
						return false;
					}
				};

				return {
					/**
					 * Change the current view for the App or add an event listener
					 * @method change
					 * @param {string|function} [input] If a string is passed in, the view
					 * will be changed for the App. If a function is passed in, a change
					 * event listener will be added.
					 * @for F2.UI.Views
					 */
					change:function(input) {

						if (typeof input === 'function') {
							this.on('change', input);
						} else if (typeof input === 'string') {

							if (_appConfig.isSecure && !F2.Rpc.isRemote(_appConfig.instanceId)) {
								F2.Rpc.call(
									_appConfig.instanceId,
									F2.Constants.Sockets.UI_RPC,
									'Views.change',
									[].slice.call(arguments)
								);
							} else if (F2.inArray(input, _appConfig.views)) {
								$('.' + F2.Constants.Css.APP_VIEW, $root)
									.addClass('hide')
									.filter('[data-f2-view="' + input + '"]', $root)
									.removeClass('hide');
								
								_updateHeight();
								_events.emit('change', input);
							}							
						}
					},
					/**
					 * Removes a view event listener
					 * @method off
					 * @param {string} event The event name
		 			 * @param {function} listener The function that will be removed
		 			 * @for F2.UI.Views
					 */
					off:function(event, listener) {
						if (_isValid(event)) {
							_events.off(event, listener);
						}
					},
					/**
					 * Adds a view event listener
					 * @method on
					 * @param {string} event The event name
					 * @param {function} listener The function to be fired when the event is
					 * emitted
					 * @for F2.UI.Views
					 */
					on:function(event, listener) {
						if (_isValid(event)) {
							_events.on(event, listener);
						}
					}
				}
			})()
		};
	};

	/**
	 * Removes a overlay from an Element on the page
	 * @method hideMask
	 * @static
	 * @param {string} instanceId The Instance ID of the App
	 * @param {string|Element} selector The Element or selector to an Element
	 * that currently contains the loader
	 * @for F2.UI
	 */
	UI_Class.hideMask = function(instanceId, selector) {

		if (!F2.isInit()) {
			F2.log('F2.init() must be called before F2.UI.hideMask()');
			return;
		}

		if (F2.Rpc.isRemote(instanceId) && !$(selector).is('.' + F2.Constants.Css.APP)) {
			F2.Rpc.call(
				instanceId,
				F2.Constants.Sockets.RPC,
				'F2.UI.hideMask',
				[
					instanceId,
					// must only pass the selector argument. if we pass an Element there
					// will be F2.stringify() errors
					$(selector).selector
				]
			);
		} else {
			
			var container = $(selector);
			var mask = container.find('> .' + F2.Constants.Css.MASK).remove();
			container.removeClass(F2.Constants.Css.MASK_CONTAINER);

			// if useClasses is false, we need to remove all inline styles
			if (!_containerConfig.UI.Mask.useClasses) {
				container.attr('style', '');
			}

			// if the element contains this data property, we need to reset static
			// position
			if (container.data(F2.Constants.Css.MASK_CONTAINER)) {
				container.css({'position':'static'});
			}
		}
	};

	/**
	 *
	 * @method init
	 * @static
	 * @param {F2.ContainerConfig} containerConfig The F2.ContainerConfig object
	 */
	UI_Class.init = function(containerConfig) {
		_containerConfig = containerConfig;

		// set defaults
		_containerConfig.UI = $.extend(true, {}, F2.ContainerConfig.UI, _containerConfig.UI || {});
	};

	/**
	 * Display an ovarlay over an Element on the page
	 * @method showMask
	 * @static
	 * @param {string} instanceId The Instance ID of the App
	 * @param {string|Element} selector The Element or selector to an Element
	 * over which to display the loader
	 * @param {bool} showLoading Display a loading icon
	 */
	UI_Class.showMask = function(instanceId, selector, showLoading) {

		if (!F2.isInit()) {
			F2.log('F2.init() must be called before F2.UI.showMask()');
			return;
		}

		if (F2.Rpc.isRemote(instanceId) && $(selector).is('.' + F2.Constants.Css.APP)) {
			F2.Rpc.call(
				instanceId,
				F2.Constants.Sockets.RPC,
				'F2.UI.showMask',
				[
					instanceId,
					// must only pass the selector argument. if we pass an Element there
					// will be F2.stringify() errors
					$(selector).selector,
					showLoading
				]
			);
		} else {

			if (showLoading && !_containerConfig.UI.Mask.loadingIcon) {
				F2.log('Unable to display loading icon. Please use F2.UI.setMaskConfiguration to set the path to the loading icon');
			}

			var container = $(selector).addClass(F2.Constants.Css.MASK_CONTAINER);
			var mask = $('<div data->')
				.height('100%' /*container.outerHeight()*/)
				.width('100%' /*container.outerWidth()*/)
				.addClass(F2.Constants.Css.MASK);

			// set inline styles if useClasses is false
			if (!_containerConfig.UI.Mask.useClasses) {
				mask.css({
					'background-color':_containerConfig.UI.Mask.backgroundColor,
					'background-image': !!_containerConfig.UI.Mask.loadingIcon ? ('url(' + _containerConfig.UI.Mask.loadingIcon + ')') : '',
					'background-position':'50% 50%',
					'background-repeat':'no-repeat',
					'display':'block',
					'left':0,
					'min-height':30,
					'padding':0,
					'position':'absolute',
					'top':0,
					'z-index':_containerConfig.UI.Mask.zIndex,

					'filter':'alpha(opacity=' + (_containerConfig.UI.Mask.opacity * 100) + ')',
					'opacity':_containerConfig.UI.Mask.opacity
				});
			}

			// only set the position if the container is currently static
			if (container.css('position') === 'static') {
				container.css({'position':'relative'});
				// setting this data property tells hideMask to set the position
				// back to static
				container.data(F2.Constants.Css.MASK_CONTAINER, true);
			}

			// add the mask to the container
			container.append(mask);
		}
	};

	return UI_Class;
})());
/**
 * Core Container functionality
 * @module f2
 * @class F2
 */
F2.extend('', (function(){

	var _apps = {};
	var _config = false;

	/**
	 * Appends the App's html to the DOM
	 * @method _afterAppRender
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @param {string} html The string of html
	 * @return {Element} The DOM Element that contains the App
	 */
	var _afterAppRender = function(appConfig, html) {

		var handler = _config.afterAppRender || function(appConfig, html) {
			return $(html).appendTo('body');
		};
		var appContainer = handler(appConfig, html);

		if (!!_config.afterAppRender && !appContainer) {
			F2.log('F2.ContainerConfig.afterAppRender() must return the DOM Element that contains the App');
			return;
		} else {
			// apply APP class and Instance ID
			$(appContainer).addClass(F2.Constants.Css.APP);
			return appContainer.get(0);
		}
	};

	/**
	 * Renders the html for an App.
	 * @method _appRender
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @param {string} html The string of html
	 */
	var _appRender = function(appConfig, html) {

		function outerHtml(html) {
			return $('<div></div>').append(html).html();
		}

		// apply APP_CONTAINER class
		html = outerHtml($(html).addClass(F2.Constants.Css.APP_CONTAINER + ' ' + appConfig.appId));

		// optionally apply wrapper html
		if (_config.appRender) {
			html = _config.appRender(appConfig, html);
		}

		// apply APP class and instanceId
		return outerHtml(html);
	};

	/**
	 * Rendering hook to allow Containers to render some html prior to an App
	 * loading
	 * @method _beforeAppRender
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @return {Element} The DOM Element surrounding the App
	 */
	var _beforeAppRender = function(appConfig) {
		var handler = _config.beforeAppRender || $.noop;
		return handler(appConfig);
	};

	/**
	 * Adds properties to the AppConfig object
	 * @method _hydrateAppConfig
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 */
	var _hydrateAppConfig = function(appConfig) {

		// create the instanceId for the App
		appConfig.instanceId = appConfig.instanceId || F2.guid();

		// default the views if not provided
		appConfig.views = appConfig.views || [];
		if (!F2.inArray(F2.Constants.Views.HOME, appConfig.views)) {
			appConfig.views.push(F2.Constants.Views.HOME);
		}
	};

	/**
	 * Attach App events
	 * @method _initAppEvents
	 * @private
	 */
	var _initAppEvents = function (appConfig) {

		$(appConfig.root).on('click', '.' + F2.Constants.Css.APP_VIEW_TRIGGER + '[' + F2.Constants.Views.DATA_ATTRIBUTE + ']', function(event) {

			event.preventDefault();

			var view = $(this).attr(F2.Constants.Views.DATA_ATTRIBUTE).toLowerCase();

			// handle the special REMOVE view
			if (view == F2.Constants.Views.REMOVE) {
				F2.removeApp(appConfig.instanceId);
			} else {
				appConfig.ui.Views.change(view);
			}
		});
	};

	/**
	 * Attach Container Events
	 * @method _initContainerEvents
	 * @private
	 */
	var _initContainerEvents = function() {

		var resizeTimeout;
		var resizeHandler = function() {
			F2.Events.emit(F2.Constants.Events.CONTAINER_WIDTH_CHANGE);
		};

		$(window).on('resize', function() {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resizeHandler, 100);
		});
	};

	/**
	 * Has the Container been init?
	 * @method _isInit
	 * @private
	 * @return {bool} True if the Container has been init
	 */
	var _isInit = function() {
		return !!_config;
	};

	/**
	 * Loads the App's html/css/javascript
	 * @method loadApp
	 * @private
	 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}}
	 * objects
	 * @param {F2.AppManifest} [appManifest] The AppManifest object
	 */
	var _loadApps = function(appConfigs, appManifest) {

		appConfigs = [].concat(appConfigs);

		// check for secure app
		if (appConfigs.length == 1 && appConfigs[0].isSecure && !_config.isSecureAppPage) {
			_loadSecureApp(appConfigs[0], appManifest);
			return;
		}

		// check that the number of apps in manifest matches the number requested
		if (appConfigs.length != appManifest.apps.length) {
			F2.log('The number of Apps defined in the AppManifest do not match the number requested.', appManifest);
			return;
		}

		var scripts = appManifest.scripts || [];
		var styles = appManifest.styles || [];
		var inlines = appManifest.inlineScripts || [];
		var scriptCount = scripts.length;
		var scriptsLoaded = 0;
		var appInit = function() {
			$.each(appConfigs, function(i, a) {
				// instantiate F2.UI
				a.ui = new F2.UI(a);

				// instantiate F2.App
				if (F2.Apps[a.appId] !== undefined) {
					if (typeof F2.Apps[a.appId] === 'function') {

						// 
						setTimeout(function() {
							_apps[a.instanceId].app = new F2.Apps[a.appId](a, appManifest.apps[i], a.root);
							if (_apps[a.instanceId].app['init'] !== undefined) {
								_apps[a.instanceId].app.init();
							}
						}, 0);
						
					} else {
						F2.log('App initialization class is defined but not a function. (' + a.appId + ')');
					}
				}
			});
		};

		// load styles
		var stylesFragment = [];
		$.each(styles, function(i, e) {
			stylesFragment.push('<link rel="stylesheet" type="text/css" href="' + e + '"/>');
		});
		$('head').append(stylesFragment.join(''));

		// load html
		$.each(appManifest.apps, function(i, a) {
			// load html and save the root node
			appConfigs[i].root = _afterAppRender(appConfigs[i], _appRender(appConfigs[i], a.html));
			// init events
			_initAppEvents(appConfigs[i]);
		});

		// load scripts and eval inlines once complete
		$.each(scripts, function(i, e) {
			$.ajax({
				url:e,
				async:false,
				dataType:'script',
				type:'GET',
				success:function() {
					if (++scriptsLoaded == scriptCount) {
						$.each(inlines, function(i, e) {
							try {
								eval(e);
							} catch (exception) {
								F2.log('Error loading inline script: ' + exception + '\n\n' + e);
							}
						});
						// fire the load event to tell the App it can proceed
						appInit();
					}
				},
				error:function(jqxhr, settings, exception) {
					F2.log(['Failed to load script (' + e +')', exception.toString()]);
				}
			});
		});

		// if no scripts were to be processed, fire the appLoad event
		if (!scriptCount) {
			appInit();
		}
	};

	/**
	 * Loads the App's html/css/javascript into an iframe
	 * @method loadSecureApp
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @param {F2.AppManifest} appManifest The App's html/css/js to be loaded into the
	 * page.
	 */
	var _loadSecureApp = function(appConfig, appManifest) {

		// make sure the Container is configured for secure apps
		if (_config.secureAppPagePath) {
			// create the html container for the iframe
			appConfig.root = _afterAppRender(appConfig, _appRender(appConfig, '<div></div>'));
			// instantiate F2.UI
			appConfig.ui = new F2.UI(appConfig);
			// init events
			_initAppEvents(appConfig);
			// create RPC socket
			F2.Rpc.register(appConfig, appManifest);
		} else {
			F2.log('Unable to load secure app: \"secureAppPagePath\" is not defined in ContainerConfig.');
		}
	};

	/**
	 * Checks if the App is valid
	 * @method _validateApp
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @returns {bool} True if the App is valid
	 */
	var _validateApp = function(appConfig) {

		// check for valid App configurations
		if (!appConfig.appId) {
			F2.log('"appId" missing from App object');
			return false;
		} else if (!appConfig.manifestUrl) {
			F2.log('manifestUrl" missing from App object');
			return false;
		}

		return true;
	};

	return {
		/**
		 * Gets the current list of Apps in the container
		 * @method getContainerState
		 * @returns {Array} An array of objects containing the appId and...
		 */
		getContainerState:function() {
			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.getContainerState()');
				return;
			}

			return $.map(_apps, function(e, i) {
				return { appId: e.config.appId };
			});
		},
		/**
		 * Initializes the Container. This method must be called before performing
		 * any other actions in the Container.
		 * @method init
		 * @param {F2.ContainerConfig} config The configuration object
		 */
		init:function(config) {
			_config = config;

			F2.Rpc.init(_config.secureAppPagePath);
			F2.UI.init(_config);

			if (!_config.isSecureAppPage) {
				_initContainerEvents();
			}
		},
		/**
		 * Has the Container been init?
		 * @method isInit
		 * @return {bool} True if the Container has been init
		 */
		isInit:_isInit,
		/**
		 * Begins the loading process for all Apps. The App will
		 * be passed the {{#crossLink "F2.AppConfig"}}{{/crossLink}} object which will
		 * contain the App's unique instanceId within the Container. Optionally, the
		 * {{#crossLink "F2.AppManifest"}}{{/crossLink}} can be passed in and those
		 * assets will be used instead of making a request.
		 * @method registerApps
		 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}}
		 * objects
		 * @param {Array} [appManifests] An array of
		 * {{#crossLink "F2.AppManifest"}}{{/crossLink}}
		 * objects. This array must be the same length as the apps array that is
		 * objects. This array must be the same length as the apps array that is
		 * passed in. This can be useful if Apps are loaded on the server-side and
		 * passed down to the client.
		 */
		registerApps:function(appConfigs, appManifests) {

			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.registerApps()');
				return;
			}

			var appStack = [];
			var batches = {};
			var callbackStack = {};
			var haveManifests = false;
			appConfigs = [].concat(appConfigs);
			appManifests = appManifests || [];
			haveManifests = !!appManifests.length;

			// ensure that the array of apps and manifests are qual
			if (appConfigs.length && haveManifests && appConfigs.length != appManifests.length) {
				F2.log('The length of "apps" does not equal the length of "appManifests"');
				return;
			}

			// validate each app and assign it an instanceId
			// then determine which apps can be batched together
			$.each(appConfigs, function(i, a) {

				if (!_validateApp(a)) {
					return; // move to the next app
				}

				// add properties and methods
				_hydrateAppConfig(a);

				// fire beforeAppRender
				a.root = _beforeAppRender(a);

				// save app
				_apps[a.instanceId] = { config:a };

				// if we have the manifest, go ahead and load the app
				if (haveManifests) {
					_loadApps(a, appManifests[i]);
				} else {
					// check if this app can be batched
					if (a.enableBatchRequests && !a.isSecure) {
						batches[a.manifestUrl.toLowerCase()] = batches[a.manifestUrl.toLowerCase()] || [];
						batches[a.manifestUrl.toLowerCase()].push(a);
					} else {
						appStack.push({
							apps:[a],
							url:a.manifestUrl
						});
					}
				}
			});

			// we don't have the manifests, go ahead and load them
			if (!haveManifests) {
				// add the batches to the appStack
				$.each(batches, function(i, b) {
					appStack.push({ url:i, apps:b })
				});

				// if an App is being loaded more than once on the page, there is the
				// potential that the jsonp callback will be clobbered if the request
				// for the AppManifest for the app comes back at the same time as
				// another request for the same app.  We'll create a callbackStack
				// that will ensure that requests for the same app are loaded in order
				// rather than at the same time
				$.each(appStack, function(i, req) {
					// define the callback function based on the first app's App ID
					var jsonpCallback = F2.Constants.JSONP_CALLBACK + req.apps[0].appId;

					// push the request onto the callback stack
					callbackStack[jsonpCallback] = callbackStack[jsonpCallback] || [];
					callbackStack[jsonpCallback].push(req);
				});

				// loop through each item in the callback stack and make the request
				// for the AppManifest. When the request is complete, pop the next 
				// request off the stack and make the request.
				$.each(callbackStack, function(i, requests) {

					var manifestRequest = function(jsonpCallback, req) {
						if (!req) { return; }

						$.ajax({
							url:req.url,
							data:{
								params:F2.stringify(req.apps, F2.appConfigReplacer)
							},
							jsonp:false, /* do not put 'callback=' in the query string */
							jsonpCallback:jsonpCallback, /* Unique function name */
							dataType:'jsonp',
							success:function(appManifest) {
								_loadApps(req.apps, appManifest);
							},
							error:function(jqxhr, settings, exception) {
								F2.log('Failed to load app(s)', exception.toString(), req.apps);
								//remove failed app(s)
								$.each(req.apps, function(idx,item){
									F2.log('Removed failed ' +item.name+ ' app', item);
									F2.removeApp(item.instanceId);
								});
							},
							complete:function() {
								manifestRequest(i, requests.pop());
							}
						});
					};
					manifestRequest(i, requests.pop());
				});
			}
		},
		/**
		 * Removes all Apps from the Container
		 * @method removeAllApps
		 */
		removeAllApps:function() {

			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.removeAllApps()');
				return;
			}

			$.each(_apps, function(i, a) {
				F2.removeApp(a.instanceId);
			});
		},
		/**
		 * Removes an App from the Container
		 * @method removeApp
		 * @param {string} instanceId The App's instanceId
		 */
		removeApp:function(instanceId) {

			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.removeApp()');
				return;
			}

			if (_apps[instanceId]) {
				$(_apps[instanceId].config.root).fadeOut(function() {
					delete _apps[instanceId];
					$(this).remove();
				});
			}
		}
	};
})());