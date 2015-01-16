/* global F2, $ */

F2.Apps['com_openf2_examples_javascript_helloworldlocale'] = (function() {

  var MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  function AppClass(appConfig, appContent, root) {
    this.appConfig = appConfig;
    this.appContent = appContent;
    this.ui = appConfig.ui;
    this.$root = $(root);
  }

  AppClass.prototype.init = function() {
    // Set current locale
    $('#current_locale', this.$root).html(this.appConfig.containerLocale || 'Not defined in <code>F2.init()</code>');
    $('#current_locale_date', this.$root).text(this._setCurrentDate(this.appConfig.containerLocale));

    // Bind symbol change event
    F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, $.proxy(this._handleSymbolChange, this));
    F2.Events.on(F2.Constants.Events.CONTAINER_LOCALE_CHANGE, $.proxy(this._handleLocaleChange, this));
  };

  AppClass.prototype._handleSymbolChange = function(data) {
    var symbolAlert = $('div.symbolAlert', this.$root);
    symbolAlert = (symbolAlert.length) ? symbolAlert : this._renderSymbolAlert();
    $('span:first', symbolAlert).text('The symbol has been changed to ' + data.symbol);

    this.ui.updateHeight();
  };

  AppClass.prototype._handleLocaleChange = function(data) {
    // Set current locale
    $('#current_locale', this.$root).text(data.locale);
    $('#current_locale_date', this.$root).text(this._setCurrentDate(data.locale));

    this.ui.updateHeight();
  };

  AppClass.prototype._formattedDate = function(date, locale) {
    if (locale === 'en-gb') {
      return date.getDate() + ' ' + MONTHS[date.getMonth()] + ' ' + date.getFullYear();
    }

    return MONTHS[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  };

  AppClass.prototype._setCurrentDate = function(locale) {
    var date = new Date();
    return this._formattedDate(date, locale);
  };

  return AppClass;

})();
