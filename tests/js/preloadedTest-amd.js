require(['../dist/f2.min.js'], function() {

  F2.Apps[TEST_APP_ID] = (function() {
    var App_Class = function(appConfig, appContent, root) {
      this.appConfig = appConfig;
      this.appContent = appContent;
      this.ui = appConfig.ui;
      this.$root = $(root);
      this.doNotCallAgain = false;
    };

    App_Class.prototype.init = function() {
      var context = this;
      F2.PreloadAppInitializedCounter++;

      F2.Events.on('PreloadAppCommuncation', function() {
        if (!context.doNotCallAgain) {
          context._handleEmit();
        }
      });

      F2.PreloadAppInitialized = true;
    };

    App_Class.prototype._handleEmit = function() {
      F2.PreloadRetrievedEmit = true;
      F2.PreloadRetrievedEmitCounter++;
      F2.PreloadTestCompleteCounter++;
      F2.PreloadTestComplete = true;
      this.doNotCallAgain = true;
    };

    return App_Class;
  })();

});
