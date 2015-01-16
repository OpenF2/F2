/* global F2, $ */

F2.Apps['com_openf2_examples_javascript_quote'] = function(appConfig, appContent, root) {

  var QUOTE_URL = 'http://dev.markitondemand.com/Api/Quote/jsonp';
  var LOOKUP_URL = 'http://dev.markitondemand.com/api/Lookup/jsonp';
  var REFRESH_INTERVAL_MS = 30000;

  appConfig.context = appConfig.context || {};

  var $root = $(root);
  var $caption = $('caption', $root);
  var $tbody = $('tbody', $root);
  var $settings = $('form[data-f2-view="settings"]', $root);
  var _config = {
    refreshMode: 'page',
    autoRefresh: false
  };
  var _autoRefreshInterval;

  function _getQuote(symbolData) {
    appConfig.ui.showMask($root, true);

    if (symbolData) {
      appConfig.context.symbol = symbolData.symbol;
    } else if (appConfig.context.symbol) {
      appConfig.context.symbol = appConfig.context.symbol;
    } else {
      appConfig.context.symbol = 'MSFT';
    }

    $.ajax({
      url: QUOTE_URL,
      data: {
        symbol: appConfig.context.symbol
      },
      dataType: 'jsonp',
      success: function(data) {
        if (data && data.Data && data.Data.Status === 'SUCCESS') {
          _renderQuote(data.Data);
        } else {
          F2.log('Un problemo!');
        }
      },
      complete: function() {
        appConfig.ui.hideMask($root);
      }
    });
  }

  function _initTypeahead() {
    $('input[name=lookup]', $root).autocomplete({
      autoFocus: true,
      minLength: 0,
      select: function(event, ui) {
        _getQuote({
          symbol: ui.item.value
        });
      },
      source: function(request, response) {
        $.ajax({
          url: LOOKUP_URL,
          dataType: 'jsonp',
          data: {
            input: request.term
          },
          success: function(data) {
            response($.map(data, function(item) {
              return {
                label: item.Symbol + ' - ' + item.Name + ' (' + item.Exchange + ')',
                value: item.Symbol
              };
            }));
          }
        });
      }
    });
  }

  function _populateSettings() {
    $('input[name=refreshMode][value=' + _config.refreshMode + ']', $settings).prop('checked', true);
    $('input[name=autoRefresh]', $settings).prop('checked', _config.autoRefresh);
  }

  function _renderQuote(data) {
    var changePct = Format.number(data.ChangePercent, {
      precision: 2,
      withColors: true,
      prefix: '(',
      suffix: '%)'
    });
    var high = Format.number(data.High);
    var last = Format.number(data.LastPrice, 2);
    var lastChange = Format.number(data.Change, {
      precision: 2,
      withColors: true
    });
    var low = Format.number(data.Low);
    var marketCap = Format.number(data.MarketCap, {
      withMagnitude: true,
      precision: 1
    });
    var open = Format.number(data.Open);
    var volume = Format.number(data.Volume, {
      withMagnitude: true,
      precision: 1
    });

    $caption.promise().done(function() {
      var html = _captionHtml(last, lastChange, changePct);
      $(this).empty().append(html);
    });

    $tbody.promise().done(function() {
      var html = _quoteTableBodyHtml(low, high, open, volume, marketCap);
      $(this).empty().append(html);
    });

    appConfig.ui.setTitle(data.Name);
  }

  function _captionHtml(last, lastChange, changePct) {
    return [
      '<h3 class="clearfix">',
        '<span class="last pull-left">', last, '</span>',
        '<span class="last-change pull-right">', lastChange, ' ', changePct, '</span>',
      '</h3>'
    ].join('');
  }

  function _quoteTableBodyHtml(low, high, open, volume, marketCap) {
    return [
      '<tr>',
        '<th>Range</th>',
        '<td><strong>', low, ' - ', high, '</strong></td>',
      '</tr>',
      '<tr>',
        '<th>Open</th>',
        '<td><strong>', open, '</strong></td>',
      '</tr>',
      '<tr>',
        '<th>Volume</th>',
        '<td><strong>', volume, '</strong></td>',
      '</tr>',
      '<tr>',
        '<th class="market-cap">Market Cap</th>',
        '<td><strong>', marketCap, '</strong></td>',
      '</tr>'
    ].join('');
  }

  function _saveSettings() {
    clearInterval(_autoRefreshInterval);

    _config.refreshMode = $('input[name=refreshMode]:checked', $settings).val();
    _config.autoRefresh = $('input[name=autoRefresh]', $settings).prop('checked');

    if (_config.autoRefresh) {
      F2.log('Beginning refresh');

      _autoRefreshInterval = setInterval(function() {
        F2.log('Refreshed');
        _getQuote();
      }, REFRESH_INTERVAL_MS);
    }

    appConfig.ui.Views.change(F2.Constants.Views.HOME);
  }

  /**
   * @class Format
   * @static
   */
  var Format = (function() {
    var _defaultOptions = {
      precision: 2,
      withColors: false,
      withMagnitude: false,
      prefix: '',
      suffix: ''
    };

    var _magnitudes = {
      'shortcap': ['', 'K', 'M', 'B', 'T']
    };

    function _signLabel(value) {
      if (value > 0) {
        return 'positive';
      } else if (value < 0) {
        return 'negative';
      }

      return 'unchanged';
    }

    return {
      /**
        Formats a number
        @method number
        @param {number} raw The number to format
        @param {object|number} options If int, formats to X precision. If
        object, formats according to options passed
        @returns {string} The formatted output
      */
      number: function(raw, options) {
        if (!raw) {
          return '--';
        }

        options = (typeof options === 'number') ? { precision: options } : options;
        options = $.extend({}, _defaultOptions, options);

        if (options.withMagnitude) {
          var c = 0;
          raw = Math.abs(raw);

          while (raw >= 1000 && c < 4) {
            raw /= 1000;
            c++;
          }

          options.magnitudeType = options.magnitudeType || 'shortcap';
          options.suffix = _magnitudes[options.magnitudeType][c];
        }

        var val = options.prefix + raw.toFixed(options.precision) + options.suffix;

        if (options.withColors) {
          val = '<span class="' + _signLabel(raw) + '">' + val + '</span>';
        }

        return val;
      }
    };
  })();

  return {
    init: function() {
      // Bind container symbol change
      F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, function(symbolData) {
        if (_config.refreshMode === 'page') {
          _getQuote(symbolData);
        }
      });

      // Bind app symbol change
      F2.Events.on(F2.Constants.Events.APP_SYMBOL_CHANGE, function(symbolData) {
        if (_config.refreshMode === 'app') {
          _getQuote(symbolData);
        }
      });

      // Bind view change
      appConfig.ui.Views.change(function(view) {
        if (view === F2.Constants.Views.SETTINGS) {
          _populateSettings();
        }
      });

      // Bind save settings
      $root.on('click', 'button.save', _saveSettings);

      _initTypeahead();
      _getQuote();
    }
  };
};
