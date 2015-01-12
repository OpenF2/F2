(function(exports) {

  function CdsFormatter() {
    this.magnitudes = {
      shortcap: ['', 'K', 'M', 'B', 'T']
    };
  }

  CdsFormatter.prototype.getMagnitude = function(numDigits, value, type) {
    value = Math.abs(value);
    var c = 0;

    while (value >= 1000 && c < 4) {
      value /= 1000;
      c++;
    }

    value = value.toFixed(numDigits);

    return value + this.magnitudes[type][c];
  };

  CdsFormatter.prototype.lastPrice = function(value) {
    value = Number(value);
    value = value.toFixed(2);

    return '$' + value;
  };

  CdsFormatter.prototype.bps = function(value) {
    value = Number(value);
    value = value.toFixed(2);
    return value;
  };

  CdsFormatter.prototype.addColorPercent = function(value) {
    if (value && !isNaN(value) && isFinite(value)) {
      if (value > 0) {
        return '<span class="pos">' + value.toFixed(2) + '%</span>';
      } else {
        return '<span class="neg">' + value.toFixed(2) + '%</span>';
      }
    }

    return value.toFixed(2) + '%';
  };

  CdsFormatter.prototype.comma = function(value) {
    value = String(value);

    if (value.length < 6 && value.indexOf('.') > -1) {
      return value;
    } else {
      var x = value.split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;

      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }

      return x1 + x2;
    }
  };

  exports.cdsFormatter = new CdsFormatter();

}(window));
