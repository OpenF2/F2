F2.Apps['com_openf2_examples_nodejs_helloworld'] = (function() {
  var App = function(appConfig, appContent, root) {
    this.appConfig = appConfig;
    this.appContent = appContent;
    this.root = root;
    this.$root = root;
    this.ui = this.appConfig.ui;
    this.settings = {
      allowExternalAdd: false
    };
  };
  App.prototype.init = function() {
    F2.log("Hello World app init()");
    F2.Events.emit('com_openf2_examples_nodejs_helloworld-init', true);
  };
  App.prototype.destroy = function() {
    // initially set to false by the spec/test
    F2.destroyAppMethodCalled = true;
  };
  return App;
})();