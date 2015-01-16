/* global F2, $ */

F2.Apps['com_openf2_examples_javascript_helloworld'] = (function() {

  function AppClass(appConfig, appContent, root) {
    this.appConfig = appConfig;
    this.appContent = appContent;
    this.ui = appConfig.ui;
    this.$root = $(root);
  }

  AppClass.prototype.init = function() {
    this.$root.on('click', 'a.testAlert', $.proxy(function() {
      this.ui.Modals.alert('Hello World!', function() {
        F2.log('callback fired!');
      });
    }, this));

    this.$root.on('click', 'a.testConfirm', $.proxy(function() {
      this.ui.Modals.confirm(
        'Hello World!', function() {
          F2.log('"Ok" callback fired!');
        }, function() {
          F2.log('"Cancel" callback fired!');
        }
      );
    }, this));

    // Bind symbol change event
    F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, $.proxy(this._handleSymbolChange, this));

    this.ui.setTitle(this._title());
    this.ui.updateHeight();
  };

  // Get the app's title
  AppClass.prototype._title = function(isSecure) {
    var prefix = this.appConfig.isSecure ? 'Secure' : '';
    return prefix + this.appConfig.name;
  };

  AppClass.prototype._handleSymbolChange = function(data) {
    var symbolAlert = $('div.symbolAlert', this.$root);
    symbolAlert = symbolAlert.length ? symbolAlert : this._renderSymbolAlert();
    $('span:first', symbolAlert).text('The symbol has been changed to ' + data.symbol);

    this.ui.updateHeight();
  };

  AppClass.prototype._renderSymbolAlert = function() {
    return $([
      '<div class="alert alert-success symbolAlert">',
      '<button type="button" class="close" data-dismiss="alert">&#215;</button>',
      '<span></span>',
      '</div>'
    ].join('')).prependTo($('.' + F2.Constants.Css.APP_CONTAINER, this.$root));
  };

  return AppClass;

})();
