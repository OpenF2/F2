/**
  The App Class is an optional class that can be namespaced onto the
  {{#crossLink "F2\Apps"}}{{/crossLink}} namespace. The
  [F2 Docs](../../app-development.html#app-class) has more information on the
  usage of the App Class.
  @class F2.App
  @constructor
  @param {F2.AppConfig} appConfig The F2.AppConfig object for the app
  @param {F2.AppManifest.AppContent} appContent The F2.AppManifest.AppContent
  object
  @param {Element} root The root DOM Element for the app
*/
module.exports = function(appConfig, appContent, root) {
  return {
    /**
      An optional init function that will automatically be called when
      F2.{{#crossLink "F2\registerApps"}}{{/crossLink}} is called.
      @method init
      @optional
    */
    init: function() {}
  };
};
