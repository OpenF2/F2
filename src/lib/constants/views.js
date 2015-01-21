/**
  The available view types to apps. The view should be specified by applying
  the {{#crossLink "F2.Constants.Css"}}{{/crossLink}}.APP\_VIEW class to the
  containing DOM Element. A DATA\_ATTRIBUTE attribute should be added to the
  Element as well which defines what view type is represented. The `hide`
  class can be applied to views that should be hidden by default.
  @class F2.Constants.Views
*/
module.exports = {
  /**
    The DATA_ATTRIBUTE should be placed on the DOM Element that contains the
    view.
    @property DATA_ATTRIBUTE
    @type string
    @static
    @final
  */
  DATA_ATTRIBUTE: 'data-f2-view',
  /**
    The ABOUT view gives details about the app.
    @property ABOUT
    @type string
    @static
    @final
  */
  ABOUT: 'about',
  /**
    The HELP view provides users with help information for using an app.
    @property HELP
    @type string
    @static
    @final
  */
  HELP: 'help',
  /**
    The HOME view is the main view for an app. This view should always be
    provided by an app.
    @property HOME
    @type string
    @static
    @final
  */
  HOME: 'home',
  /**
    The REMOVE view is a special view that handles the removal of an app from
    the container.
    @property REMOVE
    @type string
    @static
    @final
  */
  REMOVE: 'remove',
  /**
    The SETTINGS view provides users the ability to modify advanced settings
    for an app.
    @property SETTINGS
    @type string
    @static
    @final
  */
  SETTINGS: 'settings'
};
