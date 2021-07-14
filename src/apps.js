/**
 * The apps namespace is a place for app developers to put the javascript
 * class that is used to initialize their app. The javascript classes should
 * be namepaced with the {{#crossLink "F2.AppConfig"}}{{/crossLink}}.appId.
 * It is recommended that the code be placed in a closure to help keep the
 * global namespace clean.
 *
 * If the class has an 'init' function, that function will be called
 * automatically by F2.
 * @property Apps
 * @type object
 * @example
 *     F2.Apps["com_example_helloworld"] = (function() {
 *         var App_Class = function(appConfig, appContent, root) {
 *             this._app = appConfig; // the F2.AppConfig object
 *             this._appContent = appContent // the F2.AppManifest.AppContent object
 *             this.$root = root; // the root DOM Element that contains this app
 *         }
 *
 *         App_Class.prototype.init = function() {
 *             // perform init actions
 *         }
 *
 *         return App_Class;
 *     })();
 * @example
 *     F2.Apps["com_example_helloworld"] = function(appConfig, appContent, root) {
 *        return {
 *            init:function() {
 *                // perform init actions
 *            }
 *        };
 *     };
 * @for F2
 */
export default {};