(function() {

  var MAGNITUDES = ['', 'K', 'M', 'B', 'T'];

  function AppFormat() {
    this.magnitudes = {
      shortcap: MAGNITUDES
    };
  }

  AppFormat.prototype.getMagnitude = function(numDigits, value, type) {
    value = Math.abs(value);
    var c = 0;

    while (value >= 1000 && c < 4) {
      value /= 1000;
      c++;
    }

    return value.toFixed(numDigits) + this.magnitudes[type][c];
  };

  AppFormat.prototype.lastPrice = function(value) {
    return '$' + Number(value).toFixed(2);
  };

  AppFormat.prototype.addColor = function(value) {
    if (value && value.length && value.charAt(0) === '+') {
      return '<span class="pos">' + value + '</span>';
    } else if (value && value.length && value.charAt(0) === '-') {
      return '<span class="neg">' + value + '</span>';
    }

    return value;
  };

  AppFormat.prototype.comma = function(value) {
    value = String(value);

    if (value.length < 6 && value.indexOf('.') > -1) {
      return value;
    }

    var x = value.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;

    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }

    return x1 + x2;
  };

  window.appFormat = new AppFormat();

}());
