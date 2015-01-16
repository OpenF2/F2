/* global F2, $, angular */

F2.Apps['com_openf2_examples_javascript_compareTool'] = (function() {

  function AppClass(appConfig, appContent, root) {
    this.appConfig = appConfig;
    this.appContent = appContent;
    this.ui = appConfig.ui;
    this.$root = $(root);
  }

  AppClass.prototype.init = function() {
    this.ui.setTitle('Compare Tool (AngularJS)');
    this.ui.updateHeight();

    // Manually bootstrap angular
    angular.bootstrap(this.$root, ['compareTool']);
  };

  return AppClass;

})();
