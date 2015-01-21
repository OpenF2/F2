/**
  Allows the container to override individual parts of the AppManifest
  request. See properties and methods with the `xhr.` prefix.
  @property xhr
  @type Object
  @example
    F2.init({
      xhr: {
        url: function(url, appConfigs) {
          return 'http://example.com/proxy.php?url=' + encocdeURIComponent(url);
        }
      }
    });
*/
module.exports = {
  /**
    Allows the container to override the request data type (JSON or JSONP)
    that is used for the request.
    @method xhr.dataType
    @param {string} url The manifest url
    @param {Array} appConfigs An array of
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects
    @return {string} The request data type that should be used
    @example
      F2.init({
        xhr: {
          dataType: function(url) {
            return F2.isLocalRequest(url) ? 'json' : 'jsonp';
          },
          type: function(url) {
            return F2.isLocalRequest(url) ? 'POST' : 'GET';
          }
        }
      });
  */
  dataType: null,
  /**
    Allows the container to override the request method that is used (just
    like the `type` parameter to `jQuery.ajax()`.
    @method xhr.type
    @param {string} url The manifest url
    @param {Array} appConfigs An array of
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects
    @return {string} The request method that should be used
    @example
      F2.init({
        xhr: {
          dataType: function(url) {
            return F2.isLocalRequest(url) ? 'json' : 'jsonp';
          },
          type: function(url) {
            return F2.isLocalRequest(url) ? 'POST' : 'GET';
          }
        }
      });
  */
  type: null,
  /**
    Allows the container to override the url that is used to request an
    app's F2.{{#crossLink "F2.AppManifest"}}{{/crossLink}}.
    @method xhr.url
    @param {string} url The manifest url
    @param {Array} appConfigs An array of
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects
    @return {string} The url that should be used for the request
    @example
      F2.init({
        xhr: {
          url: function(url, appConfigs) {
            return 'http://example.com/proxy.php?url=' + encocdeURIComponent(url);
          }
        }
      });
  */
  url: null
};
