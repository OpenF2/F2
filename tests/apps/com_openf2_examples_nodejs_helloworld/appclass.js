F2.Apps['com_openf2_examples_nodejs_helloworld'] = (function(appConfig, appContent, root) {
  var App = function(appConfig, appContent, root) {
    this.appConfig = appConfig;
    this.appContent = appContent;
    this.root = root;
    if ($ && jQuery && typeof($) === "function" && $ === jQuery) {
      this.$root = $(root);
    }
    this.ui = this.appConfig.ui;
    this.settings = {
      allowExternalAdd: false
    };
  };
  App.prototype.init = function() {
    F2.log("Hello World app init()");
  };
  return App;
})();;