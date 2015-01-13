/* global F2, $, cdsFormatter */

F2.Apps['com_openf2_examples_javascript_cds'] = (function() {

  var CDS_API_URL = 'http://dev.markitondemand.com/Api/SovereignCDSMovers/jsonp';

  var TABLE_ROW = [
    '<tr>',
      '<td class="first">',
        '<a title="{name}" href="#" data-context="{name}" data-context-name="{name}">{name}</a>',
      '</td>',
      '<td>{spread}</td>',
      '<td>{changePct}</td>',
    '</tr>'
  ].join('');

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
    this.$settings = $('form[data-f2-view=settings]', this.$root);
    this.ui = this.appConfig.ui;
    this.settings = {
      allowExternalAdd: false
    };

    this.closeDate = null;
  }

  AppClass.prototype.init = function() {
    this.ui.showMask(this.root);
    this.getData();
    this.initEvents();
  };

  AppClass.prototype.initEvents = function() {
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

  AppClass.prototype.drawTable = function(tightenerRows, widenerRows) {
    var tableHeading = [
      '<table class="table table-condensed">',
        '<thead>',
          '<tr>',
            '<th class="first">Name</th>',
            '<th>Spread (bps)</th>',
            '<th>1 Day<br />% Change</th>',
          '</tr>',
        '</thead>',
        '<tbody>'
    ].join('');

    var tightenerTable = [
      tableHeading,
      tightenerRows,
      '</tbody>',
      '</table>'
    ].join('');

    var widenerTable = [
      tableHeading,
      widenerRows,
      '</tbody>',
      '</table>'
    ].join('');

    var tables = [
      '<h5>Global Daily Tighteners (five-year CDS)</h5>',
      tightenerTable,
      '<h5>Global Daily Wideners (five-year CDS)</h5>',
      widenerTable
    ].join('');

    $('div.cdsMovers', this.root).html(tables);

    this.ui.updateHeight();
    this.ui.hideMask(this.root);
  };

  AppClass.prototype.drawCdsList = function(useTighteners, cdsData) {
    var label = useTighteners ? 'Tightener' : 'Widener';

    if (!cdsData.length) {
      return '<tr><td class="first" colspan="5">CDS ' + label + ' data unavailable.</td></tr>';
    }

    // Update the "last updated" date
    if (!this.closeDate && cdsData[0].PrettyDate) {
      this.closeDate = cdsData[0].PrettyDate;
      $('p.cdsDate span', this.root).html(this.closeDate);
    }

    return $.map(cdsData, this.drawCdsListRow).join('');
  };

  AppClass.prototype.drawCdsListRow = function(item) {
    item = item || {};

    return supplant(TABLE_ROW, {
      name: item.LongName,
      spread: cdsFormatter.bps(item.ConvSpread),
      changePct: cdsFormatter.addColorPercent(item.DailyPercentChange)
    });
  };

  AppClass.prototype.getData = function() {
    var tightenerData = [];
    var widenerData = [];

    $.ajax({
      url: CDS_API_URL,
      data: {
        tightenersOnly: 1
      },
      dataType: 'jsonp',
      context: this
    }).done(function(jqxhr) {
      tightenerData.push(this.drawCdsList(true, jqxhr.Data || []));

      $.ajax({
        url: CDS_API_URL,
        data: {
          tightenersOnly: 0
        },
        dataType: 'jsonp',
        context: this
      }).done(function(jqxhr2) {
        widenerData.push(this.drawCdsList(false, jqxhr2.Data || []));
      }).fail(function(jqxh2r) {
        F2.log('OOPS. CDS Wideners data was unavailable.');
        widenerData.push(this.drawCdsList(false, []));
      }).always(function() {
        this.drawTable(tightenerData, widenerData);
      });
    }).fail(function(jqxhr) {
      F2.log('OOPS. CDS Tighteners data was unavailable.');
      tightenerData.push(this.drawCdsList(true, []));
      widenerData.push(this.drawCdsList(false, []));
      this.drawTable(tightenerData, widenerData);
    });
  };

  return AppClass;

})();
