/**
  CSS class constants
  @class F2.Constants.Css
*/
module.exports = {
  /**
    The APP class should be applied to the DOM Element that surrounds the
    entire app, including any extra html that surrounds the APP\_CONTAINER
    that is inserted by the container. See the
    {{#crossLink "F2.ContainerConfig"}}{{/crossLink}} object.
    @property APP
    @type string
    @static
    @final
  */
  APP: 'f2-app',
  /**
    The APP\_CONTAINER class should be applied to the outermost DOM Element
    of the app.
    @property APP_CONTAINER
    @type string
    @static
    @final
  */
  APP_CONTAINER: 'f2-app-container',
  /**
    The APP\_TITLE class should be applied to the DOM Element that contains
    the title for an app. If this class is not present, then
    F2.UI.{{#crossLink "F2.UI/setTitle"}}{{/crossLink}} will not function.
    @property APP_TITLE
    @type string
    @static
    @final
  */
  APP_TITLE: 'f2-app-title',
  /**
    The APP\_VIEW class should be applied to the DOM Element that contains
    a view for an app. The DOM Element should also have a
    {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.DATA_ATTRIBUTE
    attribute that specifies which
    {{#crossLink "F2.Constants.Views"}}{{/crossLink}} it is.
    @property APP_VIEW
    @type string
    @static
    @final
  */
  APP_VIEW: 'f2-app-view',
  /**
    APP\_VIEW\_TRIGGER class should be applied to the DOM Elements that
    trigger an
    {{#crossLink "F2.Constants.Events"}}{{/crossLink}}.APP\_VIEW\_CHANGE
    event. The DOM Element should also have a
    {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.DATA_ATTRIBUTE
    attribute that specifies which
    {{#crossLink "F2.Constants.Views"}}{{/crossLink}} it will trigger.
    @property APP_VIEW_TRIGGER
    @type string
    @static
    @final
  */
  APP_VIEW_TRIGGER: 'f2-app-view-trigger',
  /**
    The MASK class is applied to the overlay element that is created
    when the F2.UI.{{#crossLink "F2.UI/showMask"}}{{/crossLink}} method is
    fired.
    @property MASK
    @type string
    @static
    @final
  */
  MASK: 'f2-mask',
  /**
    The MASK_CONTAINER class is applied to the Element that is passed into
    the F2.UI.{{#crossLink "F2.UI/showMask"}}{{/crossLink}} method.
    @property MASK_CONTAINER
    @type string
    @static
    @final
  */
  MASK_CONTAINER: 'f2-mask-container'
};
