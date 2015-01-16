/* global F2, $, appFormat */

F2.Apps['com_openf2_examples_javascript_watchlist'] = (function() {

  var YQL_API_URL = 'http://query.yahooapis.com/v1/public/yql';

  function supplant(text, params) {
    return text.replace(/{([^{}]*)}/g, function(a, b) {
      var r = params[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    });
  }

  function AppClass(appConfig, appContent, root) {
    this.appConfig = appConfig;
    this.appContent = appContent;
    this.root = root;
    this.$root = $(root);
    this.$settings = $('form[data-f2-view="settings"]', this.$root);
    this.ui = this.appConfig.ui;
    this.settings = {
      allowExternalAdd: true
    };
  }

  AppClass.prototype = {
    COOKIE_NAME: 'F2_Examples_Watchlist',
    data: [],
    DEFAULT_SYMBOLS: ['BA', 'BAC', 'GE', 'GS', 'INTC', 'CSCO']
  };

  AppClass.prototype.init = function() {
    this.ui.showMask(this.root);
    this.initLocalStorage();
    this.getData();
    this.initEvents();
  };

  AppClass.prototype.ROW = [
    '<tr data-row="{symbol}">',
      '<td class="first"><a href="#" title="{name} (Click to set {symbol} context)" data-context="{symbol}" data-context-name="{name}">{symbol}</a></td>',
      '<td><strong>{price}</strong></td>',
      '<td><small>{change} ({changePct})</small></td>',
      '<td><small>{volume}</small></td>',
      '<td><a href="#" title="Remove from watchlist" data-remove="{symbol}"><i class="glyphicon glyphicon-remove"></i></a></td>',
    '</tr>',
    '<tr class="hide" data-row-detail="{symbol}">',
      '<td colspan="5">',
        '<table class="table table-condensed">',
          '<thead>',
            '<tr>',
              '<th>Bid</th>',
              '<th>Ask</th>',
              '<th>Mkt Cap</th>',
              '<th>Last Trade</th>',
            '</tr>',
          '</thead>',
          '<tbody>',
            '<tr>',
              '<td>{bid}</td>',
              '<td>{ask}</td>',
              '<td>{cap}</td>',
              '<td>{asOfDate} {asOf}</td>',
            '</tr>',
          '</tbody>',
        '</table>',
      '</td>',
    '</tr>'
  ].join('');

  AppClass.prototype.initEvents = function() {
    // Remove symbol
    this.$root.on('click', 'a[data-remove]', $.proxy(function(e) {
      e.preventDefault();
      this.deleteSymbol($(e.currentTarget).attr('data-remove'));
    }, this));

    // Add symbol
    this.$root.on('click', 'button.add', $.proxy(function(e) {
      this.addSymbol($('input[name="lookup"]', this.$root).val());
    }, this));

    // Expand row
    this.$root.on('click', 'tr[data-row]', $.proxy(function(e) {
      var $this = $(e.currentTarget);
      $this.next().toggle();
    }, this));

    // Change container context
    this.$root.on('click', 'a[data-context]', $.proxy(function(e) {
      e.preventDefault();

      F2.Events.emit(F2.Constants.Events.APP_SYMBOL_CHANGE, {
        symbol: $(e.currentTarget).attr('data-context'),
        name: $(e.currentTarget).attr('data-context-name')
      });
    }, this));

    // Listen for this event from other apps who may send symbols
    if (this.settings.allowExternalAdd) {
      F2.Events.on(this.COOKIE_NAME + '_Add', $.proxy(function(data) {
        var symbolAlert = $('div.symbolAlert', this.$root);
        symbolAlert = (symbolAlert.length) ? symbolAlert : this._renderSymbolAlert();
        $('span:first', symbolAlert).text(data.symbol + ' has been added.');

        this.addSymbol(data.symbol);
      }, this));
    }

    // Bind save settings
    this.$root.on('click', 'button.save', $.proxy(function() {
      this._saveSettings();
    }, this));

    this.ui.Views.change($.proxy(function(view) {
      if (view === F2.Constants.Views.SETTINGS) {
        this._populateSettings();
      }
    }, this));
  };

  AppClass.prototype._saveSettings = function() {
    this.settings.allowExternalAdd = $('input[name=allowExternalAdd]', this.$settings).is(':checked');
    this.ui.Views.change(F2.Constants.Views.HOME);
  };

  AppClass.prototype._populateSettings = function() {
    $('input[name=allowExternalAdd]', this.$settings).attr('checked', this.settings.alltableswithkeys);
  };

  AppClass.prototype.getSymbols = function() {
    return this._retrieveStoredSymbols();
  };

  AppClass.prototype.setSymbols = function(syms) {
    this._storeSymbols(syms);
  };

  AppClass.prototype.addSymbol = function(sym) {
    if (sym) {
      this.ui.showMask(this.root);
      var s = this.getSymbols();
      s.push(sym.toUpperCase());
      this.setSymbols(s);

      $('input[name="lookup"]', this.$root).val('').focus();
      this.getData();
    } else {
      this.ui.Modals.alert('Please enter a symbol.');
    }
  };

  AppClass.prototype.deleteSymbol = function(sym) {
    this.ui.showMask(this.root);

    var curr = this.getSymbols();
    var updated = [];

    $.each(curr, function(idx, item) {
      if (sym !== item) {
        updated.push(item);
      }
    });

    if (!updated.length) {
      this.ui.Modals.alert('You have deleted all the symbols in your watchlist. For the purposes of this example app, the default symbols have been re-added to your list.');
      updated = this.DEFAULT_SYMBOLS;
    }

    this.setSymbols(updated);

    this.data = [];
    this.getData();
  };

  AppClass.prototype._supportsLocalStorage = function() {
    return Storage !== undefined;
  };

  AppClass.prototype.initLocalStorage = function() {
    if (this._supportsLocalStorage()) {
      if (localStorage[this.COOKIE_NAME] === undefined || localStorage[this.COOKIE_NAME] === '' || !localStorage[this.COOKIE_NAME]) {
        localStorage[this.COOKIE_NAME] = this.DEFAULT_SYMBOLS.join(',');
      }
    } else {
      if (!$.cookie(this.COOKIE_NAME) || $.cookie(this.COOKIE_NAME) === undefined || $.cookie(this.COOKIE_NAME) === '') {
        $.cookie(this.COOKIE_NAME, this.DEFAULT_SYMBOLS.join(','), {
          expires: 10
        });
      }
    }
  };

  AppClass.prototype._storeSymbols = function(syms) {
    if (this._supportsLocalStorage()) {
      localStorage[this.COOKIE_NAME] = syms.join(',');
    } else {
      $.cookie(this.COOKIE_NAME, syms.join(','), {
        expires: 10
      });
    }
  };

  AppClass.prototype._retrieveStoredSymbols = function() {
    if (this._supportsLocalStorage()) {
      return localStorage[this.COOKIE_NAME].split(',') || [];
    }

    return $.cookie(this.COOKIE_NAME).split(',') || [];
  };

  AppClass.prototype.drawSymbolList = function() {
    var table = [
      '<table class="table table-condensed">',
        '<thead>',
          '<tr>',
            '<th class="first">Symbol</th>',
            '<th>Last</th>',
            '<th>Change / Pct</th>',
            '<th>Volume</th>',
            '<th>&nbsp;</th>',
          '</tr>',
        '</thead>',
        '<tbody>'
    ];

    if (this.data.length < 1) {
      table.push('<tr><td class="first" colspan="5">No symbols (or the Yahoo! API failed).</td></tr>');
    } else {
      $.each(this.data, $.proxy(function(idx, item) {
        item = item || {};

        var quoteData = {
          name: item.Name,
          symbol: item.Symbol,
          price: appFormat.lastPrice(item.LastTradePriceOnly),
          change: appFormat.addColor(item.Change),
          changePct: appFormat.addColor(item.ChangeinPercent),
          volume: appFormat.getMagnitude(1, item.Volume, 'shortcap'),
          asOf: item.LastTradeTime,
          asOfDate: item.LastTradeDate,
          bid: appFormat.lastPrice(item.BidRealtime),
          ask: appFormat.lastPrice(item.AskRealtime),
          cap: item.MarketCapitalization
        };

        table.push(supplant(this.ROW, quoteData));
      }, this));
    }

    table.push('</tbody>', '</table>');

    $('div.watchlist', this.root).html(table.join(''));

    this.ui.updateHeight();
    this.ui.hideMask(this.root);
  };

  AppClass.prototype._renderSymbolAlert = function() {
    return $([
      '<div class="alert alert-success symbolAlert">',
      '<button type="button" class="close" data-dismiss="alert">&#215;</button>',
      '<span></span>',
      '</div>'
    ].join('')).prependTo($('.' + F2.Constants.Css.APP_CONTAINER, this.root));
  };

  AppClass.prototype.getData = function() {
    if (!this.getSymbols().length) {
      this.drawSymbolList();
      return;
    }

    var symInput = $.map(this.getSymbols(), function(item) {
      return '"' + item + '"';
    }).join(',');

    $.ajax({
      url: YQL_API_URL,
      data: {
        q: 'select * from yahoo.finance.quotes where symbol in (' + symInput + ')',
        format: 'json',
        env: 'store://datatables.org/alltableswithkeys'
      },
      dataType: 'jsonp',
      context: this
    }).done(function(jqxhr, txtStatus) {
      // Trap failed yahoo api
      if (!jqxhr.query.results) {
        jqxhr.query.results = {
          quote: {}
        };
      }

      this.data = [];

      // Yahoo's API returns an array of objects if you ask for multiple symbols
      // but a single object if you only ask for 1 symbol
      if (jqxhr.query.count !== 0) {
        if (jqxhr.query.count < 2) {
          this.data = [jqxhr.query.results.quote] || this.data;
        } else {
          this.data = jqxhr.query.results.quote || this.data;
        }
      }

      this.drawSymbolList();
    }).fail(function(jqxhr, txtStatus) {
      F2.log('OOPS. Yahoo! didn\'t work.');
      this.ui.Modals.alert('Your watchlist failed to load. Refresh.');
    });
  };

  return AppClass;

})();
